<script lang="ts">
import { onMount } from "svelte";
import { BastionService } from "$lib/entities/bastion/domain/BastionService";
import { InMemoryBastionRepository } from "$lib/entities/bastion/infrastructure/InMemoryBastionRepository";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "$lib/entities/bastion/model/bastionSchema";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";

// Props
interface Props {
	characters: CharacterRecord[];
}
let { characters }: Props = $props();

// Repositório e Serviço locais para fallback/modo híbrido
const localRepository = new InMemoryBastionRepository();
const localService = new BastionService(localRepository);

// Estados Reativos do Svelte 5 (Runes)
let bastion = $state<BastionRecord | null>(null);
let modules = $state<BastionModuleRecord[]>([]);

// Inputs
let newBastionName = $state("O Forte da Alvorada");
let selectedChassis = $state("fortaleza_pedra");
let goldAmount = $state<number>(0);

// Ação de Obra
let selectedCharacterId = $state("");
let selectedModuleId = $state("");
let selectedModuleTier = $state(1);
let testRoll = $state(10);
let isCritTest = $state(false);

// Catálogo de Módulos para Compra
const moduleCatalog = [
	{
		id: "horta_alquimia",
		name: "Horta de Alquimia",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Gera essências alquímicas a cada recesso.",
	},
	{
		id: "ferraria_reparo",
		name: "Ferraria de Reparo",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Corta os custos de reparos pela metade.",
	},
	{
		id: "dormitorio_comum",
		name: "Dormitório Comum",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Aumenta limite de Especialistas contratados.",
	},
	{
		id: "cofre_reforcado",
		name: "Cofre Reforçado",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+1.000 PO de limite seguro no cofre.",
	},
	{
		id: "muralha_madeira",
		name: "Muralha de Madeira",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+2 de Estrutura para a base.",
	},
	{
		id: "posto_vigia",
		name: "Posto de Vigia",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+2 de Vigilância para a base.",
	},
	{
		id: "muralha_pedra",
		name: "Muralha de Pedra",
		tier: 2,
		cost: 1500,
		dc: 20,
		desc: "+4 de Estrutura (Exige troféu T2).",
	},
	{
		id: "laboratorio_destilacao",
		name: "Laboratório de Destilação",
		tier: 2,
		cost: 1500,
		dc: 20,
		desc: "+2 em testes de alquimia.",
	},
	{
		id: "cofre_dimensional",
		name: "Cofre Dimensional (Menor)",
		tier: 3,
		cost: 5000,
		dc: 25,
		desc: "Riqueza não gera Ameaça até 10.000 PO.",
	},
	{
		id: "muralha_runica",
		name: "Muralha Rúnica Absoluta",
		tier: 4,
		cost: 20000,
		dc: 30,
		desc: "+10 de Estrutura e imunidade mágica.",
	},
];

// Logs e Notificações de Eventos de Downtime
let logs = $state<string[]>([]);
let successNotification = $state<string | null>(null);
let errorNotification = $state<string | null>(null);

// Helpers de Atributos Decorados Reativos
let currentStructure = $derived(
	bastion ? calculateDecoratedStructure(bastion, modules) : 1,
);
let currentVigilance = $derived(
	bastion ? calculateDecoratedVigilance(bastion, modules) : 1,
);
let currentLogistics = $derived(
	bastion ? calculateDecoratedLogistics(bastion, modules) : 1,
);
let maxHp = $derived(bastion ? currentStructure * 10 + bastion.tier * 20 : 10);
let maxGoldCapacity = $derived(
	bastion ? calculateDecoratedGoldCapacity(bastion, modules) : 1000,
);
let currentMaintenanceCost = $derived(
	bastion ? calculateDecoratedMaintenance(bastion, modules) : 0,
);

onMount(async () => {
	await loadBastionFromStore();
	if (characters.length > 0) {
		selectedCharacterId = characters[0].id;
	}
});

function log(msg: string) {
	logs = [msg, ...logs].slice(0, 10);
}

function triggerSuccess(msg: string) {
	successNotification = msg;
	setTimeout(() => {
		successNotification = null;
	}, 4000);
}

function triggerError(msg: string) {
	errorNotification = msg;
	setTimeout(() => {
		errorNotification = null;
	}, 4000);
}

