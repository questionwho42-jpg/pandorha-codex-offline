<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import type { TrapRepository } from "$lib/entities/traps/domain/TrapRepository";
import type { TrapRecord } from "$lib/entities/traps/model/trapSchema";

interface Props {
	characters: readonly CharacterRecord[];
	currentTileId: string;
	trapRepository: TrapRepository;
	characterSession: any;
	onDeploySuccess?: () => void;
}

let props: Props = $props();
let characters = $derived(props.characters);
let currentTileId = $derived(props.currentTileId);
let trapRepository = $derived(props.trapRepository);

// Estados de Recursos Locais da Oficina de Engenharia Tática
let selectedCharacterId = $state("");
let characterGoldCopper = $state(25000);
let characterMaterials = $state<Record<string, number>>({
	"metal-ore": 12,
	"mystic-essence": 5,
});

// Catálogo das Receitas de Armadilhas do Códice (Fase 35)
interface TrapRecipe {
	id: string;
	tier: number;
	name: string;
	description: string;
	type: "mechanical" | "magical";
	severity: "simple" | "hidden" | "deadly";
	dcBase: number;
	damageText: string;
	damage: number;
	effectType: "bleeding" | "silenced" | "immobilized" | "noisy_rune";
	effectLabel: string;
	goldCost: number;
	materials: { id: "metal-ore" | "mystic-essence"; quantity: number }[];
}

const TRAP_RECIPES: TrapRecipe[] = [
	{
		id: "trap-farpas",
		tier: 1,
		name: "Armadilha de Farpas",
		description: "Uma placa de pressão com pontas farpadas enferrujadas.",
		type: "mechanical",
		severity: "simple",
		dcBase: 2, // DC final = 10 + 2 + 1 (simples) = 13
		damageText: "1d6 de Perfuração",
		damage: 6,
		effectType: "bleeding",
		effectLabel: "Sangramento (Debilita Físico, impede descanso)",
		goldCost: 10,
		materials: [{ id: "metal-ore", quantity: 1 }],
	},
	{
		id: "trap-gas-eter",
		tier: 2,
		name: "Armadilha de Gás de Éter",
		description: "Uma bolsa hermética que explode vapor místico perturbador.",
		type: "magical",
		severity: "simple",
		dcBase: 4, // DC final = 10 + 4 + 1 (simples) = 15
		damageText: "2d6 Espiritual",
		damage: 12,
		effectType: "silenced",
		effectLabel: "Silenciado (Debilita Mente e Interação, impede magias)",
		goldCost: 25,
		materials: [{ id: "mystic-essence", quantity: 1 }],
	},
	{
		id: "trap-urso-aco",
		tier: 3,
		name: "Armadilha de Urso de Aço",
		description:
			"Presas de metal temperado de alta pressão para prender pernas.",
		type: "mechanical",
		severity: "hidden",
		dcBase: 5, // DC final = 10 + 5 + 3 (escondido) = 18
		damageText: "4d6 de Impacto",
		damage: 24,
		effectType: "immobilized",
		effectLabel:
			"Imobilizado (Velocidade zero, debilita Conflito e Iniciativa)",
		goldCost: 40,
		materials: [{ id: "metal-ore", quantity: 2 }],
	},
	{
		id: "trap-runa-ruidosa",
		tier: 4,
		name: "Runa Ruidosa",
		description:
			"Selo arcano sonoro que detona com ondas de choque estrondosas.",
		type: "magical",
		severity: "deadly",
		dcBase: 6, // DC final = 10 + 6 + 5 (mortal) = 21
		damageText: "5d6 Elemental",
		damage: 30,
		effectType: "noisy_rune",
		effectLabel: "Estrondo (+3 fatias no Relógio de Tensão do combate)",
		goldCost: 60,
		materials: [
			{ id: "metal-ore", quantity: 1 },
			{ id: "mystic-essence", quantity: 1 },
		],
	},
];

let selectedRecipeId = $state(TRAP_RECIPES[0].id);
let selectedRecipe = $derived(
	TRAP_RECIPES.find((r) => r.id === selectedRecipeId) || TRAP_RECIPES[0],
);

