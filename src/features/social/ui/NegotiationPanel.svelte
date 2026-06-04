<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { WorkerDialogueRepository } from "$lib/entities/dialogue/infrastructure/WorkerDialogueRepository";
import { WorkerCraftingRepository } from "$lib/entities/equipment/infrastructure/WorkerCraftingRepository";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import { fail, ok } from "$lib/shared/lib/result";
import { SocialCombatEngine } from "../domain/SocialCombatEngine";

interface Props {
	characters: readonly CharacterRecord[];
	onClose?: () => void;
}

let props: Props = $props();
let characters = $derived(props.characters);

// Servicos e Repositorios
const dialogueRepository = new WorkerDialogueRepository();
const socialEngine = new SocialCombatEngine(dialogueRepository);
const craftingRepository = new WorkerCraftingRepository();

// Estado da Negociacao
let selectedNpcId = $state("npc-merchant");
let selectedOratorId = $state("");
let selectedAxis = $state("social");
let selectedManeuver = $state<
	| "none"
	| "group_sense"
	| "venomous_flattery"
	| "mystic_charm"
	| "ether_contract"
>("none");
let targetPatience = $state(10);
let targetPatienceMax = $state(10);
let persuasionSegments = $state(0);
let persuasionSegmentsMax = $state(6);
let targetDisposition = $state("neutral");
let activeEvents = $state<any[]>([]);

let rollValue = $state(10);
let dcValue = $state(12);

// Ofertas na mesa
let offerGold = $state(0);
let offerFavors = $state(0);
let totalBargainBonus = $derived(Math.floor(offerGold / 100) + offerFavors * 2);

// Logs da Negociacao
let negotiationLogs = $state<string[]>([]);
let recoilAnimation = $state(false);
let showRecoilFlash = $state(false);

// Estado do Inventario e Reciclagem
let selectedInventoryCharId = $state("");
let craftedItems = $state<CharacterCraftedItemRecord[]>([]);
let genericEquipment = $state<{ id: string; label: string; count: number }[]>(
	[],
);
let recyclingLogs = $state<string[]>([]);

// Carregar inventario e sincronizar negociacao
onMount(async () => {
	if (characters.length > 0) {
		selectedOratorId = characters[0].id;
		selectedInventoryCharId = characters[0].id;
	}
	await loadInventoryData();
});

async function loadSocialCombatState() {
	if (!selectedOratorId || !selectedNpcId) return;

	const res = await dialogueRepository.findByCharacterAndNpc(
		selectedOratorId,
		selectedNpcId,
	);
	if (res.success && res.data) {
		const state = res.data;
		if (state.patienceMax > 0) {
			targetPatience = state.patienceCurrent;
			targetPatienceMax = state.patienceMax;
			persuasionSegments = state.persuasionCurrent;
			persuasionSegmentsMax = state.persuasionMax;
			targetDisposition = state.attitude;
		} else {
			const profile = socialEngine.getInitialNpcStats(selectedNpcId);
			targetPatience = profile.patienceMax;
			targetPatienceMax = profile.patienceMax;
			persuasionSegments = 0;
			persuasionSegmentsMax = profile.persuasionMax;
			targetDisposition = profile.attitude;
		}
	} else {
		const profile = socialEngine.getInitialNpcStats(selectedNpcId);
		targetPatience = profile.patienceMax;
		targetPatienceMax = profile.patienceMax;
		persuasionSegments = 0;
		persuasionSegmentsMax = profile.persuasionMax;
		targetDisposition = profile.attitude;
	}
	activeEvents = [];
}

async function loadInventoryData() {
	if (!selectedInventoryCharId) return;

	genericEquipment = OFFICIAL_EQUIPMENT.map((eq) => ({
		id: eq.id,
		label: eq.label,
		count: 2,
	}));

	craftedItems = [
		{
			id: "crafted-longsword-1",
			characterId: selectedInventoryCharId,
			equipmentId: "longsword",
			label: "Espada Longa de Ferro-Árvore",
			isSharp: 1,
			isReinforced: 0,
			isRunic: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
			isEquipped: 0,
		},
	];
}