// Funções de Cálculo Estático Simulando Decorators reativamente no Svelte
function calculateDecoratedStructure(
	b: BastionRecord,
	mods: BastionModuleRecord[],
): number {
	const woodenCount = mods.filter(
		(m) =>
			m.moduleId === "muralha_madeira" &&
			m.progressCurrent >= m.progressMax &&
			!m.isBroken,
	).length;
	const stoneCount = mods.filter(
		(m) =>
			m.moduleId === "muralha_pedra" &&
			m.progressCurrent >= m.progressMax &&
			!m.isBroken,
	).length;
	const runicCount = mods.filter(
		(m) =>
			m.moduleId === "muralha_runica" &&
			m.progressCurrent >= m.progressMax &&
			!m.isBroken,
	).length;
	return b.structure + woodenCount * 2 + stoneCount * 4 + runicCount * 10;
}

function calculateDecoratedVigilance(
	b: BastionRecord,
	mods: BastionModuleRecord[],
): number {
	const watchCount = mods.filter(
		(m) =>
			m.moduleId === "posto_vigia" &&
			m.progressCurrent >= m.progressMax &&
			!m.isBroken,
	).length;
	return b.vigilance + watchCount * 2;
}

function calculateDecoratedLogistics(
	b: BastionRecord,
	mods: BastionModuleRecord[],
): number {
	return b.logistics;
}

function calculateDecoratedGoldCapacity(
	b: BastionRecord,
	mods: BastionModuleRecord[],
): number {
	const reinforcedCount = mods.filter(
		(m) =>
			m.moduleId === "cofre_reforcado" &&
			m.progressCurrent >= m.progressMax &&
			!m.isBroken,
	).length;
	const baseCapacity = calculateDecoratedVigilance(b, mods) * 1000;
	return baseCapacity + reinforcedCount * 1000;
}

function calculateDecoratedMaintenance(
	b: BastionRecord,
	mods: BastionModuleRecord[],
): number {
	const activeCount = mods.filter(
		(m) => m.progressCurrent >= m.progressMax && !m.isBroken,
	).length;
	const baseCost = b.tier * 100 + activeCount * 50;
	const logistics = calculateDecoratedLogistics(b, mods);
	const discountPercent = Math.min(logistics * 10, 90);
	return baseCost - Math.floor((baseCost * discountPercent) / 100);
}

// Chamadas à Persistência Local-First (Híbrida)
async function loadBastionFromStore() {
	try {
		// Se o worker estiver injetado e ativo, tenta ler o banco SQLite
		if (window.databaseWorker) {
			// Simulação ou chamada real
			// Como podemos não ter bastiões na base ainda, lemos a lista e pegamos o primeiro
			const response = await window.databaseWorker.postRequest({
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			});
			if (response.success && response.data?.snapshot) {
				const snap = response.data.snapshot;
				if (snap.bastions && snap.bastions.length > 0) {
					bastion = snap.bastions[0];
					modules = snap.bastionModules || [];
					// Carrega para o repositório local de fallback também
					await localRepository.save(bastion!);
					for (const m of modules) {
						await localRepository.saveModule(m);
					}
					return;
				}
			}
		}
	} catch (e) {
		console.warn(
			"Falha ao ler Bastião via RPC/Worker. Usando persistência local na memória.",
		);
	}

	// Fallback se não fundado na base do worker
	const r = localRepository.bastions[0];
	if (r) {
		bastion = r;
		const list = await localRepository.findModulesByBastionId(r.id);
		if (list.success) {
			modules = [...list.data];
		}
	}
}

async function saveBastionToStore() {
	if (!bastion) return;
	try {
		if (window.databaseWorker) {
			await window.databaseWorker.postRequest({
				type: "SAVE_BASTION",
				payload: { bastion },
			});
			for (const m of modules) {
				await window.databaseWorker.postRequest({
					type: "SAVE_BASTION_MODULE",
					payload: { module: m },
				});
			}
		}
	} catch (e) {
		console.warn("Falha ao persistir Bastião no worker.");
	}
	// Sempre salva localmente
	await localRepository.save(bastion);
	for (const m of modules) {
		await localRepository.saveModule(m);
	}
}

// Ações da Interface
async function handleFundBastion() {
	const res = await localService.foundBastion(newBastionName, selectedChassis);
	if (res.success) {
		bastion = res.data;
		modules = [];
		await saveBastionToStore();
		triggerSuccess(`Bastião fundado com sucesso! Chassi: ${selectedChassis}`);
		log(`[Fundação] O Bastião ${bastion.name} foi estabelecido.`);
	} else {
		triggerError(res.error.message);
	}
}