// Armadilhas ativas carregadas do banco de dados no tile atual
let installedTraps = $state<TrapRecord[]>([]);
let _isLoadingTraps = $state(false);

// Logs didáticos de fabricação/instalação
let _logMessage = $state("");
let _isCrafting = $state(false);

// Sincronizar herói selecionado inicialmente
$effect(() => {
	if (characters && characters.length > 0 && !selectedCharacterId) {
		const hunterOrEmissary = characters.find(
			(c) => c.classId === "hunter" || c.classId === "emissary",
		);
		selectedCharacterId = hunterOrEmissary
			? hunterOrEmissary.id
			: characters[0].id;
	}
});

// Monitor de mudança de hexágono para recarregar armadilhas
$effect(() => {
	if (currentTileId) {
		loadTrapsForTile();
	}
});

onMount(() => {
	loadTrapsForTile();
});

async function loadTrapsForTile() {
	if (!currentTileId) return;
	_isLoadingTraps = true;
	const res = await trapRepository.findByTileId(currentTileId);
	if (res.success) {
		installedTraps = res.data;
	}
	_isLoadingTraps = false;
}

// Obter dados do herói selecionado
let activeCharacter = $derived(
	characters.find((c) => c.id === selectedCharacterId),
);
let isSpecialized = $derived(
	activeCharacter?.classId === "hunter" ||
		activeCharacter?.classId === "emissary",
);

// Requisitos de fabricação da receita selecionada
let hasEnoughResources = $derived.by(() => {
	if (characterGoldCopper < selectedRecipe.goldCost) return false;
	for (const mat of selectedRecipe.materials) {
		const owned = characterMaterials[mat.id] || 0;
		if (owned < mat.quantity) return false;
	}
	return true;
});

