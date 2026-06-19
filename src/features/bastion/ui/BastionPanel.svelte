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
import type { CampaignEventRecord as EventHistoryRecord } from "$lib/entities/campaign";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { WorkerMercenaryRepository } from "$lib/entities/mercenary/infrastructure/WorkerMercenaryRepository";
import type { MercenarySquadRecord } from "$lib/entities/mercenary/model/mercenarySchema";
import type { SiegeEventRecord } from "$lib/entities/siege";
import { WorkerSiegeRepository } from "$lib/entities/siege";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup
import DowntimeProjectList from "./DowntimeProjectList.svelte";
import { moduleCatalog } from "./moduleCatalog";

// Props do Svelte 5 usando Runes
interface Props {
	characters: CharacterRecord[];
	onEndRecess?: () => void;
}
let { characters, onEndRecess }: Props = $props();

// Repositório e Serviço Concretos via RPC/Worker
const repository = new WorkerBastionRepository();
const service = new BastionService(repository);
const siegeRepository = new WorkerSiegeRepository();
const mercenaryRepository = new WorkerMercenaryRepository();

// Estados Reativos do Svelte 5 (Runes)
let bastion = $state<BastionRecord | null>(null);
let modules = $state<BastionModuleRecord[]>([]);

// Abas do cockpit
let _activeTab = $state<"construcao" | "cerco">("construcao");

// Estados de Cerco
let activeSiege = $state<SiegeEventRecord | null>(null);
let _siegeHistory = $state<EventHistoryRecord[]>([]);
let mercenarySquads = $state<readonly MercenarySquadRecord[]>([]);
let selectedSquadIds = $state<string[]>([]);
let defenseRollBonus = $state(0);
let forcedAttackRoll = $state<number | undefined>(undefined);
let forcedDefenseRoll = $state<number | undefined>(undefined);
let triggerFactionId = $state("fac-ruin");
let triggerDangerLevel = $state(2);

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

