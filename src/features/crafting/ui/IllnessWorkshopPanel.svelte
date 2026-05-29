<script lang="ts">
import { onMount } from "svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup transition.
import { slide } from "svelte/transition";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character";
import { IllnessService } from "$lib/entities/character/domain/IllnessService";
import {
	BaseCharacterStats,
	EncumberedStatusDecorator,
	EterFeverDecorator,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import { SessionCharacterRepository } from "$lib/entities/character/infrastructure/SessionCharacterRepository";

interface Props {
	characters: readonly CharacterRecord[];
	characterSession: any;
	activeStatusEffects: CharacterStatusEffectRecord[];
}

let {
	characters = [],
	characterSession,
	activeStatusEffects = $bindable([]),
}: Props = $props();

// Inicialização de repositório real e serviço de doenças
const illnessService = $derived(
	new IllnessService(
		characterSession.repository,
		characterSession.service.idProvider,
		characterSession.service.clock,
	),
);

// Estados Reativos do Svelte 5
let selectedCharId = $state("manual-artisan");

$effect(() => {
	if (characters.length > 0 && selectedCharId === "manual-artisan") {
		selectedCharId = characters[0].id;
	}
});

let activeEffects = $derived(activeStatusEffects);
let isRolling = $state(false);
let currentD20Value = $state(20);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let rollMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let rollDetail = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let rollSuccess = $state<boolean | null>(null);

// Personagem ativo selecionado
let activeChar = $derived(
	characters.find((c) => c.id === selectedCharId) || {
		id: "manual-artisan",
		name: "Artífice Viajante",
		concept: "Guerreiro",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "solitary",
		level: 2,
		physical: 2,
		mental: 2,
		social: 1,
		conflict: 1,
		interaction: 1,
		resistance: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
);

// Filtra os efeitos ativos do personagem atual
let charActiveEffects = $derived(
	activeEffects.filter((e) => e.characterId === selectedCharId),
);

// Aplicação de Decoradores (Cebola 🧅) reativamente
let baseStats = $derived(
	new BaseCharacterStats(activeChar, { id: "vanguard", baseHp: 10 }),
);

let decoratedStats = $derived.by(() => {
	let stats = baseStats;
	for (const effect of charActiveEffects) {
		if (effect.type === "eter_fever") {
			stats = new EterFeverDecorator(stats);
		} else if (effect.type === "wound_infection") {
			stats = new WoundInfectionDecorator(stats);
		} else if (effect.type === "viper_poison") {
			stats = new ViperPoisonDecorator(stats);
		}
	}
	// Aplica também o peso do guerreiro padrão (0 de peso para simplicidade no diagnóstico)
	return new EncumberedStatusDecorator(stats, 0);
});

// Catálogo de Doenças do Códex oficial
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const ILLNESSES = [
	{
		type: "eter_fever",
		label: "Febre de Éter",
		dc: 14,
		color: "#c084fc",
		icon: "🤒",
		description: "Energia mística descontrolada ferve o sangue do hospedeiro.",
		effectDesc:
			"Decoradores aplicados: Mente reduz em -1, Resistência reduz em -1 e recalcula HP máximo de forma reativa.",
	},
	{
		type: "wound_infection",
		label: "Infecção de Ferida",
		dc: 12,
		color: "#ef4444",
		icon: "🩸",
		description:
			"Bactérias mundanas tomam conta de cortes abertos após a batalha.",
		effectDesc:
			"Decoradores aplicados: Físico reduz em -1 e bloqueia totalmente a cura natural no acampamento.",
	},
	{
		type: "viper_poison",
		label: "Veneno de Víbora",
		dc: 15,
		color: "#22c55e",
		icon: "🤢",
		description: "Toxina neurotóxica letal que paralisa as articulações.",
		effectDesc:
			"Decoradores aplicados: Físico reduz em -2 e penaliza a Iniciativa básica em -1.",
	},
];

// Infecta o personagem com um status effect
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function infect(type: "eter_fever" | "wound_infection" | "viper_poison") {
	const res = await illnessService.infectCharacter(selectedCharId, type);
	if (res.success) {
		activeStatusEffects = [...activeStatusEffects, res.data];
	}
	rollMessage = null;
	rollDetail = null;
	rollSuccess = null;
}

// Cura o personagem de um status effect
async function cure(type: "eter_fever" | "wound_infection" | "viper_poison") {
	const res = await illnessService.cureCharacter(selectedCharId, type);
	if (res.success) {
		activeStatusEffects = activeStatusEffects.filter(
			(e) => !(e.characterId === selectedCharId && e.type === type),
		);
	}
	rollMessage = null;
	rollDetail = null;
	rollSuccess = null;
}

function getSecureRandom(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / 4294967296;
}

// Simula a rolagem de Vigor (d20 + Nível + Físico + Resistência) com animação
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function rollResistance(
	type: "eter_fever" | "wound_infection" | "viper_poison",
	dc: number,
) {
	if (isRolling) return;

	isRolling = true;
	rollMessage = null;
	rollDetail = null;
	rollSuccess = null;

	// Efeito visual de dados rolando na tela (Gira o d20)
	let count = 0;
	const interval = setInterval(() => {
		currentD20Value = Math.floor(getSecureRandom() * 20) + 1;
		count++;
		if (count > 15) {
			clearInterval(interval);
		}
	}, 60);

	await new Promise((resolve) => setTimeout(resolve, 1000));
	isRolling = false;

	const naturalRoll = currentD20Value;
	// Executa a progressão da doença para este personagem passando o dado fixado d20
	const progressRes = await illnessService.processWeeklyIllnessProgress(
		selectedCharId,
		naturalRoll,
	);
	if (progressRes.success && progressRes.data.length > 0) {
		const prog = progressRes.data[0];
		rollSuccess = prog.rollResult.success;

		// Atualiza a lista global de status effects do repositório
		const reloadRes =
			await characterSession.repository.findStatusEffectsByCharacterId(
				selectedCharId,
			);
		if (reloadRes.success) {
			activeStatusEffects = [
				...activeStatusEffects.filter((e) => e.characterId !== selectedCharId),
				...reloadRes.data,
			];
		}

		if (rollSuccess) {
			rollMessage = "🎉 SUCESSO! Corpo superou a patologia!";
			if (prog.curated) {
				rollDetail = `Você rolou ${naturalRoll} natural (Total: ${prog.rollResult.total} vs DC ${dc}). O vigor de ${activeChar.name} curou a enfermidade!`;
			} else {
				rollDetail = `Você rolou ${naturalRoll} natural (Total: ${prog.rollResult.total} vs DC ${dc}). A gravidade diminuiu de ${prog.oldSeverity} para ${prog.newSeverity}!`;
			}
		} else {
			rollMessage = "💀 FALHA! A infecção se alastra pelo corpo.";
			if (prog.isAggravated) {
				rollDetail = `Você rolou ${naturalRoll} natural (Total: ${prog.rollResult.total} vs DC ${dc}). A gravidade subiu para o limite ${prog.newSeverity} e está AGRAVADA!`;
			} else {
				rollDetail = `Você rolou ${naturalRoll} natural (Total: ${prog.rollResult.total} vs DC ${dc}). A gravidade subiu para ${prog.newSeverity}.`;
			}
		}
	} else {
		rollMessage = "❌ Erro ao processar teste de resistência.";
	}
}
</script>

<div class="illness-panel bg-void text-bone rounded-lg border border-blood-shadow/40 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
	
	<!-- Fundo pulsante místico tóxico alquímico -->
	<div class="absolute top-0 right-0 w-80 h-80 rounded-full bg-blood-shadow/20 filter blur-[85px] pointer-events-none"></div>

	<!-- Título -->
	<div class="border-b border-blood-shadow/30 pb-4 z-10">
		<h2 class="text-xl font-bold uppercase tracking-wider text-ether flex items-center gap-2">
			<span>🧪</span> Códex de Patologias & Farmácia Alquímica
		</h2>
		<p class="text-xs text-bone/60 italic mt-1 leading-relaxed">
			Monitore patologias ativas e teste o vigor corporal do personagem através da fórmula <strong class="text-bronze">d20 + Nível + Físico + Resistência</strong> sob a cebola de <strong class="text-ether">Decorators</strong>.
		</p>
	</div>

	<!-- Seleção de Personagem -->
	<div class="flex flex-col gap-1.5 text-xs z-10 bg-ruin p-4 rounded border border-blood-shadow/30">
		<label for="char-illness-select" class="text-bone/70 font-semibold">Diagnosticar Personagem da Sessão:</label>
		<select 
			id="char-illness-select"
			bind:value={selectedCharId}
			class="bg-void border border-bronze/30 rounded p-2 text-xs font-mono text-ether focus:outline-none focus:border-ether"
		>
			{#each characters as char}
				<option value={char.id} class="bg-void text-bone">{char.name} (Nível {char.level})</option>
			{/each}
			<option value="manual-artisan" class="bg-void text-bone">Artífice Viajante (Nível 2)</option>
		</select>
	</div>

	<!-- Diagnóstico do Estado de Saúde -->
	<div class="grid md:grid-cols-2 gap-6 z-10">
		
		<!-- Ficha Biomecânica de Diagnóstico -->
		<div class="bg-ruin p-4 rounded border border-blood-shadow/30 flex flex-col gap-3">
			<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-blood-shadow/20 pb-2 flex items-center justify-between">
				<span>📊 Diagnóstico Físico & Atributos</span>
				<span class="text-[9px] uppercase font-mono px-2 py-0.5 bg-blood-shadow/40 rounded border border-blood-shadow/50 text-[#ecece3]/90">Cebola Ativa</span>
			</h3>
			
			<div class="grid grid-cols-2 gap-3 text-xs">
				<div class="bg-void p-2.5 rounded border border-blood-shadow/20 text-center">
					<span class="block text-[10px] uppercase text-bone/55">Físico Decorado</span>
					<strong class="text-bone text-base font-mono">{decoratedStats.physical}</strong>
					<span class="block text-[9px] text-bone/50 font-mono">Original: {activeChar.physical}</span>
				</div>
				<div class="bg-void p-2.5 rounded border border-blood-shadow/20 text-center">
					<span class="block text-[10px] uppercase text-bone/55">Mente Decorada</span>
					<strong class="text-bone text-base font-mono">{decoratedStats.mental}</strong>
					<span class="block text-[9px] text-bone/50 font-mono">Original: {activeChar.mental}</span>
				</div>
				<div class="bg-void p-2.5 rounded border border-blood-shadow/20 text-center">
					<span class="block text-[10px] uppercase text-bone/55">Resistência</span>
					<strong class="text-bone text-base font-mono">{decoratedStats.resistance}</strong>
					<span class="block text-[9px] text-bone/50 font-mono">Original: {activeChar.resistance}</span>
				</div>
				<div class="bg-void p-2.5 rounded border border-blood-shadow/20 text-center">
					<span class="block text-[10px] uppercase text-bone/55">HP Máximo</span>
					<strong class="text-bone text-base font-mono">{decoratedStats.maxHp}</strong>
					<span class="block text-[9px] text-bone/50 font-mono">Base: {baseStats.maxHp}</span>
				</div>
			</div>

			<div class="mt-2 bg-void p-3 rounded border border-blood-shadow/20 text-xs flex flex-col gap-2">
				<div class="flex justify-between">
					<span class="text-bone/60">Cura Natural:</span>
					<span class="font-bold {decoratedStats.allowsNaturalRecovery ? 'text-ether' : 'text-blood'}">
						{decoratedStats.allowsNaturalRecovery ? 'PERMITIDA' : 'BLOQUEADA 🚫'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-bone/60">Iniciativa de Combate:</span>
					<span class="font-bold text-bone font-mono">+{decoratedStats.initiativeBase}</span>
				</div>
				<div class="text-[10px] text-bone/50 italic mt-1 leading-relaxed">
					Didática: Note como a cebola envolve os atributos derivados recursivamente, aplicando redutores e desligando a recuperação sem alterar a ficha base.
				</div>
			</div>
		</div>

		<!-- Doenças Ativas e Rolagem de Vigor -->
		<div class="bg-ruin p-4 rounded border border-blood-shadow/30 flex flex-col gap-4">
			<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-blood-shadow/20 pb-2">
				🤒 Estado de Contágio & Vigor
			</h3>

			{#if charActiveEffects.length === 0}
				<div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-void rounded border border-ether/20">
					<span class="text-3xl">🛡️</span>
					<p class="text-xs text-ether font-bold uppercase mt-2">Corpo Imune & Saudável</p>
					<p class="text-[10px] text-bone/50 italic mt-1">Nenhuma enfermidade foi diagnosticada na sessão. Tudo limpo!</p>
				</div>
			{:else}
				<div class="flex flex-col gap-3">
					{#each charActiveEffects as effect}
						{@const details = ILLNESSES.find((i) => i.type === effect.type)}
						{#if details}
							<div class="bg-void p-3 rounded border border-blood-shadow/30 flex flex-col gap-2">
								<div class="flex justify-between items-center">
									<span class="font-bold text-xs" style="color: {details.color};">
										{details.icon} {details.label} (DC {details.dc})
									</span>
									<div class="flex gap-1.5">
										<button 
											onclick={() => rollResistance(effect.type, details.dc)}
											disabled={isRolling}
											class="px-2 py-0.5 rounded bg-bronze/10 hover:bg-bronze/30 border border-bronze/40 text-bronze font-bold text-[9px] uppercase tracking-wider transition-all disabled:opacity-50"
										>
											🎲 Testar Vigor
										</button>
										<button 
											onclick={() => cure(effect.type)}
											class="px-2 py-0.5 rounded bg-ether/10 hover:bg-ether/30 border border-ether/40 text-ether font-bold text-[9px] uppercase tracking-wider transition-all"
										>
											🧪 Curar
										</button>
									</div>
								</div>
								<p class="text-[10px] text-bone/70">{details.description}</p>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Mesa de Rolagem Interativa (d20 Físico Animado) -->
	<div class="anvil-workspace bg-ruin border border-blood-shadow/40 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] relative">
		
		<!-- Overlay Alquímico Tóxico -->
		{#if isRolling}
			<div class="absolute inset-0 bg-blood-shadow/30 filter blur-xl animate-pulse"></div>
		{/if}

		<div class="flex flex-col items-center z-10">
			<!-- Dado d20 Estilizado com HSL e Rotações -->
			<div 
				class="d20-die flex items-center justify-center font-extrabold text-2xl text-bone transition-transform duration-300
					{isRolling ? 'animate-die-spin border-dashed border-ether' : 'border-double border-ether/60'}"
				style="width: 70px; height: 70px; background-color: var(--color-void); border-width: 4px; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); font-family: monospace;"
			>
				{currentD20Value}
			</div>
			
			<div class="text-[10px] uppercase font-bold text-ether tracking-widest mt-4">
				{isRolling ? "Sacudindo o Frasco..." : "Mesa de Teste Alquímica"}
			</div>
		</div>

		{#if rollMessage}
			<div 
				transition:slide={{ duration: 300 }}
				class="w-full mt-4 p-4 rounded border text-xs flex flex-col gap-1.5
					{rollSuccess ? 'bg-void border-ether/30 text-ether' : 'bg-blood-shadow border-blood/25 text-blood'}"
			>
				<strong class="uppercase text-sm">{rollMessage}</strong>
				<p class="leading-relaxed text-bone/80">{rollDetail}</p>
			</div>
		{/if}
	</div>

	<!-- Simulação e Laboratório de Contágio -->
	<div class="crafted-items-section flex flex-col gap-4 bg-ruin p-4 rounded border border-blood-shadow/30 z-10">
		<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-blood-shadow/20 pb-2">
			🧪 Laboratório Alquímico: Provocar Infecções (Simulador)
		</h3>
		
		<div class="grid sm:grid-cols-3 gap-3">
			{#each ILLNESSES as illness}
				{@const active = charActiveEffects.some((e) => e.type === illness.type)}
				<div class="bg-void p-3 rounded border border-blood-shadow/20 flex flex-col gap-2 justify-between">
					<div>
						<div class="flex justify-between items-center">
							<span class="font-bold text-xs" style="color: {illness.color};">
								{illness.icon} {illness.label}
							</span>
							<span class="text-[9px] uppercase font-mono bg-ruin text-bone/50 px-1 py-0.5 rounded border border-blood-shadow/30">
								DC {illness.dc}
							</span>
						</div>
						<p class="text-[10px] text-bone/60 mt-1 leading-relaxed">{illness.description}</p>
						<p class="text-[9px] text-bone/40 mt-1.5 leading-relaxed italic">{illness.effectDesc}</p>
					</div>

					<button
						onclick={() => active ? cure(illness.type) : infect(illness.type)}
						class="w-full mt-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] transition-all
							{active 
								? 'bg-ether/10 border border-ether/30 text-ether hover:bg-ether/25' 
								: 'bg-blood-shadow border border-blood/25 text-blood hover:bg-blood-shadow/60'}"
					>
						{active ? "🧪 Curar Doença" : "☣️ Infectar Personagem"}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>