$effect(() => {
	if (selectedInventoryCharId) {
		loadInventoryData();
	}
});

$effect(() => {
	if (selectedOratorId && selectedNpcId) {
		loadSocialCombatState();
	}
});

// Acao de Negociacao
async function handleResolveRound() {
	if (!selectedOratorId || !selectedNpcId) return;

	const treeId =
		selectedNpcId === "npc-merchant"
			? "tree-merchant-bargain"
			: selectedNpcId === "npc-alchemist"
				? "tree-alchemist-secrets"
				: "tree-scribe-lore";

	const res = await socialEngine.resolveSocialRound({
		characterId: selectedOratorId,
		npcId: selectedNpcId,
		treeId,
		oratorId: selectedOratorId,
		axis: selectedAxis,
		rollValue: rollValue,
		dc: dcValue,
		maneuver: selectedManeuver,
		offerGold: offerGold,
		offerFavors: offerFavors,
		events: activeEvents,
	});

	if (res.success) {
		const data = res.data;
		targetPatience = data.target.patience.currentValue;
		targetPatienceMax = data.target.patience.baseValue;
		persuasionSegments = data.target.persuasion.completedSegments;
		persuasionSegmentsMax = data.target.persuasion.totalSegments;
		targetDisposition = data.target.attitude;
		activeEvents = [...activeEvents, ...data.events];
		negotiationLogs = [data.logMessage, ...negotiationLogs];

		if (data.recoilDamage) {
			triggerRecoilAnimation();
		}
	} else {
		negotiationLogs = [`❌ Erro: ${res.error.message}`, ...negotiationLogs];
	}
}

function triggerRecoilAnimation() {
	recoilAnimation = true;
	showRecoilFlash = true;
	setTimeout(() => {
		showRecoilFlash = false;
	}, 500);
	setTimeout(() => {
		recoilAnimation = false;
	}, 1500);
}

async function handleResetNegotiation() {
	if (!selectedOratorId || !selectedNpcId) return;

	const treeId =
		selectedNpcId === "npc-merchant"
			? "tree-merchant-bargain"
			: selectedNpcId === "npc-alchemist"
				? "tree-alchemist-secrets"
				: "tree-scribe-lore";

	const res = await socialEngine.resetSocialStats(
		selectedOratorId,
		selectedNpcId,
		treeId,
	);
	if (res.success) {
		const profile = socialEngine.getInitialNpcStats(selectedNpcId);
		targetPatience = profile.patienceMax;
		targetPatienceMax = profile.patienceMax;
		persuasionSegments = 0;
		persuasionSegmentsMax = profile.persuasionMax;
		targetDisposition = profile.attitude;
		offerGold = 0;
		offerFavors = 0;
		selectedManeuver = "none";
		activeEvents = [];
		negotiationLogs = [
			`Nova rodada de negociação iniciada com ${profile.label}.`,
		];
	} else {
		negotiationLogs = [
			`❌ Erro ao resetar: ${res.error.message}`,
			...negotiationLogs,
		];
	}
}

// Acoes de Reciclagem/Desmanche
async function handleDismantle(itemId: string) {
	if (!selectedInventoryCharId) return;
	const res = await craftingRepository.dismantleCraftedItem(
		selectedInventoryCharId,
		itemId,
	);
	if (res.success) {
		const recovered = Object.entries(res.data.materialsRecovered)
			.map(([id, qty]) => `${qty}x ${id}`)
			.join(", ");
		recyclingLogs = [
			`♻️ Item desmanchado com sucesso! Materiais recuperados: ${recovered}`,
			...recyclingLogs,
		];
		craftedItems = craftedItems.filter((it) => it.id !== itemId);
	} else {
		recyclingLogs = [
			`❌ Falha no desmanche: ${res.error.message}`,
			...recyclingLogs,
		];
	}
}

