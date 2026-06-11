<script lang="ts">
import type { CharacterRepository } from "$lib/entities/character/domain/CharacterRepository";
import { IllnessService } from "$lib/entities/character/domain/IllnessService";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";

interface Props {
	characters: readonly CharacterRecord[];
	activeStatusEffects: readonly CharacterStatusEffectRecord[];
	characterRepository: CharacterRepository;
	onCureSuccess?: () => void | Promise<void>;
}

let props: Props = $props();
let characters = $derived(props.characters);
let activeStatusEffects = $derived(props.activeStatusEffects);
let characterRepository = $derived(props.characterRepository);

// Instanciar o IllnessService
const illnessService = $derived(
	new IllnessService(
		characterRepository,
		{ generate: () => `illness-gen-${crypto.randomUUID()}` },
		{ now: () => new Date().toISOString() },
	),
);

// Recursos Locais do Boticário (para a simulação de Alquimia no Acampamento)
let apothecaryGold = $state(200); // Cobre/ouro local
let apothecaryEssence = $state(4);
let apothecaryOre = $state(5);

// Opções de Antídotos do Códex
interface AntidoteRecipe {
	id: string;
	name: string;
	description: string;
	targetType: "eter_fever" | "wound_infection" | "viper_poison";
	targetLabel: string;
	goldCost: number;
	oreCost: number;
	essenceCost: number;
}

const ANTIDOTE_RECIPES: AntidoteRecipe[] = [
	{
		id: "ant-ether-tea",
		name: "Chá de Folha-de-Éter",
		description: "Infusão quente de folhas colhidas que alivia a febre mágica.",
		targetType: "eter_fever",
		targetLabel: "Febre do Éter",
		goldCost: 10,
		oreCost: 0,
		essenceCost: 1,
	},
	{
		id: "ant-alloy-balsam",
		name: "Bálsamo de Ligas Metálicas",
		description:
			"Pomada viscosa de minérios moídos para fechar feridas infectadas.",
		targetType: "wound_infection",
		targetLabel: "Infecção de Ferida",
		goldCost: 15,
		oreCost: 1,
		essenceCost: 0,
	},
	{
		id: "ant-viper-elixir",
		name: "Antiveneno Purificado",
		description: "Elixir purificador concentrado que quebra toxinas de veneno.",
		targetType: "viper_poison",
		targetLabel: "Veneno de Víbora",
		goldCost: 20,
		oreCost: 0,
		essenceCost: 1,
	},
];

let selectedRecipeId = $state(ANTIDOTE_RECIPES[0].id);
let selectedRecipe = $derived(
	ANTIDOTE_RECIPES.find((r) => r.id === selectedRecipeId) ||
		ANTIDOTE_RECIPES[0],
);

let selectedCharacterId = $state("");
let _logMessage = $state("");
let _isCrafting = $state(false);

// Sincronizar herói selecionado inicialmente
$effect(() => {
	if (characters && characters.length > 0 && !selectedCharacterId) {
		selectedCharacterId = characters[0].id;
	}
});

// biome-ignore lint/correctness/noUnusedVariables: referenced in template
let characterIllnesses = $derived.by(() => {
	if (!selectedCharacterId) return [];
	return activeStatusEffects.filter(
		(e) =>
			e.characterId === selectedCharacterId &&
			(e.type === "eter_fever" ||
				e.type === "wound_infection" ||
				e.type === "viper_poison"),
	);
});

let activeCharacter = $derived(
	characters.find((c) => c.id === selectedCharacterId),
);

// Requisitos de fabricação da receita selecionada
let hasEnoughResources = $derived(
	apothecaryGold >= selectedRecipe.goldCost &&
		apothecaryOre >= selectedRecipe.oreCost &&
		apothecaryEssence >= selectedRecipe.essenceCost,
);