async function handleDepositGold() {
	if (!bastion || goldAmount <= 0) return;
	bastion.vaultGold += goldAmount;
	goldAmount = 0;
	await saveBastionToStore();
	triggerSuccess("Ouro depositado com sucesso!");
	log(`[Cofre] Depositado ouro. Total atual: ${bastion.vaultGold} PO.`);
}

async function handleWithdrawGold() {
	if (!bastion || goldAmount <= 0) return;
	if (bastion.vaultGold < goldAmount) {
		triggerError("Ouro insuficiente no cofre!");
		return;
	}
	bastion.vaultGold -= goldAmount;
	goldAmount = 0;
	await saveBastionToStore();
	triggerSuccess("Ouro sacado com sucesso!");
	log(`[Cofre] Sacado ouro. Total atual: ${bastion.vaultGold} PO.`);
}

async function handleStartBuild(catalogItem: (typeof moduleCatalog)[number]) {
	if (!bastion) return;
	if (bastion.vaultGold < catalogItem.cost) {
		triggerError("Recursos insuficientes no cofre para iniciar a obra!");
		return;
	}

	// Desconta o custo inicial de PO do cofre
	bastion.vaultGold -= catalogItem.cost;
	const res = await localService.startModule(
		bastion.id,
		catalogItem.id,
		catalogItem.tier,
	);
	if (res.success) {
		const list = await localRepository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}
		await saveBastionToStore();
		triggerSuccess(`Obra do módulo ${catalogItem.name} iniciada!`);
		log(
			`[Obra] Iniciados reparos e obras de ${catalogItem.name}. Custo: ${catalogItem.cost} PO.`,
		);
	} else {
		triggerError(res.error.message);
	}
}

function getSecureRandom(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / 4294967296;
}

async function handleAdvanceObra(mRecord: BastionModuleRecord) {
	if (!bastion) return;

	const char = characters.find((c) => c.id === selectedCharacterId);
	if (!char) {
		triggerError("Selecione um Andarilho ativo!");
		return;
	}

	const catalog = moduleCatalog.find((i) => i.id === mRecord.moduleId);
	const dc = catalog ? catalog.dc : 15;

	// Rola o dado (matriz/mental)
	const mental = char.mental;
	// Rola teste local
	const d20 = isCritTest ? 20 : Math.floor(getSecureRandom() * 20) + 1;

	const res = await localService.advanceModuleObra(mRecord.id, mental, d20, dc);
	if (res.success) {
		const list = await localRepository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}
		await saveBastionToStore();

		const added = res.data.progressAdded;
		const completed = res.data.completed;

		if (d20 === 20) {
			log(
				`[Obra Crítica!] Andarilho ${char.name} tirou um 20 natural! Adicionados +3 pontos de obra no módulo ${catalog?.name}.`,
			);
		} else if (added > 0) {
			log(
				`[Obra] Andarilho ${char.name} obteve sucesso na rolagem (Mental: ${mental} + Dado: ${d20} = ${mental + d20} vs DC ${dc}). +1 ponto em ${catalog?.name}.`,
			);
		} else {
			log(
				`[Obra Falha] Rolagem insuficiente por ${char.name} (${mental + d20} vs DC ${dc}). Nenhum progresso adicionado.`,
			);
		}

		if (completed) {
			triggerSuccess(`O módulo ${catalog?.name} foi concluído!`);
			log(`[Estrutura] O módulo ${catalog?.name} está totalmente operacional!`);
		}
	} else {
		triggerError(res.error.message);
	}
}

async function handleEndRecess() {
	if (!bastion) return;
	const res = await localService.processRecessEnd(bastion.id);
	if (res.success) {
		const updated = await localRepository.findById(bastion.id);
		if (updated.success) {
			bastion = updated.data;
		}
		await saveBastionToStore();

		const cost = res.data.maintenanceCost;
		const threat = res.data.threatGained;

		log(
			`[Passagem de Turno] Recesso finalizado. Taxa de Manutenção cobrada: ${cost} PO.`,
		);
		if (threat > 0) {
			log(
				`[Ameaça!] Rumores e luxúria sobre a riqueza do cofre geraram +${threat} Ameaça à base.`,
			);
		}

		// Testa Crise se Ameaça chegou no topo (10)
		if (bastion.threatCurrent >= 10) {
			triggerError(
				"CRITICAL EVENT: Ameaça atingiu nível 10! A base está sob cerco ou crise!",
			);
			log(
				`[Alerta Vermelho] A ameaça atingiu nível máximo (10/10). Um evento de cerco militar ou motim foi disparado!`,
			);
		} else {
			triggerSuccess("Recesso processado e salvo!");
		}
	} else {
		triggerError(res.error.message);
	}
}