async function handleScrap(equipmentId: string) {
	const res = await craftingRepository.scrapEquipment(equipmentId);
	if (res.success) {
		recyclingLogs = [
			`♻️ Equipamento ${equipmentId} reciclado! Recuperado: 1x ${res.data.materialRecovered}`,
			...recyclingLogs,
		];
		genericEquipment = genericEquipment.map((eq) => {
			if (eq.id === equipmentId) {
				return { ...eq, count: Math.max(0, eq.count - 1) };
			}
			return eq;
		});
	} else {
		recyclingLogs = [
			`❌ Falha na reciclagem: ${res.error.message}`,
			...recyclingLogs,
		];
	}
}
</script>

<div class="relative w-full min-h-screen bg-[#09090b] text-[#f4f4f5] p-6 font-sans overflow-y-auto">
	{#if showRecoilFlash}
		<div class="fixed inset-0 bg-[#ef4444]/40 z-50 pointer-events-none transition-opacity duration-300 animate-pulse"></div>
	{/if}

	<header class="flex justify-between items-center border-b border-[#27272a] pb-4 mb-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-runic via-ether to-blood bg-clip-text text-transparent">
				Negociação & Economia de Quebra
			</h1>
			<p class="text-sm text-[#a1a1aa] mt-1">Fase 43: Manobras Sociais e Reciclagem de Equipamentos</p>
		</div>
		<button
			onclick={props.onClose}
			class="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] rounded-md transition duration-200 border border-[#3f3f46]"
		>
			Voltar
		</button>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Painel Esquerdo: Controle de Negociação -->
		<section class="lg:col-span-8 bg-[#18181b] border border-[#27272a] rounded-lg p-6 flex flex-col gap-6 relative overflow-hidden">
			{#if recoilAnimation}
				<div class="absolute inset-0 bg-[#09090b]/80 z-20 flex flex-col items-center justify-center text-center p-4">
					<div class="w-16 h-16 border-4 border-blood border-t-transparent rounded-full animate-spin mb-4"></div>
					<h3 class="text-blood font-bold text-xl animate-bounce">⚡ VIOLAÇÃO DO CONTRATO DE ÉTER! ⚡</h3>
					<p class="text-bone text-sm mt-2 max-w-md">O éter do abjurador se rompeu violentamente causando dano espiritual de 50% de HP máximo!</p>
				</div>
			{/if}

			<div>
				<h2 class="text-xl font-bold text-purple-runic border-b border-[#27272a] pb-2 mb-4">Mesa de Negociação</h2>
				
				<!-- Visualização de Status do Target -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
					<div>
						<div class="text-xs text-[#a1a1aa] uppercase font-bold tracking-wider">NPC Negociando</div>
						<div class="text-sm font-semibold text-[#f4f4f5] mt-1">
							{selectedNpcId === 'npc-merchant' ? 'Silas o Mercador' : selectedNpcId === 'npc-alchemist' ? 'Eldrin o Alquimista' : 'Silas o Escriba'}
						</div>
						<div class="text-[10px] text-purple-runic font-mono uppercase mt-0.5">
							Atitude: {targetDisposition === 'friendly' ? 'Amigável' : 
									  targetDisposition === 'neutral' ? 'Neutro' : 
									  targetDisposition === 'skeptical' ? 'Cético' : 
									  targetDisposition === 'hostile' ? 'Hostil' : 'Inimigo Declarado'}
						</div>
					</div>

					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-[#a1a1aa]">Reserva de Paciência do NPC</span>
							<span class="font-mono text-purple-runic font-bold">{targetPatience}/{targetPatienceMax}</span>
						</div>
						<div class="w-full bg-[#27272a] h-3 rounded-full overflow-hidden">
							<div
								class="bg-gradient-to-r from-purple-runic to-sky-runic h-full transition-all duration-300"
								style="width: {targetPatienceMax > 0 ? (targetPatience / targetPatienceMax) * 100 : 0}%"
							></div>
						</div>
					</div>

					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-[#a1a1aa]">Trilha de Persuasão</span>
							<span class="font-mono text-purple-runic font-bold">{persuasionSegments}/{persuasionSegmentsMax}</span>
						</div>
						<div class="flex gap-1 h-3">
							{#each Array(persuasionSegmentsMax) as _, i}
								<div
									class="flex-1 rounded-sm transition-all duration-300 {i < persuasionSegments ? 'bg-gradient-to-r from-purple-runic to-blood' : 'bg-[#27272a]'}"
								></div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Formulario de Acoes Sociais -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="flex flex-col gap-4">
					<div>
						<label for="orator" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Escolha o Orador</label>
						<select
							id="orator"
							bind:value={selectedOratorId}
							class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] focus:outline-none focus:border-bronze"
						>
							{#each characters as char}
								<option value={char.id}>{char.name} (Mental: {char.mental})</option>
							{/each}
						</select>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="axis" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Eixo de Atributo</label>
							<select
								id="axis"
								bind:value={selectedAxis}
								class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] focus:outline-none focus:border-bronze"
							>
								<option value="physical">Físico</option>
								<option value="mental">Mental</option>
								<option value="social">Social</option>
							</select>
						</div>

						<div>
							<label for="npc" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Alvo da Negociação (NPC)</label>
							<select
								id="npc"
								bind:value={selectedNpcId}
								class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] focus:outline-none focus:border-bronze"
							>
								<option value="npc-merchant">Silas o Mercador</option>
								<option value="npc-alchemist">Eldrin o Alquimista</option>
								<option value="npc-scribe">Silas o Escriba</option>
							</select>
						</div>
					</div>

					<div>
						<label for="maneuver" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Manobra Ativa</label>
						<select
							id="maneuver"
							bind:value={selectedManeuver}
							class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] focus:outline-none focus:border-bronze"
						>
							<option value="none">Nenhuma</option>
							<option value="group_sense">Senso de Grupo (Gera favores)</option>
							<option value="venomous_flattery">Lisonja Venenosa (+2 dano mental)</option>
							<option value="mystic_charm">Charme Místico (Amigável temporário)</option>
							<option value="ether_contract">Contrato de Éter (+4 teste / 50% recoil)</option>
						</select>
					</div>
				</div>

				<div class="flex flex-col gap-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="roll" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Rolagem d20</label>
							<input
								id="roll"
								type="number"
								min="1"
								max="20"
								bind:value={rollValue}
								class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] font-mono text-center focus:outline-none focus:border-bronze"
							/>
						</div>

						<div>
							<label for="dc" class="text-sm font-semibold text-[#a1a1aa] block mb-1">CD do Teste</label>
							<input
								id="dc"
								type="number"
								min="5"
								max="30"
								bind:value={dcValue}
								class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] font-mono text-center focus:outline-none focus:border-bronze"
							/>
						</div>
					</div>

					<div class="bg-[#09090b] p-4 rounded-lg border border-[#27272a] flex flex-col gap-2">
						<span class="text-xs font-bold text-purple-runic tracking-wider uppercase">Ofertas & Suborno</span>
						<div class="flex gap-4">
							<div class="flex-1">
								<label for="gold-offer" class="text-[11px] text-[#a1a1aa] block">Moedas de Ouro</label>
								<input
									id="gold-offer"
									type="number"
									bind:value={offerGold}
									class="w-full bg-[#18181b] border border-[#27272a] rounded p-1 text-xs text-center font-mono focus:outline-none"
								/>
							</div>
							<div class="flex-1">
								<label for="favors-offer" class="text-[11px] text-[#a1a1aa] block">Favores / Dívida</label>
								<input
									id="favors-offer"
									type="number"
									bind:value={offerFavors}
									class="w-full bg-[#18181b] border border-[#27272a] rounded p-1 text-xs text-center font-mono focus:outline-none"
								/>
							</div>
						</div>
						<div class="text-[11px] text-[#a1a1aa] mt-1 text-right">
							Bônus de Margem Calculado: <span class="font-mono text-emerald-poison font-bold">+{totalBargainBonus}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="flex gap-4">
				<button
					onclick={handleResolveRound}
					class="flex-1 py-3 bg-gradient-to-r from-bronze to-ruin hover:from-ether hover:to-ruin text-white font-semibold rounded-md shadow-lg shadow-bronze/10 hover:shadow-ether/20 transition duration-200"
				>
					Simular Argumento Social
				</button>
				<button
					onclick={handleResetNegotiation}
					class="px-6 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5] rounded-md font-semibold border border-[#3f3f46] transition duration-200"
				>
					Resetar
				</button>
			</div>

			<!-- Histórico da Conversa -->
			<div class="flex-1 flex flex-col bg-[#09090b] border border-[#27272a] rounded-lg p-4 h-[200px]">
				<span class="text-xs font-bold text-purple-runic tracking-wider uppercase mb-2">Relatório de Diálogo</span>
				<div class="flex-1 overflow-y-auto font-mono text-xs flex flex-col gap-2 p-1">
					{#each negotiationLogs as log}
						<div class="border-l-2 border-purple-runic pl-2 text-[#d4d4d8]">{log}</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Painel Direito: Economia de Quebra e Reciclagem -->
		<section class="lg:col-span-4 bg-[#18181b] border border-[#27272a] rounded-lg p-6 flex flex-col gap-6">
			<div>
				<h2 class="text-xl font-bold text-purple-runic border-b border-[#27272a] pb-2 mb-4">Economia de Quebra</h2>
				
				<label for="inv-char" class="text-sm font-semibold text-[#a1a1aa] block mb-1">Inventário do Personagem</label>
				<select
					id="inv-char"
					bind:value={selectedInventoryCharId}
					class="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2 text-[#f4f4f5] focus:outline-none focus:border-bronze"
				>
					{#each characters as char}
						<option value={char.id}>{char.name}</option>
					{/each}
				</select>
			</div>

			<!-- Itens Artesanais (Desmanche) -->
			<div>
				<h3 class="text-xs font-bold text-purple-runic tracking-wider uppercase mb-3">Equipamentos Artesanais (50% Recompensa)</h3>
				<div class="flex flex-col gap-3">
					{#each craftedItems as item}
						<div class="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex justify-between items-center">
							<div>
								<span class="text-sm font-semibold block">{item.label}</span>
								<span class="text-[10px] text-purple-runic font-mono">
									Decoradores: {item.isSharp ? 'Afiada' : ''} {item.isReinforced ? 'Reforçada' : ''} {item.isRunic ? 'Rúnica' : ''}
								</span>
							</div>
							<button
								onclick={() => handleDismantle(item.id)}
								class="px-3 py-1 bg-blood-shadow hover:bg-blood/60 text-[#f87171] text-xs rounded border border-blood/50 transition duration-150"
							>
								Desmanchar
							</button>
						</div>
					{/each}
					{#if craftedItems.length === 0}
						<p class="text-xs text-[#71717a] italic">Nenhum item artesanal forjado no inventário.</p>
					{/if}
				</div>
			</div>

			<!-- Equipamentos Comuns (Scrap) -->
			<div>
				<h3 class="text-xs font-bold text-purple-runic tracking-wider uppercase mb-3">Equipamentos Genéricos (Reciclagem Rápida)</h3>
				<div class="flex flex-col gap-3">
					{#each genericEquipment as eq}
						{#if eq.count > 0}
							<div class="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex justify-between items-center">
								<div>
									<span class="text-sm font-semibold block">{eq.label}</span>
									<span class="text-[10px] text-[#71717a] font-mono">Quantidade: {eq.count}</span>
								</div>
								<button
									onclick={() => handleScrap(eq.id)}
									class="px-3 py-1 bg-blood-shadow hover:bg-[#831843]/60 text-[#f472b6] text-xs rounded border border-[#831843]/50 transition duration-150"
								>
									Reciclar
								</button>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Logs de Reciclagem -->
			<div class="flex-1 flex flex-col bg-[#09090b] border border-[#27272a] rounded-lg p-4 min-h-[150px]">
				<span class="text-xs font-bold text-purple-runic tracking-wider uppercase mb-2">Logs da Forja/Oficina</span>
				<div class="flex-1 overflow-y-auto font-mono text-xs flex flex-col gap-2 p-1">
					{#each recyclingLogs as rlog}
						<div class="border-l-2 border-purple-runic pl-2 text-[#d4d4d8]">{rlog}</div>
					{/each}
					{#if recyclingLogs.length === 0}
						<p class="text-[11px] text-[#71717a] italic">Nenhuma ação de reciclagem nesta sessão.</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>