// Fabricar e aplicar o remédio ao personagem selecionado
async function _triggerCure(
	diseaseType: "eter_fever" | "wound_infection" | "viper_poison",
) {
	if (!activeCharacter) return;

	const recipe = ANTIDOTE_RECIPES.find((r) => r.targetType === diseaseType);
	if (!recipe) return;

	if (
		apothecaryGold < recipe.goldCost ||
		apothecaryOre < recipe.oreCost ||
		apothecaryEssence < recipe.essenceCost
	) {
		_logMessage = `⚠️ Recursos insuficientes para destilar o antídoto!`;
		return;
	}

	_isCrafting = true;
	_logMessage = `🧪 Destilando antídoto para expurgar a patologia de ${activeCharacter.name}...`;

	await new Promise((resolve) => setTimeout(resolve, 800));

	// Consumir recursos
	apothecaryGold -= recipe.goldCost;
	apothecaryOre -= recipe.oreCost;
	apothecaryEssence -= recipe.essenceCost;

	const res = await illnessService.cureCharacter(
		selectedCharacterId,
		diseaseType,
	);
	_isCrafting = false;

	if (res.success) {
		_logMessage = `✅ SUCESSO ALQUÍMICO: A patologia foi curada com êxito! ${activeCharacter.name} está livre do debuff.`;
		if (props.onCureSuccess) {
			await props.onCureSuccess();
		}
	} else {
		_logMessage = `💀 Falha Alquímica: ${res.error.message}`;
	}
}

// Fabricar antídoto e colocar no estoque local
async function _triggerCraftOnly() {
	if (!hasEnoughResources) return;

	_isCrafting = true;
	_logMessage = `🧪 Preparando componentes de ${selectedRecipe.name}...`;

	await new Promise((resolve) => setTimeout(resolve, 800));

	// Consumir recursos
	apothecaryGold -= selectedRecipe.goldCost;
	apothecaryOre -= selectedRecipe.oreCost;
	apothecaryEssence -= selectedRecipe.essenceCost;

	// Adiciona estoque local
	_isCrafting = false;
	_logMessage = `✅ Antídoto "${selectedRecipe.name}" destilado com sucesso e adicionado ao estoque do boticário!`;
}
</script>