let selectedMercenaryBonus = $derived.by(() => {
	let total = 0;
	for (const sqId of selectedSquadIds) {
		const squad = mercenarySquads.find((s) => s.id === sqId);
		if (squad && squad.status === "available" && squad.cohesionCurrent > 0) {
			total += squad.physical;
		}
	}
	return total;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let totalDefenseBonusPreview = $derived(
	defenseRollBonus + currentStructure + selectedMercenaryBonus,
);

async function loadSiegeData() {
	const activeRes = await siegeRepository.findActiveSiege("campaign_default");
	if (activeRes.success) {
		activeSiege = activeRes.data;
	}
	const historyRes = await siegeRepository.listSiegeHistory("campaign_default");
	if (historyRes.success) {
		_siegeHistory = historyRes.data;
	}
	const compRes = await mercenaryRepository.listCompanies();
	if (compRes.success) {
		let allSquads: MercenarySquadRecord[] = [];
		for (const company of compRes.data) {
			const squadRes = await mercenaryRepository.listSquadsByCompany(
				company.id,
			);
			if (squadRes.success) {
				allSquads = [...allSquads, ...squadRes.data];
			}
		}
		mercenarySquads = allSquads;
	}
}

async function loadBastionFromStore() {
	const res = await repository.loadFirstBastion();
	if (res.success) {
		bastion = res.data.bastion;
		modules = res.data.modules;
		await loadSiegeData();
	} else {
		console.warn(
			"Falha ao ler Bastião do worker local. Usando estado de fundação.",
		);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleTriggerSiege() {
	if (!bastion) return;
	const res = await siegeRepository.triggerSiege({
		campaignId: "campaign_default",
		bastionId: bastion.id,
		factionId: triggerFactionId,
		dangerLevel: triggerDangerLevel,
		requestedAt: new Date().toISOString(),
	});

	if (res.success) {
		triggerSuccess("Um cerco inimigo foi iniciado às portas do Bastião!");
		await loadSiegeData();
	} else {
		triggerError(`Falha ao iniciar o cerco: ${res.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleResolveSiegeRound() {
	if (!activeSiege) return;
	const res = await siegeRepository.resolveSiegeRound({
		siegeId: activeSiege.id,
		defenseRollBonus: defenseRollBonus,
		requestedAt: new Date().toISOString(),
		forcedAttackRoll: forcedAttackRoll || undefined,
		forcedDefenseRoll: forcedDefenseRoll || undefined,
		squadIdsToDefend: selectedSquadIds,
	});

	if (res.success) {
		const outcome = res.data;
		log(`[Cerco] Rodada resolvida. ${outcome.logMessage}`);
		triggerSuccess("Rodada de cerco resolvida com sucesso!");
		selectedSquadIds = [];
		forcedAttackRoll = undefined;
		forcedDefenseRoll = undefined;
		await loadBastionFromStore();
	} else {
		triggerError(`Falha ao resolver rodada de cerco: ${res.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function toggleSquadSelection(squadId: string) {
	if (selectedSquadIds.includes(squadId)) {
		selectedSquadIds = selectedSquadIds.filter((id) => id !== squadId);
	} else {
		selectedSquadIds = [...selectedSquadIds, squadId];
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

		// Atualiza lista de módulos localmente caso algum tenha quebrado
		const list = await repository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}

		onEndRecess?.();

		const cost = res.data.maintenanceCost;
		const threat = res.data.threatGained;
		const cerco = res.data.cercoResult;

		log(
			`[Passagem de Turno] Recesso finalizado. Taxa de Manutenção cobrada: ${cost} PO.`,
		);
		if (threat > 0) {
			log(
				`[Ameaça!] Rumores sobre a riqueza do cofre geraram +${threat} Ameaça à base.`,
			);
		}

		if (cerco) {
			log(
				`[Cerco Frontal] Ameaça atingiu 10! Resultado do cerco: ${cerco.status.toUpperCase()}. Dano de integridade: ${cerco.integrityLost} HP.`,
			);
			if (cerco.brokenModuleIds.length > 0) {
				log(`[Dano Crítico] Módulo quebrado durante o cerco!`);
			}
			triggerError(
				`CRITICAL EVENT: Base atacada! Status: ${cerco.status.toUpperCase()}. HP perdido: ${cerco.integrityLost}`,
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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleRepairModule(mRecord: BastionModuleRecord) {
	if (!bastion) return;
	const goldCost = mRecord.tier * 100;
	if (bastion.vaultGold < goldCost) {
		triggerError("Ouro insuficiente no cofre para reparos!");
		return;
	}
	bastion.vaultGold -= goldCost;
	mRecord.isBroken = false;
	const saveBastionRes = await repository.save(bastion);
	const saveModRes = await repository.saveModule(mRecord);
	if (saveBastionRes.success && saveModRes.success) {
		triggerSuccess("Módulo reparado com sucesso!");
		log(
			`[Reparos] Módulo ${moduleCatalog.find((i) => i.id === mRecord.moduleId)?.name} reparado por ${goldCost} PO.`,
		);
		const list = await repository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}
	} else {
		triggerError("Erro ao salvar reparos.");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleUpgradeModule(
	mRecord: BastionModuleRecord,
	trophyId?: string,
) {
	if (!bastion) return;
	const nextTier = mRecord.tier + 1;
	const goldCost = nextTier * 150;

	const res = await service.upgradeModuleWithTrophy(
		bastion.id,
		mRecord.id,
		goldCost,
		trophyId,
	);
	if (res.success) {
		triggerSuccess(`Módulo evoluído para Tier ${nextTier}!`);
		log(
			`[Evolução] Módulo ${moduleCatalog.find((i) => i.id === mRecord.moduleId)?.name} evoluído para Tier ${nextTier}. Custo: ${goldCost} PO.`,
		);
		const list = await repository.findModulesByBastionId(bastion.id);
		if (list.success) {
			modules = [...list.data];
		}
	} else {
		triggerError(res.error.message);
	}
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
		<!-- Cockpit Tab Navigation -->
		<div class="tabs-nav glass">
			<button class="tab-btn" class:active={activeTab === "construcao"} onclick={() => activeTab = "construcao"}>
				🛠️ Construção & Cofre
			</button>
			<button class="tab-btn" class:active={activeTab === "cerco"} onclick={() => activeTab = "cerco"}>
				🛡️ Defesa de Cerco
			</button>
		</div>

		{#if activeTab === "construcao"}
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
						onRepair={handleRepairModule}
						onUpgrade={handleUpgradeModule}
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
		{:else if activeTab === "cerco"}
			<!-- Painel de Defesa de Cerco -->
			<div class="bastion-grid">
				<!-- Coluna Esquerda: Status do Cerco & Controles de Combate -->
				<div class="left-column">
					{#if activeSiege}
						<div class="panel active-siege-panel glass">
							<h2>Cerco Ativo Detectado!</h2>
							
							<div class="stat-row">
								<div class="stat-header">
									<span>Inimigo Agressor:</span>
									<span class="badge chassis-badge">
										{#if activeSiege.factionId === "fac-ruin"}
											Sectários da Ruína
										{:else if activeSiege.factionId === "fac-ether"}
											Guardiões do Ether
										{:else if activeSiege.factionId === "fac-bronze"}
											Sindicato de Bronze
										{:else}
											{activeSiege.factionId}
										{/if}
									</span>
								</div>
							</div>

							<div class="attributes-grid">
								<div class="attr-box">
									<span class="label">Nível de Perigo</span>
									<span class="val text-danger">{activeSiege.dangerLevel}</span>
								</div>
								<div class="attr-box">
									<span class="label">Dano Acumulado</span>
									<span class="val">{activeSiege.damagePoints} HP</span>
								</div>
								<div class="attr-box">
									<span class="label">Status</span>
									<span class="val text-danger">{activeSiege.status.toUpperCase()}</span>
								</div>
							</div>

							<div class="defense-preview-box">
								<h3>🛡️ Estimativa de Bônus de Defesa</h3>
								<p>Sua base receberá:</p>
								<ul style="list-style: none; padding: 0; margin: 0.5rem 0; font-size: 0.85rem;">
									<li>• Estrutura do Bastião: <strong>+{currentStructure}</strong></li>
									<li>• Modificador de Rodada: <strong>+{defenseRollBonus}</strong></li>
									<li>• Esquadrões Mercenários: <strong>+{selectedMercenaryBonus}</strong></li>
								</ul>
								<p>Bônus de Defesa Total: <strong>+{totalDefenseBonusPreview}</strong></p>
							</div>

							<div class="simulation-rolls">
								<h4>Simulação de Dados (Opcional)</h4>
								<div class="rolls-inputs-row">
									<div class="input-group">
										<label for="f-attack">Dado de Ataque (1-20):</label>
										<input id="f-attack" type="number" bind:value={forcedAttackRoll} min="1" max="20" placeholder="Automático" />
									</div>
									<div class="input-group">
										<label for="f-defense">Dado de Defesa (1-20):</label>
										<input id="f-defense" type="number" bind:value={forcedDefenseRoll} min="1" max="20" placeholder="Automático" />
									</div>
								</div>
							</div>

							<div class="input-group">
								<label for="roll-bonus">Modificador de Defesa Extra (Tática):</label>
								<input id="roll-bonus" type="number" bind:value={defenseRollBonus} />
							</div>

							<button class="btn btn-primary" style="width: 100%;" onclick={handleResolveSiegeRound}>
								🎲 Rolar Defesa / Resolver Rodada
							</button>
						</div>
					{:else}
						<div class="panel no-siege-panel glass">
							<h2>Nenhum Cerco Ativo</h2>
							<p class="subtitle">Os arredores do Bastião estão calmos... por enquanto.</p>
							
							<div class="siege-trigger-form">
								<div class="input-group">
									<label for="f-trigger">Selecione a Facção Agressora:</label>
									<select id="f-trigger" bind:value={triggerFactionId}>
										<option value="fac-ruin">Sectários da Ruína (fac-ruin)</option>
										<option value="fac-ether">Guardiões do Ether (fac-ether)</option>
										<option value="fac-bronze">Sindicato de Bronze (fac-bronze)</option>
									</select>
								</div>

								<div class="input-group">
									<label for="dl-trigger">Nível de Perigo (1 a 5):</label>
									<input id="dl-trigger" type="number" bind:value={triggerDangerLevel} min="1" max="5" />
								</div>

								<button class="btn btn-danger" onclick={handleTriggerSiege}>
									🔥 Instigar / Simular Ataque à Base
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- Coluna Direita: Designação de Mercenários & Histórico de Combate -->
				<div class="right-column">
					{#if activeSiege}
						<div class="panel mercenaries-selection-panel glass">
							<h2>Designar Esquadrões de Defesa</h2>
							<p class="subtitle">Esquadrões selecionados somam o atributo 'Physical' à defesa do Bastião e sofrem as baixas (dano de coesão) primeiro.</p>

							<div class="squad-selection-list">
								{#each mercenarySquads as squad}
									{@const isDisabled = squad.status !== "available" || squad.cohesionCurrent <= 0}
									<button 
										class="squad-selection-card" 
										class:disabled={isDisabled}
										type="button"
										onclick={() => !isDisabled && toggleSquadSelection(squad.id)}
									>
										<input 
											type="checkbox" 
											checked={selectedSquadIds.includes(squad.id)} 
											disabled={isDisabled}
											onclick={(e) => e.stopPropagation()}
											onchange={() => toggleSquadSelection(squad.id)}
										/>
										<div class="squad-selection-info" style="text-align: left;">
											<h4>{squad.name}</h4>
											<div class="squad-selection-stats">
												<span>Fís: <strong>+{squad.physical}</strong></span>
												<span>Men: <strong>+{squad.mental}</strong></span>
												<span>Soc: <strong>+{squad.social}</strong></span>
												<span>Coesão: <strong>{squad.cohesionCurrent}/{squad.cohesionMax}</strong></span>
											</div>
											<div class="squad-selection-tags">
												<span class="squad-tag-badge">Tática: {squad.commandTactic.toUpperCase()}</span>
												{#each JSON.parse(squad.tagsJson) as tag}
													<span class="squad-tag-badge">{tag}</span>
												{/each}
											</div>
										</div>
										<span class="badge" class:chassis-badge={!isDisabled}>
											{#if squad.status === "available"}
												Disponível
											{:else if squad.status === "on_mission"}
												Em Missão
											{:else if squad.status === "resting"}
												Descanso
											{:else}
												Morto
											{/if}
										</span>
									</button>
								{/each}
								{#if mercenarySquads.length === 0}
									<p class="empty">Nenhum esquadrão sob comando. Visite o painel de Mercenários para fundar e recrutar.</p>
								{/if}
							</div>
						</div>
					{/if}

					<div class="panel siege-history-panel glass">
						<h2>Histórico de Eventos de Cerco</h2>
						<div class="siege-history-list">
							{#each siegeHistory as history}
								<div class="siege-history-entry" class:start={history.eventType === "siege_start"} class:resolve={history.eventType === "siege_resolve"}>
									<div class="siege-history-header">
										<span class="event-type-badge font-mono uppercase">{history.eventType.replace("_", " ")}</span>
										<span class="event-time font-mono">{new Date(history.createdAt).toLocaleString("pt-BR")}</span>
									</div>
									<div class="siege-history-desc">{history.description}</div>
								</div>
							{/each}
							{#if siegeHistory.length === 0}
								<p class="empty">Nenhum evento registrado no histórico de cercos.</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>


