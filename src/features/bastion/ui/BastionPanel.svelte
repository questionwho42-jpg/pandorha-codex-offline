<script lang="ts">
import { onMount } from "svelte";
import {
	BaseBastionStats,
	BastionService,
	LogisticsDiscountDecorator,
	ReinforcedVaultDecorator,
	StoneWallDecorator,
	WatchPostDecorator,
	WoodenWallDecorator,
} from "$lib/entities/bastion/domain/BastionService";
import { WorkerBastionRepository } from "$lib/entities/bastion/infrastructure/WorkerBastionRepository";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "$lib/entities/bastion/model/bastionSchema";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup
import DowntimeProjectList from "./DowntimeProjectList.svelte";
import { moduleCatalog } from "./moduleCatalog";

// Props do Svelte 5 usando Runes
interface Props {
	characters: CharacterRecord[];
}
let { characters }: Props = $props();

// Repositório e Serviço Concretos via RPC/Worker
const repository = new WorkerBastionRepository();
const service = new BastionService(repository);

// Estados Reativos do Svelte 5 (Runes)
let bastion = $state<BastionRecord | null>(null);
let modules = $state<BastionModuleRecord[]>([]);

// Inputs
let newBastionName = $state("O Forte da Alvorada");
let selectedChassis = $state("fortaleza_pedra");
let goldAmount = $state<number>(0);

// Logs e Notificações de Eventos de Downtime
let logs = $state<string[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let successNotification = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let errorNotification = $state<string | null>(null);

// Padrão DECORATOR Reativo: Orquestração dinamicamente aplicada sobre os dados reativos
const decoratedStats = $derived.by(() => {
	if (!bastion) return null;
	// Componente Concreto
	let stats = new BaseBastionStats(bastion, modules);
	// Decoradores aplicados cumulativamente (efeito cebola)
	stats = new LogisticsDiscountDecorator(stats);
	stats = new ReinforcedVaultDecorator(stats, modules);
	stats = new WatchPostDecorator(stats, modules);
	stats = new WoodenWallDecorator(stats, modules);
	stats = new StoneWallDecorator(stats, modules);
	return stats;
});

let currentStructure = $derived(
	decoratedStats ? decoratedStats.getStructure() : 1,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let currentVigilance = $derived(
	decoratedStats ? decoratedStats.getVigilance() : 1,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let currentLogistics = $derived(
	decoratedStats ? decoratedStats.getLogistics() : 1,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let maxHp = $derived(bastion ? currentStructure * 10 + bastion.tier * 20 : 10);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let maxGoldCapacity = $derived(
	decoratedStats ? decoratedStats.getVaultCapacity() : 1000,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let currentMaintenanceCost = $derived(
	decoratedStats ? decoratedStats.getMaintenanceCost() : 0,
);

onMount(async () => {
	await loadBastionFromStore();
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

async function loadBastionFromStore() {
	const res = await repository.loadFirstBastion();
	if (res.success) {
		bastion = res.data.bastion;
		modules = res.data.modules;
	} else {
		console.warn(
			"Falha ao ler Bastião do worker local. Usando estado de fundação.",
		);
	}
}

// Ações da Interface
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleFundBastion() {
	const res = await service.foundBastion(newBastionName, selectedChassis);
	if (res.success) {
		bastion = res.data;
		modules = [];
		triggerSuccess(`Bastião fundado com sucesso! Chassi: ${selectedChassis}`);
		log(`[Fundação] O Bastião ${bastion.name} foi estabelecido.`);
	} else {
		triggerError(res.error.message);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleDepositGold() {
	if (!bastion || goldAmount <= 0) return;
	bastion.vaultGold += goldAmount;
	const goldSaved = goldAmount;
	goldAmount = 0;
	const res = await repository.save(bastion);
	if (res.success) {
		triggerSuccess("Ouro depositado com sucesso!");
		log(
			`[Cofre] Depositado ${goldSaved} PO. Total atual: ${bastion.vaultGold} PO.`,
		);
	} else {
		triggerError("Falha ao salvar no banco local.");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleWithdrawGold() {
	if (!bastion || goldAmount <= 0) return;
	if (bastion.vaultGold < goldAmount) {
		triggerError("Ouro insuficiente no cofre!");
		return;
	}
	bastion.vaultGold -= goldAmount;
	const goldWithdrawn = goldAmount;
	goldAmount = 0;
	const res = await repository.save(bastion);
	if (res.success) {
		triggerSuccess("Ouro sacado com sucesso!");
		log(
			`[Cofre] Sacado ${goldWithdrawn} PO. Total atual: ${bastion.vaultGold} PO.`,
		);
	} else {
		triggerError("Falha ao salvar no banco local.");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleStartBuild(catalogItem: (typeof moduleCatalog)[number]) {
	if (!bastion) return;
	if (bastion.vaultGold < catalogItem.cost) {
		triggerError("Recursos insuficientes no cofre para iniciar a obra!");
		return;
	}

	// Desconta o custo de PO do cofre e salva o bastião
	bastion.vaultGold -= catalogItem.cost;
	const saveBastionRes = await repository.save(bastion);
	if (!saveBastionRes.success) {
		triggerError("Falha ao atualizar saldo do cofre.");
		return;
	}

	const res = await service.startModule(
		bastion.id,
		catalogItem.id,
		catalogItem.tier,
	);
	if (res.success) {
		const list = await repository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}
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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleAdvanceObra(mRecord: BastionModuleRecord, charId: string) {
	if (!bastion) return;

	const char = characters.find((c) => c.id === charId);
	if (!char) {
		triggerError("Selecione um Andarilho ativo!");
		return;
	}

	const catalog = moduleCatalog.find((i) => i.id === mRecord.moduleId);
	const dc = catalog ? catalog.dc : 15;

	const mental = char.mental;
	// Rolagem criptograficamente segura exigida pelas regras de dados do projeto
	const d20 = Math.floor(getSecureRandom() * 20) + 1;

	const res = await service.advanceModuleObra(mRecord.id, mental, d20, dc);
	if (res.success) {
		const list = await repository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}

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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleEndRecess() {
	if (!bastion) return;
	const res = await service.processRecessEnd(bastion.id);
	if (res.success) {
		const updated = await repository.findById(bastion.id);
		if (updated.success) {
			bastion = updated.data;
		}

		const cost = res.data.maintenanceCost;
		const threat = res.data.threatGained;

		log(
			`[Passagem de Turno] Recesso finalizado. Taxa de Manutenção cobrada: ${cost} PO.`,
		);
		if (threat > 0) {
			log(
				`[Ameaça!] Rumores sobre a riqueza do cofre geraram +${threat} Ameaça à base.`,
			);
		}

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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleAddThreat() {
	if (!bastion) return;
	bastion.threatCurrent = Math.min(10, bastion.threatCurrent + 1);
	await repository.save(bastion);
	log(`[Perigo] Ameaça aumentada manualmente para: ${bastion.threatCurrent}.`);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleReduceThreat() {
	if (!bastion) return;
	bastion.threatCurrent = Math.max(0, bastion.threatCurrent - 1);
	await repository.save(bastion);
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
				<!-- Módulos em Construção usando o subcomponente extraído -->
				<DowntimeProjectList
					modules={modules}
					characters={characters}
					moduleCatalog={moduleCatalog}
					onAdvance={handleAdvanceObra}
				/>

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