<div class="apothecary-panel bg-void text-bone rounded-lg border border-bronze/35 p-5 flex flex-col gap-5 relative overflow-hidden shadow-xl">
	
	<!-- Fundo rúnico sutil com emanação verde esmeralda mística -->
	<div class="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-poison/5 filter blur-[80px] pointer-events-none"></div>

	<!-- Título -->
	<div class="border-b border-bronze/20 pb-3 flex justify-between items-center">
		<div>
			<h3 class="text-lg font-bold uppercase tracking-wider text-emerald-poison flex items-center gap-2">
				<span>🧪</span> Oficina de Boticário e Alquimia
			</h3>
			<p class="text-xs text-bone/60 italic mt-0.5">
				Destile poções de cura para enfermidades e venenos biomecânicos durante o acampamento.
			</p>
		</div>
	</div>

	<div class="grid gap-5 md:grid-cols-2">
		<!-- Coluna da Esquerda: Destilação de Medicamentos -->
		<div class="flex flex-col gap-3.5 bg-ruin/20 border border-bronze/15 p-4 rounded-md">
			<h4 class="text-xs font-semibold text-emerald-poison uppercase tracking-wider">Laboratório de Infusões</h4>

			<!-- Recursos Locais -->
			<div class="grid grid-cols-3 gap-2 bg-void/50 p-2.5 rounded border border-bronze/15 text-center">
				<div>
					<p class="text-[9px] text-bone/50 uppercase font-mono">Cobre</p>
					<p class="text-xs font-mono font-bold text-bone mt-0.5">{apothecaryGold}</p>
				</div>
				<div>
					<p class="text-[9px] text-bone/50 uppercase font-mono">Minério</p>
					<p class="text-xs font-mono font-bold text-bone mt-0.5">{apothecaryOre} un</p>
				</div>
				<div>
					<p class="text-[9px] text-bone/50 uppercase font-mono">Essência</p>
					<p class="text-xs font-mono font-bold text-bone mt-0.5">{apothecaryEssence} un</p>
				</div>
			</div>

			<!-- Escolha da Receita -->
			<div class="flex flex-col gap-1.5 mt-1">
				<span class="text-[10px] font-semibold text-bone/80 uppercase tracking-wider">Fórmula do Boticário</span>
				<div class="flex flex-col gap-2">
					{#each ANTIDOTE_RECIPES as recipe}
						<button
							type="button"
							class="text-left p-2.5 border rounded transition-all flex flex-col gap-1
								{selectedRecipeId === recipe.id 
									? 'bg-emerald-poison/10 border-emerald-poison/60 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
									: 'bg-void border-bronze/20 hover:border-bronze/50'}"
							onclick={() => selectedRecipeId = recipe.id}
						>
							<div class="flex justify-between items-center">
								<span class="text-xs font-bold text-bone">{recipe.name}</span>
								<span class="text-[8px] uppercase font-mono px-1 py-0.5 rounded bg-ruin text-emerald-poison border border-emerald-poison/30">
									Cura {recipe.targetLabel}
								</span>
							</div>
							<p class="text-[10px] text-bone/60 leading-normal">{recipe.description}</p>
							<div class="text-[9px] text-ether font-semibold border-t border-bronze/10 pt-1.5 mt-1.5">
								Requisitos: {recipe.goldCost} cobre {#if recipe.oreCost > 0} + {recipe.oreCost} Minério{/if}{#if recipe.essenceCost > 0} + {recipe.essenceCost} Essência{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>

			<button
				type="button"
				class="w-full mt-1 p-2 bg-emerald-poison hover:bg-emerald-poison/90 text-void font-bold text-xs uppercase tracking-wider rounded transition-all disabled:opacity-40 cursor-pointer"
				disabled={_isCrafting || !hasEnoughResources}
				onclick={_triggerCraftOnly}
			>
				{_isCrafting ? "Misturando Reagentes..." : "Destilar & Estocar Antídoto"}
			</button>
		</div>

		<!-- Coluna da Direita: Diagnóstico e Tratamento -->
		<div class="flex flex-col gap-4">
			<div class="bg-ruin/20 border border-bronze/15 p-4 rounded-md flex-1 flex flex-col gap-3">
				<h4 class="text-xs font-semibold text-emerald-poison uppercase tracking-wider">Aba de Diagnóstico</h4>

				<!-- Seletor de Paciente -->
				<div class="flex flex-col gap-1">
					<label for="patient-select" class="text-[10px] font-semibold text-bone/80 uppercase">Aventureiro Internado</label>
					<select
						id="patient-select"
						bind:value={selectedCharacterId}
						class="w-full bg-void border border-bronze/35 p-2 rounded text-xs text-bone focus:border-emerald-poison outline-none"
					>
						{#each characters as char}
							<option value={char.id}>{char.name}</option>
						{/each}
					</select>
				</div>

				<!-- Patologias Ativas no Paciente -->
				<div class="flex-1 flex flex-col gap-2.5 mt-1">
					<span class="text-[10px] font-semibold text-bone/80 uppercase tracking-wider">Patologias em Diagnóstico</span>
					
					{#if characterIllnesses.length === 0}
						<div class="flex-1 flex items-center justify-center p-6 border border-dashed border-bronze/20 rounded text-center text-xs text-bone/45 italic">
							Nenhuma infecção ou febre ativa detectada no Andarilho.
						</div>
					{:else}
						<div class="flex flex-col gap-2">
							{#each characterIllnesses as illness}
								<div class="bg-void border border-bronze/25 p-3 rounded flex flex-col gap-2">
									<div class="flex justify-between items-center">
										<p class="text-xs font-bold text-bone">
											{illness.type === 'eter_fever' ? 'Febre do Éter 🔮' : illness.type === 'wound_infection' ? 'Infecção de Ferida ⚙️' : 'Veneno de Víbora 🐍'}
										</p>
										<span class="text-[9px] uppercase font-mono px-1 py-0.5 rounded bg-ruin text-blood border border-blood/20">
											Severidade: {illness.severity} / {illness.severityMax}
										</span>
									</div>
									<div class="flex justify-between items-center text-[10px] text-bone/60">
										<span>Cura recomendada: {illness.type === 'eter_fever' ? 'Chá de Éter' : illness.type === 'wound_infection' ? 'Bálsamo' : 'Antiveneno'}</span>
										<button
											type="button"
											class="px-2 py-1 bg-emerald-poison/20 border border-emerald-poison/40 text-emerald-poison rounded text-[10px] transition-all hover:bg-emerald-poison hover:text-void font-bold cursor-pointer"
											onclick={() => _triggerCure(illness.type as any)}
										>
											Tratar Paciente
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Diário da Bigorna de Alquimia -->
			<div class="bg-void border border-bronze/30 p-3.5 rounded">
				<p class="text-[10px] font-semibold text-emerald-poison uppercase tracking-wider">Relatório do Alquimista</p>
				<div class="mt-1.5 text-[10px] font-mono min-h-[40px] leading-relaxed text-bone/85">
					{_logMessage || "A oficina está limpa. Reagentes prontos para destilação."}
				</div>
			</div>
		</div>
	</div>
</div>
