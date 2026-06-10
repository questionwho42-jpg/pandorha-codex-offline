<script lang="ts">
import { onMount } from "svelte";
import {
	applyStatusEffects,
	BaseCharacterStats,
	type ICharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { DialogueService } from "$lib/entities/dialogue/domain/DialogueService";
import type { DialogueTree } from "$lib/entities/dialogue/domain/dialogueTypes";
import { WorkerDialogueRepository } from "$lib/entities/dialogue/infrastructure/WorkerDialogueRepository";
import type { DialogueStateData } from "$lib/entities/dialogue/model/dialogueSchema";
import { DIALOGUE_TREES } from "../model/dialogueTrees";
import {
	BaseDialogueLogFormatter,
	ChallengeHighlightDecorator,
	ClueHighlightDecorator,
	EeHighlightDecorator,
} from "./DialogueLogFormatter";

interface Props {
	characters: readonly CharacterRecord[];
	characterClasses: readonly CharacterClassRecord[];
	activeStatusEffects: readonly CharacterStatusEffectRecord[];
	initialTreeId?: string | undefined;
	onClose?: () => void;
}

let props: Props = $props();
let characters = $derived(props.characters);
let characterClasses = $derived(props.characterClasses);
let activeStatusEffects = $derived(props.activeStatusEffects);

const repository = new WorkerDialogueRepository();
const service = new DialogueService(repository);

let selectedCharacterId = $state("");
let selectedTreeId = $state(
	props.initialTreeId || (DIALOGUE_TREES[0]?.id ?? ""),
);
let activeState = $state<DialogueStateData | null>(null);

$effect(() => {
	if (props.initialTreeId) {
		selectedTreeId = props.initialTreeId;
	}
});
let dialogueLogs = $state<string[]>([]);
let globalUnlockedClues = $state<string[]>([]);
let charactersEe = $state<Record<string, number>>({});

let isRolling = $state(false);
let d20NaturalRoll = $state<number | null>(null);
let pendingOptionId = $state<string | null>(null);

let selectedTree = $derived(
	(DIALOGUE_TREES.find((t) => t.id === selectedTreeId) ||
		DIALOGUE_TREES[0]) as DialogueTree,
);

let _currentNode = $derived(
	activeState
		? selectedTree.nodes[activeState.currentConversationNodeId]
		: null,
);

let activeCharacter = $derived(
	characters.find((c) => c.id === selectedCharacterId) || null,
);

let charEffects = $derived(
	activeStatusEffects
		.filter((e) => e.characterId === selectedCharacterId)
		.map((e) => ({
			type: e.type,
			severity: e.severity,
			metadata: e.metadata ?? null,
		})),
);

let activeCharacterStats = $derived.by<ICharacterStats | null>(() => {
	if (!activeCharacter) return null;
	const realClass = characterClasses.find(
		(c) => c.id === activeCharacter.classId,
	);
	const base = new BaseCharacterStats(activeCharacter, {
		id: realClass ? realClass.id : "warrior",
		baseHp: realClass ? realClass.baseHp : 10,
	});

	return applyStatusEffects(base, charEffects);
});

const rawFormatter = new BaseDialogueLogFormatter();
const _decoratedFormatter = new ClueHighlightDecorator(
	new ChallengeHighlightDecorator(new EeHighlightDecorator(rawFormatter)),
);

onMount(async () => {
	const firstChar = characters[0];
	if (firstChar) {
		selectedCharacterId = firstChar.id;
	}

	const storedEe = localStorage.getItem("pandorha_characters_ee");
	if (storedEe) {
		try {
			charactersEe = JSON.parse(storedEe);
		} catch (e) {
			console.error(e);
		}
	}

	for (const c of characters) {
		if (charactersEe[c.id] === undefined) {
			charactersEe[c.id] = 5;
		}
	}
	saveEe();

	const storedClues = localStorage.getItem("pandorha_unlocked_clues");
	if (storedClues) {
		try {
			globalUnlockedClues = JSON.parse(storedClues);
		} catch (e) {
			console.error(e);
		}
	}

	await loadDialogueState();
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function saveEe() {
	localStorage.setItem("pandorha_characters_ee", JSON.stringify(charactersEe));
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function saveGlobalClues() {
	localStorage.setItem(
		"pandorha_unlocked_clues",
		JSON.stringify(globalUnlockedClues),
	);
}

async function loadDialogueState() {
	if (!selectedCharacterId) return;
	const res = await service.getOrCreateState(
		selectedCharacterId,
		selectedTree.npcId,
		selectedTree.id,
	);

	if (res.success) {
		activeState = res.data;
		const stateClues = JSON.parse(res.data.unlockedCluesJson) as string[];
		let changed = false;
		for (const clue of stateClues) {
			if (!globalUnlockedClues.includes(clue)) {
				globalUnlockedClues.push(clue);
				changed = true;
			}
		}
		if (changed) saveGlobalClues();
	}
}

$effect(() => {
	if (selectedCharacterId && selectedTreeId) {
		loadDialogueState();
	}
});

async function _selectOption(optionId: string) {
	if (!selectedCharacterId || !activeState || isRolling) return;

	const node = selectedTree.nodes[activeState.currentConversationNodeId];
	const option = node?.options.find((o) => o.id === optionId);
	if (!option) return;

	if (option.socialChallenge) {
		pendingOptionId = optionId;
		isRolling = true;
		d20NaturalRoll = null;

		let count = 0;
		const interval = setInterval(() => {
			const randomArray = new Uint32Array(1);
			crypto.getRandomValues(randomArray);
			d20NaturalRoll = (randomArray[0] % 20) + 1;
			count++;
			if (count > 8) {
				clearInterval(interval);
				executeSocialAdvance();
			}
		}, 120);
		return;
	}

	await executeAdvance(optionId);
}

async function executeSocialAdvance() {
	if (!pendingOptionId || d20NaturalRoll === null) return;
	await executeAdvance(pendingOptionId, d20NaturalRoll);
	isRolling = false;
	pendingOptionId = null;
}

async function executeAdvance(optionId: string, rollVal?: number) {
	if (!selectedCharacterId || !activeState) return;

	const currentEe = charactersEe[selectedCharacterId] ?? 5;
	const stats = activeCharacterStats;

	const res = await service.advance(
		selectedCharacterId,
		selectedTree.npcId,
		selectedTree,
		optionId,
		rollVal,
		{
			ee: currentEe,
			social: stats?.social ?? 0,
			mental: stats?.mental ?? 0,
		},
		globalUnlockedClues,
	);

	if (res.success) {
		activeState = res.data.state;
		dialogueLogs = [...dialogueLogs, res.data.log];

		if (res.data.effectsApplied) {
			const fx = res.data.effectsApplied;
			if (fx.consumeEe) {
				charactersEe[selectedCharacterId] = Math.max(
					0,
					currentEe - fx.consumeEe,
				);
				saveEe();
			}
			if (fx.unlockClues) {
				for (const clue of fx.unlockClues) {
					if (!globalUnlockedClues.includes(clue)) {
						globalUnlockedClues = [...globalUnlockedClues, clue];
					}
				}
				saveGlobalClues();
			}
		}
	} else {
		dialogueLogs = [...dialogueLogs, `⚠️ Erro: ${res.error.message}`];
	}
}

async function _resetDialogue() {
	if (!selectedCharacterId || !activeState) return;

	const res = await repository.delete(activeState.id);
	if (res.success) {
		dialogueLogs = [
			...dialogueLogs,
			`✦ O destino foi rebobinado para ${selectedTree.npcId}.`,
		];
		await loadDialogueState();
	}
}

function _restParty() {
	for (const c of characters) {
		charactersEe[c.id] = 5;
	}
	saveEe();
	dialogueLogs = [
		...dialogueLogs,
		"✦ A party descansou. O Esforço Extra (EE) de todos foi restabelecido para 5.",
	];
}
</script>

<div class="grid lg:grid-cols-[1fr_300px] gap-6 p-4 md:p-6 bg-void text-bone font-sans min-h-[500px]">
	<!-- Painel Principal do Diálogo -->
	<div class="flex flex-col gap-5 p-5 bg-ruin/75 border border-bronze/45 rounded-lg shadow-2xl backdrop-blur-md">
		<!-- Header de Controle e Configuração -->
		<div class="flex flex-wrap gap-4 items-center justify-between border-b border-ether/20 pb-4">
			<div>
				<h2 class="text-xl font-bold uppercase tracking-wider text-ether">
					🎭 Investigação Narrativa
				</h2>
				<p class="text-xs text-bone/60 mt-0.5">
					Escolhas condicionais que dependem do estado do mundo, pistas e esforço físico.
				</p>
			</div>
			
			<div class="flex flex-wrap gap-3">
				<div class="flex flex-col gap-1">
					<label class="text-[10px] uppercase font-bold text-bronze tracking-wider" for="npc-select">Falar com NPC:</label>
					<select
						id="npc-select"
						bind:value={selectedTreeId}
						class="bg-void border border-bronze/40 text-bone text-xs rounded px-2.5 py-1.5 focus:border-ether outline-none transition-all"
					>
						{#each DIALOGUE_TREES as tree}
							<option value={tree.id}>
								{tree.npcId === 'npc-merchant' ? 'Silas o Mercador' : tree.npcId === 'npc-alchemist' ? 'Eldrin o Alquimista' : 'Silas o Escriba'}
							</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-[10px] uppercase font-bold text-bronze tracking-wider" for="char-select">Interlocutor Ativo:</label>
					<select
						id="char-select"
						bind:value={selectedCharacterId}
						class="bg-void border border-bronze/40 text-bone text-xs rounded px-2.5 py-1.5 focus:border-ether outline-none transition-all"
					>
						{#each characters as char}
							<option value={char.id}>{char.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Status do Personagem Ativo -->
		{#if activeCharacterStats}
			<div class="flex flex-wrap gap-4 items-center justify-between bg-void/50 border border-bronze/20 rounded p-3 text-xs">
				<div class="flex items-center gap-2">
					<span class="text-bronze text-base">✦</span>
					<div>
						<span class="font-bold text-bone">{activeCharacter?.name}</span>
						<span class="text-[10px] text-bone/50 block font-mono">
							Mental: {activeCharacterStats.mental} | Social: {activeCharacterStats.social}
						</span>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-1.5 bg-ruin px-2.5 py-1 rounded border border-bronze/30">
						<span class="text-[10px] text-bronze font-bold uppercase tracking-wider">Esforço (EE):</span>
						<span class="font-mono font-bold text-emerald-poison">
							{charactersEe[selectedCharacterId] ?? 5} / 5
						</span>
					</div>
					
					{#if activeStatusEffects.filter(e => e.characterId === selectedCharacterId).length > 0}
						<div class="flex gap-1">
							{#each activeStatusEffects.filter(e => e.characterId === selectedCharacterId) as eff}
								<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blood-shadow border border-blood/50 text-bone uppercase tracking-wider">
									{eff.type === 'eter_fever' ? 'Febre Éter' : eff.type === 'viper_poison' ? 'Veneno' : eff.type === 'hungry' ? 'Fome' : 'Infecção'}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="p-3 bg-blood-shadow/20 border border-blood/30 rounded text-center text-xs text-bone/70">
				Nenhum herói ativo. Crie um personagem na aba "Personagens" para iniciar a conversa!
			</div>
		{/if}

		<!-- Log e Tela de Diálogo Físico -->
		<div class="flex flex-col gap-4 flex-1 min-h-[220px] bg-void/70 border border-bronze/25 rounded p-4 overflow-y-auto leading-relaxed relative">
			{#if currentNode}
				<div class="border-l-2 border-ether pl-3 py-1 bg-ether/5 rounded-r">
					<p class="text-[10px] uppercase font-bold text-ether tracking-widest">
						{selectedTree.npcId === 'npc-merchant' ? 'Silas o Mercador' : selectedTree.npcId === 'npc-alchemist' ? 'Eldrin o Alquimista' : 'Silas o Escriba'} diz:
					</p>
					<p class="text-sm italic text-bone/90 mt-1">
						"{currentNode.npcText}"
					</p>
				</div>
			{:else}
				<p class="text-xs text-bone/40 text-center my-auto">Diálogo não inicializado.</p>
			{/if}

			{#if currentNode && currentNode.options.length > 0}
				<div class="flex flex-col gap-2 mt-4 pt-4 border-t border-bronze/10">
					{#each currentNode.options as opt}
						{@const isEeBlocked = opt.conditions?.requiredMinEe !== undefined && (charactersEe[selectedCharacterId] ?? 5) < opt.conditions.requiredMinEe}
						{@const isClueBlocked = opt.conditions?.requiredClues !== undefined && opt.conditions.requiredClues.some(c => !globalUnlockedClues.includes(c))}
						{@const isBlocked = isEeBlocked || isClueBlocked}

						<button
							type="button"
							onclick={() => selectOption(opt.id)}
							disabled={isBlocked || isRolling}
							class="w-full text-left p-3 rounded border text-xs transition-all relative overflow-hidden group
								{isBlocked 
									? 'bg-void/40 border-void/50 text-bone/35 cursor-not-allowed' 
									: 'bg-ruin border-bronze/35 text-bone hover:border-ether hover:bg-void hover:text-ether'}"
						>
							<div class="flex items-center justify-between gap-3">
								<span class="flex-1 font-medium">{opt.playerText}</span>

								<div class="flex gap-1 shrink-0">
									{#if opt.conditions?.requiredMinEe}
										<span class="px-1.5 py-0.5 rounded text-[8px] font-mono
											{isEeBlocked ? 'bg-blood-shadow/50 text-blood border border-blood/35' : 'bg-bronze/20 text-bronze border border-bronze/40'}">
											{opt.conditions.requiredMinEe} EE
										</span>
									{/if}
									{#if opt.conditions?.requiredClues}
										<span class="px-1.5 py-0.5 rounded text-[8px] font-mono
											{isClueBlocked ? 'bg-blood-shadow/50 text-blood border border-blood/35' : 'bg-sky-runic/10 text-sky-runic border border-sky-runic/30'}">
											Requer Pista
										</span>
									{/if}
									{#if opt.socialChallenge}
										<span class="px-1.5 py-0.5 rounded text-[8px] font-mono bg-purple-runic/10 text-purple-runic border border-purple-runic/30">
											Teste {opt.socialChallenge.matrix.toUpperCase()} CD {opt.socialChallenge.difficultyClass}
										</span>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			{:else if currentNode}
				<div class="text-center mt-6 py-4 border-t border-bronze/10">
					<p class="text-xs text-bone/50 italic">A conversa chegou ao fim.</p>
					<button
						type="button"
						onclick={resetDialogue}
						class="mt-3 bg-bronze hover:bg-ether text-void text-xs font-bold py-1.5 px-4 rounded transition-all uppercase tracking-wider"
					>
						Reiniciar Diálogo
					</button>
				</div>
			{/if}

			{#if isRolling}
				<div class="absolute inset-0 bg-void/90 flex flex-col items-center justify-center gap-3 rounded transition-all duration-300">
					<div class="w-16 h-16 border-2 border-purple-runic rounded-full flex items-center justify-center animate-spin bg-purple-runic/10 shadow-[0_0_15px_rgba(192,132,252,0.4)]">
						<span class="text-xl font-bold font-mono text-purple-runic">{d20NaturalRoll ?? '?'}</span>
					</div>
					<p class="text-xs text-purple-runic font-bold uppercase tracking-wider animate-pulse">
						Rolando d20 contra CD...
					</p>
				</div>
			{/if}
		</div>

		<!-- Footer de Ações Rápidas -->
		<div class="flex gap-3 justify-end border-t border-bronze/10 pt-4 text-xs">
			{#if props.onClose}
				<button
					type="button"
					onclick={props.onClose}
					class="bg-void border border-ether/40 hover:bg-ether/10 text-ether px-3 py-1.5 rounded transition-all font-semibold uppercase tracking-wider text-[10px]"
				>
					🧭 Retornar ao Mapa
				</button>
			{/if}
			<button
				type="button"
				onclick={restParty}
				class="bg-void border border-bronze/35 hover:border-bronze hover:text-bronze text-bone/80 px-3 py-1.5 rounded transition-all font-semibold uppercase tracking-wider text-[10px]"
			>
				⛺ Descansar Party (+EE)
			</button>
			<button
				type="button"
				onclick={resetDialogue}
				class="bg-void border border-blood/50 hover:bg-blood/10 text-blood px-3 py-1.5 rounded transition-all font-semibold uppercase tracking-wider text-[10px]"
			>
				⟲ Rebobinar Conversa
			</button>
		</div>
	</div>

	<!-- Barra Lateral de Pistas e Logs Modularizada -->
	<div class="flex flex-col gap-5">
		<ClueList unlockedClues={globalUnlockedClues} />
		<DialogueHistoryLog
			logs={dialogueLogs}
			formatter={decoratedFormatter}
			onClear={() => {
				dialogueLogs = [];
			}}
		/>
	</div>
</div>