function handleAddThreat() {
	if (!bastion) return;
	bastion.threatCurrent = Math.min(10, bastion.threatCurrent + 1);
	saveBastionToStore();
	log(`[Perigo] Ameaça aumentada manualmente para: ${bastion.threatCurrent}.`);
}

function handleReduceThreat() {
	if (!bastion) return;
	bastion.threatCurrent = Math.max(0, bastion.threatCurrent - 1);
	saveBastionToStore();
	log(
		`[Segurança] Ameaça reduzida manualmente para: ${bastion.threatCurrent}.`,
	);
}
</script>

<div class="bastion-container">
	{#if successNotification}
		<div class="alert success-alert animate-fade">
			<span>✔️ {successNotification}</span>
		</div>
	{/if}
	{#if errorNotification}
		<div class="alert error-alert animate-fade">
			<span>⚠️ {errorNotification}</span>
		</div>
	{/if}

	{#if !bastion}
		<!-- Fundação de Bastião -->
		<div class="panel foundation-panel">
			<h2>Fundar Base de Operações (Bastião)</h2>
			<p class="subtitle">O aventureiro sobrevive à noite; o líder constrói o amanhecer.</p>
			
			<div class="input-group">
				<label for="bname">Nome do Bastião:</label>
				<input id="bname" type="text" bind:value={newBastionName} placeholder="Ex: Forte da Nevoeiro" />
			</div>

			<div class="chassis-grid">
				<label class="chassis-card" class:selected={selectedChassis === "fortaleza_pedra"}>
					<input type="radio" bind:group={selectedChassis} value="fortaleza_pedra" />
					<div class="card-content">
						<h3>Fortaleza de Pedra</h3>
						<span class="bonus">+2 Estrutura</span>
						<p>Ignora o primeiro Dano de Integridade sofrido em qualquer cerco.</p>
					</div>
				</label>
				
				<label class="chassis-card" class:selected={selectedChassis === "taverna_guilda"}>
					<input type="radio" bind:group={selectedChassis} value="taverna_guilda" />
					<div class="card-content">
						<h3>Taverna / Guilda Urbana</h3>
						<span class="bonus">+2 Vigilância</span>
						<p>Corte pela metade a geração de ameaça por acúmulo de riqueza.</p>
					</div>
				</label>

				<label class="chassis-card" class:selected={selectedChassis === "galeao"}>
					<input type="radio" bind:group={selectedChassis} value="galeao" />
					<div class="card-content">
						<h3>Galeão Marítimo</h3>
						<span class="bonus">+2 Logística</span>
						<p>Reduz custos de manutenção na base de forma permanente (-20%).</p>
					</div>
				</label>

				<label class="chassis-card" class:selected={selectedChassis === "torre_arcana"}>
					<input type="radio" bind:group={selectedChassis} value="torre_arcana" />
					<div class="card-content">
						<h3>Torre Arcana</h3>
						<span class="bonus">+1 Est, +1 Vig</span>
						<p>Conduíte de magia. Bônus para fabricação de Itens Mágicos.</p>
					</div>
				</label>
			</div>

			<button class="btn btn-primary" onclick={handleFundBastion}>Fundar Bastião</button>
		</div>
	{:else}
		<!-- Painel Principal do Bastião -->
		<div class="bastion-grid">
			<!-- Ficha e Cofre -->
			<div class="left-column">
				<div class="panel status-panel glass">
					<div class="header">
						<h1>{bastion.name}</h1>
						<span class="badge chassis-badge">{bastion.chassisId.replace("_", " ").toUpperCase()}</span>
					</div>

					<div class="attributes-grid">
						<div class="attr-box">
							<span class="label">Estrutura</span>
							<span class="val">{currentStructure}</span>
						</div>
						<div class="attr-box">
							<span class="label">Vigilância</span>
							<span class="val">{currentVigilance}</span>
						</div>
						<div class="attr-box">
							<span class="label">Logística</span>
							<span class="val">{currentLogistics}</span>
						</div>
					</div>

					<!-- HP / Integridade -->
					<div class="stat-row">
						<div class="stat-header">
							<span>Integridade Física (Vida)</span>
							<span>{bastion.integrityCurrent} / {maxHp} HP</span>
						</div>
						<div class="progress-bar-bg">
							<div class="progress-bar-fill hp-fill" style="width: {(bastion.integrityCurrent / maxHp) * 100}%"></div>
						</div>
					</div>

					<!-- Ameaça -->
					<div class="stat-row">
						<div class="stat-header">
							<span>Ameaça Passiva (Perigo)</span>
							<span class:danger={bastion.threatCurrent >= 8}>{bastion.threatCurrent} / 10</span>
						</div>
						<div class="progress-bar-bg">
							<div class="progress-bar-fill threat-fill" style="width: {bastion.threatCurrent * 10}%"></div>
						</div>
						<div class="btn-threat-actions">
							<button class="btn btn-sm btn-outline" onclick={handleReduceThreat}>- Reduzir</button>
							<button class="btn btn-sm btn-outline" onclick={handleAddThreat}>+ Elevar</button>
						</div>
					</div>
				</div>

				<!-- Cofre Reforçado -->
				<div class="panel vault-panel glass">
					<h2>Cofre da Fortaleza</h2>
					<div class="vault-info">
						<div class="gold-box">
							<span class="label">Ouro Armazenado</span>
							<span class="val">{bastion.vaultGold} PO</span>
						</div>
						<div class="gold-box">
							<span class="label">Ocultação Limite</span>
							<span class="val">{maxGoldCapacity} PO</span>
						</div>
					</div>
					
					{#if bastion.vaultGold > maxGoldCapacity}
						<div class="alert warn-alert">
							⚠️ O cofre excedeu o limite seguro! Gerando +{Math.floor((bastion.vaultGold - maxGoldCapacity) / 500)} Ameaça/semana.
						</div>
					{/if}

					<div class="vault-actions">
						<input type="number" bind:value={goldAmount} min="1" placeholder="Quantia de Ouro" />
						<div class="btn-group">
							<button class="btn btn-primary" onclick={handleDepositGold}>Depositar</button>
							<button class="btn btn-outline" onclick={handleWithdrawGold}>Sacar</button>
						</div>
					</div>
				</div>

				<!-- Log de Exploração -->
				<div class="panel log-panel glass">
					<h2>Histórico de Recesso</h2>
					<div class="logs-container">
						{#each logs as logMsg}
							<div class="log-entry">{logMsg}</div>
						{/each}
						{#if logs.length === 0}
							<p class="empty">Nenhum evento registrado nesta semana.</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Obras e Recesso -->
			<div class="right-column">
				<!-- Módulos em Construção -->
				<div class="panel build-panel glass">
					<h2>Projetos de Obra Ativos</h2>
					{#if modules.length === 0}
						<p class="empty">Nenhum projeto de obra no momento.</p>
					{/if}

					<div class="active-modules-list">
						{#each modules as m}
							{@const cat = moduleCatalog.find((item) => item.id === m.moduleId)}
							<div class="module-card-active">
								<div class="module-header">
									<div>
										<h3>{cat?.name || m.moduleId}</h3>
										<span class="tier-label">Tier {m.tier}</span>
									</div>
									{#if m.progressCurrent >= m.progressMax}
										<span class="status-done">Ativo</span>
									{:else}
										<span class="status-building">Em Obra</span>
									{/if}
								</div>

								<div class="module-progress">
									<div class="stat-header">
										<span>Progresso da Obra</span>
										<span>{m.progressCurrent} / {m.progressMax}</span>
									</div>
									<div class="progress-bar-bg">
										<div class="progress-bar-fill work-fill" style="width: {(m.progressCurrent / m.progressMax) * 100}%"></div>
									</div>
								</div>

								{#if m.progressCurrent < m.progressMax}
									<div class="work-action-row">
										<select bind:value={selectedCharacterId}>
											{#each characters as c}
												<option value={c.id}>{c.name} (Mental: {c.mental})</option>
											{/each}
										</select>
										<button class="btn btn-sm btn-primary" onclick={() => handleAdvanceObra(m)}>
											🔨 Bater Martelo
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Catálogo de Obras -->
				<div class="panel catalog-panel glass">
					<div class="catalog-header">
						<h2>Catálogo de Módulos</h2>
						<span class="maintenance-cost">Manutenção Total Estimada: {currentMaintenanceCost} PO / recesso</span>
					</div>

					<div class="catalog-grid">
						{#each moduleCatalog as cItem}
							<div class="catalog-item">
								<div class="item-header">
									<h3>{cItem.name}</h3>
									<span class="cost-tag">{cItem.cost} PO</span>
								</div>
								<p class="desc">{cItem.desc}</p>
								<div class="item-footer">
									<span class="dc-tag">Teste: DC {cItem.dc} (Mental)</span>
									<button class="btn btn-sm btn-outline" onclick={() => handleStartBuild(cItem)}>
										Iniciar Obra
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Ação Final de Downtime -->
				<div class="panel control-panel glass">
					<h2>Passagem de Tempo Livre</h2>
					<p>Roda a cobrança de salários, reparos estruturais e ameaça ao fim de uma semana de recesso.</p>
					<button class="btn btn-danger btn-large" onclick={handleEndRecess}>Passar Turno / Fim de Recesso</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Design Aesthetic - Dark Fantasy, Glassmorphism, Harmonious HSL */
	.bastion-container {
		font-family: 'Outfit', sans-serif;
		color: #e2e8f0;
		padding: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
		background: radial-gradient(circle at top, #1e1b4b 0%, #0f0a1e 100%);
		min-height: 100vh;
	}

	.panel {
		background: rgba(30, 27, 75, 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	}

	h2 {
		color: #a78bfa;
		font-size: 1.5rem;
		margin-top: 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.1);
		padding-bottom: 0.5rem;
	}

	.subtitle {
		color: #94a3b8;
		font-style: italic;
		margin-bottom: 2rem;
	}

	/* Inputs e Botões */
	.input-group {
		margin-bottom: 1.5rem;
	}

	.input-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #cbd5e1;
	}

	input[type="text"], input[type="number"], select {
		background: rgba(15, 10, 30, 0.8);
		border: 1px solid rgba(139, 92, 246, 0.4);
		color: #e2e8f0;
		padding: 0.75rem;
		border-radius: 6px;
		width: 100%;
		font-size: 1rem;
		outline: none;
		transition: border 0.2s;
	}

	input:focus, select:focus {
		border-color: #8b5cf6;
	}

	.btn {
		cursor: pointer;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 1rem;
		transition: background-color 0.2s, transform 0.1s;
		border: none;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn-primary {
		background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
		color: #fff;
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
	}

	.btn-outline {
		background: transparent;
		border: 1px solid #8b5cf6;
		color: #c084fc;
	}

	.btn-outline:hover {
		background: rgba(139, 92, 246, 0.1);
	}

	.btn-danger {
		background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
		color: #fff;
		width: 100%;
	}

	.btn-danger:hover {
		background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
	}

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	/* Grid de Chassis */
	.chassis-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.chassis-card {
		cursor: pointer;
		position: relative;
		display: block;
	}

	.chassis-card input {
		position: absolute;
		opacity: 0;
	}

	.card-content {
		background: rgba(15, 10, 30, 0.4);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 8px;
		padding: 1.25rem;
		height: 100%;
		transition: border-color 0.2s, background-color 0.2s;
	}

	.chassis-card input:checked + .card-content {
		border-color: #8b5cf6;
		background: rgba(139, 92, 246, 0.15);
	}

	.chassis-card h3 {
		margin: 0;
		color: #e2e8f0;
	}

	.chassis-card .bonus {
		display: inline-block;
		margin-top: 0.25rem;
		margin-bottom: 0.75rem;
		color: #34d399;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.chassis-card p {
		margin: 0;
		font-size: 0.875rem;
		color: #94a3b8;
	}

	/* Ficha Grid */
	.bastion-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.header h1 {
		font-size: 2rem;
		margin: 0;
		color: #f8fafc;
	}

	.chassis-badge {
		background: rgba(139, 92, 246, 0.2);
		color: #c084fc;
		border: 1px solid rgba(139, 92, 246, 0.4);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.attr-box {
		background: rgba(15, 10, 30, 0.6);
		border-radius: 8px;
		padding: 1rem;
		text-align: center;
		border: 1px solid rgba(139, 92, 246, 0.1);
	}

	.attr-box .label {
		display: block;
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		margin-bottom: 0.25rem;
	}

	.attr-box .val {
		font-size: 1.75rem;
		font-weight: 700;
		color: #a78bfa;
	}

	/* Barras de Progresso */
	.stat-row {
		margin-bottom: 1.25rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: #cbd5e1;
		margin-bottom: 0.5rem;
	}

	.progress-bar-bg {
		background: rgba(15, 10, 30, 0.8);
		border-radius: 9999px;
		height: 10px;
		overflow: hidden;
		border: 1px solid rgba(139, 92, 246, 0.2);
	}

	.progress-bar-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s;
	}

	.hp-fill {
		background: linear-gradient(90deg, #10b981, #059669);
	}

	.threat-fill {
		background: linear-gradient(90deg, #f59e0b, #ef4444);
	}

	.work-fill {
		background: linear-gradient(90deg, #8b5cf6, #3b82f6);
	}

	.btn-threat-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	/* Cofre */
	.vault-info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.gold-box {
		background: rgba(15, 10, 30, 0.4);
		border-radius: 8px;
		padding: 0.75rem;
		text-align: center;
	}

	.gold-box .label {
		display: block;
		font-size: 0.75rem;
		color: #94a3b8;
		margin-bottom: 0.25rem;
	}

	.gold-box .val {
		font-size: 1.25rem;
		font-weight: 700;
		color: #eab308;
	}

	.vault-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.vault-actions input {
		max-width: 150px;
	}

	.btn-group {
		display: flex;
		gap: 0.5rem;
		flex-grow: 1;
	}

	.btn-group button {
		flex: 1;
	}

	/* Logs */
	.logs-container {
		background: rgba(15, 10, 30, 0.6);
		border-radius: 8px;
		height: 200px;
		overflow-y: auto;
		padding: 0.75rem;
		border: 1px solid rgba(139, 92, 246, 0.1);
	}

	.log-entry {
		font-size: 0.875rem;
		color: #cbd5e1;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.05);
		padding-bottom: 0.25rem;
	}

	/* Módulos */
	.active-modules-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.module-card-active {
		background: rgba(15, 10, 30, 0.4);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 8px;
		padding: 1rem;
	}

	.module-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.module-header h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.tier-label {
		font-size: 0.75rem;
		color: #a78bfa;
	}

	.status-done {
		color: #10b981;
		font-weight: 700;
		font-size: 0.75rem;
	}

	.status-building {
		color: #3b82f6;
		font-weight: 700;
		font-size: 0.75rem;
	}

	.work-action-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.work-action-row select {
		flex-grow: 1;
	}

	/* Catálogo */
	.catalog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.catalog-header h2 {
		margin: 0;
		border: none;
		padding: 0;
	}

	.maintenance-cost {
		font-size: 0.875rem;
		color: #cbd5e1;
	}

	.catalog-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.catalog-item {
		background: rgba(15, 10, 30, 0.4);
		border: 1px solid rgba(139, 92, 246, 0.1);
		border-radius: 8px;
		padding: 1rem;
		transition: border-color 0.2s;
	}

	.catalog-item:hover {
		border-color: rgba(139, 92, 246, 0.4);
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-header h3 {
		margin: 0;
		font-size: 1rem;
		color: #e2e8f0;
	}

	.cost-tag {
		color: #eab308;
		font-weight: 700;
	}

	.catalog-item .desc {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: #94a3b8;
	}

	.item-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
	}

	.dc-tag {
		font-size: 0.75rem;
		color: #a78bfa;
	}

	/* Alertas */
	.alert {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.success-alert {
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.4);
		color: #34d399;
	}

	.error-alert {
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.4);
		color: #f87171;
	}

	.warn-alert {
		background: rgba(245, 158, 11, 0.15);
		border: 1px solid rgba(245, 158, 11, 0.4);
		color: #fbbf24;
		margin: 1rem 0;
	}

	.empty {
		color: #94a3b8;
		font-style: italic;
		text-align: center;
		padding: 1.5rem;
	}

	.danger {
		color: #f87171;
		font-weight: 700;
	}

	/* Animações e Efeitos */
	.animate-fade {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-5px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