// Fabricar e instalar armadilha no banco de dados SQLite real
async function _triggerDeploy() {
	if (!isSpecialized) {
		_logMessage = `⚠️ FALHA: Apenas heróis especializados (Caçador ou Emissário) conhecem as técnicas de engenharia do Códice para fabricar armadilhas táticas.`;
		return;
	}
	if (!hasEnoughResources) {
		_logMessage = `⚠️ RECURSOS INSUFICIENTES: Você precisa de ${selectedRecipe.goldCost} cobre e os materiais necessários para a forja.`;
		return;
	}
	if (!activeCharacter) return;

	_isCrafting = true;
	_logMessage = `🔨 ${activeCharacter.name} está esculpindo e engatilhando os componentes da armadilha...`;

	// Pequeno delay para emular fabricação física
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Deduzir recursos
	characterGoldCopper -= selectedRecipe.goldCost;
	for (const mat of selectedRecipe.materials) {
		characterMaterials[mat.id] -= mat.quantity;
	}

	// Criar o registro no banco de dados
	// ID deve satisfazer /^[a-z][a-z0-9-]*$/
	const randArray = new Uint32Array(1);
	window.crypto.getRandomValues(randArray);
	const timestampSuffix = randArray[0] % 10000;
	const trapId = `trap-${selectedRecipe.id}-${timestampSuffix}`;

	const dcSeverityBonus =
		selectedRecipe.severity === "simple"
			? 1
			: selectedRecipe.severity === "hidden"
				? 3
				: 5;
	const finalDc = 10 + selectedRecipe.dcBase + dcSeverityBonus;

	const newTrap: any = {
		id: trapId,
		tileId: currentTileId,
		name: `${selectedRecipe.name} de ${activeCharacter.name}`,
		type: selectedRecipe.type,
		severity: selectedRecipe.severity,
		dc: selectedRecipe.dcBase,
		damage: selectedRecipe.damage,
		isDetected: true, // Grupo sabe que instalou
		isDisarmed: false,
		isTriggered: false,
		effects: JSON.stringify([selectedRecipe.effectType]),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const res = await trapRepository.save(newTrap);
	_isCrafting = false;

	if (res.success) {
		_logMessage = `✅ SUCESSO: A "${selectedRecipe.name}" foi fabricada com êxito por ${activeCharacter.name} e ativada no Hexágono ${currentTileId}! (DC de Salvamento: ${finalDc})`;
		await loadTrapsForTile();
		if (props.onDeploySuccess) {
			props.onDeploySuccess();
		}
	} else {
		_logMessage = `💀 FALHA TÉCNICA: Ocorreu um erro ao salvar a armadilha no banco de dados.`;
	}
}

// Remover/Desmontar armadilha instalada recuperando metade das matérias primas
async function _triggerReclaim(trapId: string) {
	const trap = installedTraps.find((t) => t.id === trapId);
	if (!trap) return;

	const delRes = await trapRepository.delete(trapId);
	if (delRes.success) {
		_logMessage = `♻️ RECOLHIDA: Você desarmou e desmontou a armadilha. Parte dos componentes e 50% dos minérios foram devolvidos ao estoque de recursos da oficina.`;

		// Devolve 1 minério de metal de volta por segurança
		characterMaterials["metal-ore"] += 1;

		await loadTrapsForTile();
		if (props.onDeploySuccess) {
			props.onDeploySuccess();
		}
	}
}
</script>

<div class="trap-panel bg-void text-bone rounded-lg border border-bronze/35 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
	
	<!-- Fundo premium com emanação rúnica verde e bronze -->
	<div class="absolute top-0 right-0 w-80 h-80 rounded-full bg-bronze/5 filter blur-[90px] pointer-events-none"></div>

	<!-- Título -->
	<div class="border-b border-bronze/20 pb-4">
		<h2 class="text-xl font-bold uppercase tracking-wider text-ether flex items-center gap-2">
			<span>⚙️</span> Códice de Armadilhas Táticas
		</h2>
		<p class="text-xs text-bone/60 italic mt-1 leading-relaxed">
			Engenharia militar e defesas de downtime. Fabrique engenhos defensivos e posicione no Hexágono ativo do Hexcrawl.
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Coluna da Esquerda: Configuração e Fabricação -->
		<div class="flex flex-col gap-4 bg-ruin/20 border border-bronze/10 p-4 rounded">
			<h3 class="text-sm font-semibold text-ether uppercase tracking-wider">Forjar Nova Armadilha</h3>

			<!-- Seletor de Engenheiro -->
			<div class="flex flex-col gap-1.5 mt-2">
				<label for="engineer-select" class="text-xs font-semibold text-bone/80">Engenheiro Encarregado</label>
				<select
					id="engineer-select"
					bind:value={selectedCharacterId}
					class="w-full bg-void border border-bronze/30 p-2 rounded text-sm text-bone focus:border-ether outline-none"
				>
					{#each characters as char}
						<option value={char.id}>
							{char.name} ({char.classId === "hunter" ? "Caçador 🏹" : char.classId === "emissary" ? "Emissário 📜" : "Outro"})
						</option>
					{/each}
				</select>
				{#if !isSpecialized}
					<p class="text-xs text-blood font-semibold mt-1">
						⚠️ Personagem não é especialista! Apenas Caçador ou Emissário podem forjar armadilhas do Códice.
					</p>
				{/if}
			</div>

			<!-- Recursos Disponíveis do Grupo -->
			<div class="mt-2 grid grid-cols-3 gap-2">
				<div class="bg-void p-2 border border-bronze/20 rounded text-center">
					<p class="text-[10px] text-ether uppercase">Ouro (Cobre)</p>
					<p class="text-sm font-mono font-bold text-bone mt-0.5">{characterGoldCopper}</p>
				</div>
				<div class="bg-void p-2 border border-bronze/20 rounded text-center">
					<p class="text-[10px] text-ether uppercase">Minério</p>
					<p class="text-sm font-mono font-bold text-bone mt-0.5">{characterMaterials["metal-ore"]} un</p>
				</div>
				<div class="bg-void p-2 border border-bronze/20 rounded text-center">
					<p class="text-[10px] text-ether uppercase">Essência</p>
					<p class="text-sm font-mono font-bold text-bone mt-0.5">{characterMaterials["mystic-essence"]} un</p>
				</div>
			</div>

			<!-- Seletor de Armadilha/Tier -->
			<div class="flex flex-col gap-1.5 mt-2">
				<span class="text-xs font-semibold text-bone/80">Escolher Projeto (Códice Capítulo 23)</span>
				<div class="flex flex-col gap-2">
					{#each TRAP_RECIPES as recipe}
						<button
							type="button"
							class="text-left p-3 border rounded transition-all flex flex-col gap-1
								{selectedRecipeId === recipe.id 
									? 'bg-blood-shadow border-bronze shadow-[0_0_8px_rgba(168,120,50,0.1)]' 
									: 'bg-void border-bronze/20 hover:border-bronze/50'}"
							onclick={() => selectedRecipeId = recipe.id}
						>
							<div class="flex justify-between items-center">
								<span class="text-sm font-bold text-bone">Tier {recipe.tier}: {recipe.name}</span>
								<span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ruin border border-bronze/30 text-ether">
									{recipe.type === "mechanical" ? "Mecânica ⚙️" : "Mágica 🔮"}
								</span>
							</div>
							<p class="text-xs text-bone/60">{recipe.description}</p>
							<div class="flex justify-between items-center text-xs mt-2 border-t border-bronze/10 pt-1.5">
								<span class="text-ether">Custo: {recipe.goldCost} cobre + {recipe.materials.map(m => `${m.quantity} ${m.id === 'metal-ore' ? 'Minério' : 'Essência'}`).join(' e ')}</span>
								<span class="text-blood font-semibold">Dano: {recipe.damageText}</span>
							</div>
							<p class="text-[10px] text-ether italic mt-0.5">{recipe.effectLabel}</p>
						</button>
					{/each}
				</div>
			</div>

			<!-- Botão de Fabricar -->
			<button
				type="button"
				class="w-full mt-3 p-3 bg-bronze border border-ether/40 text-void font-extrabold uppercase tracking-wider rounded transition-all hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none"
				disabled={isCrafting || !hasEnoughResources || !isSpecialized}
				onclick={triggerDeploy}
			>
				{#if isCrafting}
					Forjando e Armando...
				{:else}
					Forjar & Instalar no Hexágono
				{/if}
			</button>
		</div>

		<!-- Coluna da Direita: Armadilhas Instaladas e Logs -->
		<div class="flex flex-col gap-4">
			<div class="bg-ruin/20 border border-bronze/10 p-4 rounded flex-1 flex flex-col gap-3">
				<h3 class="text-sm font-semibold text-ether uppercase tracking-wider">Armadilhas no Hexágono {currentTileId}</h3>
				
				{#if isLoadingTraps}
					<div class="text-center py-6 text-sm text-bone/60 animate-pulse">
						Carregando armadilhas rúnicas...
					</div>
				{:else if installedTraps.length === 0}
					<div class="text-center py-10 text-sm text-bone/40 border border-dashed border-bronze/20 rounded">
						Nenhuma armadilha rúnica ou mecânica instalada neste hexágono.
					</div>
				{:else}
					<div class="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
						{#each installedTraps as trap (trap.id)}
							<div class="bg-void border border-bronze/20 p-3 rounded flex justify-between items-center gap-3">
								<div>
									<div class="flex items-center gap-2">
										<p class="text-sm font-bold text-bone">{trap.name}</p>
										<span class="text-[9px] uppercase font-mono px-1 rounded bg-ruin text-ether">
											{trap.type === "mechanical" ? "Mecânica" : "Mágica"}
										</span>
									</div>
									<p class="text-xs text-bone/60 mt-1">DC de Resistência: {10 + trap.dc + (trap.severity === 'simple' ? 1 : trap.severity === 'hidden' ? 3 : 5)}</p>
									<p class="text-xs text-blood/80">Dano: {trap.damage} e debuff ativo</p>
								</div>
								<button
									type="button"
									class="px-2 py-1 bg-ruin border border-blood/40 text-blood rounded text-xs transition-all hover:bg-blood/20 hover:text-bone"
									onclick={() => triggerReclaim(trap.id)}
								>
									Recolher
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Painel de Logs Premium -->
			<div class="bg-void border border-bronze/30 p-4 rounded">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Log de Operações de Engenharia</p>
				<div class="mt-2 text-xs font-mono min-h-[50px] leading-relaxed text-bone/80">
					{logMessage || "Nenhuma operação registrada na bigorna de armadilhas. Pronta para forjar."}
				</div>
			</div>
		</div>
	</div>
</div>


