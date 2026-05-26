<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import type { DialogueChoiceRecord } from "$lib/entities/dialogue-choice";
import type {
	DialogueNodeRecord,
	DialogueOptionRecord,
} from "$lib/entities/dialogue-tree";
import type { NpcRecord } from "$lib/entities/npc";
import type {
	SocialEncounterEventRecord,
	SocialEncounterRecord,
} from "$lib/entities/social-encounter";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import type { Result } from "$lib/shared/lib/result";
import type {
	DialogueTraversalFailure,
	DialogueTraversalResult,
} from "../model/dialogueTraversalTypes";
import type {
	SocialAppealResolutionFailure,
	SocialAppealResolutionResult,
} from "../model/socialAppealResolutionTypes";
import {
	createSocialDialogueChoiceProfile,
	type SocialDialogueChoiceProfile,
} from "../model/socialDialogueChoiceProfile";
import {
	createSocialDialogueTreeView,
	resolveDialogueChoiceIdFromEvents,
} from "../model/socialDialogueTreeView";
import {
	createSocialEncounterConsequenceFlag,
	createSocialEncounterConsequenceView,
	upsertSocialEncounterConsequenceFlag,
} from "../model/socialEncounterConsequences";
import {
	createSocialEncounterRecordsFromState,
	createSocialEncounterStateFromRecords,
} from "../model/socialEncounterPersistence";
import type {
	SocialEncounterFailure,
	SocialEncounterState,
} from "../model/socialEncounterTypes";
import {
	createSocialEncounterView,
	mapSocialAppealResolutionFailureToMessage,
	mapSocialEncounterFailureToMessage,
} from "../model/socialEncounterView";

type StartEncounterInput = {
	readonly id: string;
	readonly actorId: string;
	readonly npcId: string;
	readonly requestComplexity: number;
	readonly createdAt: string;
};

type AppealInput = {
	readonly state: SocialEncounterState;
	readonly command: unknown;
	readonly outcome: SocialAppealResolutionResult["outcome"];
	readonly resolvedAt: string;
};

type PersistedRecords = {
	readonly socialEncounters: readonly SocialEncounterRecord[];
	readonly socialEncounterEvents: readonly SocialEncounterEventRecord[];
};

type Props = {
	readonly characters: readonly CharacterRecord[];
	readonly createAppealInput: (
		state: SocialEncounterState,
		resolution: SocialAppealResolutionResult,
		profile: SocialDialogueChoiceProfile,
	) => AppealInput;
	readonly createAppealResolutionInput: (
		state: SocialEncounterState,
		character: CharacterRecord,
		profile: SocialDialogueChoiceProfile,
	) => unknown;
	readonly createStartInput: (
		npcId: string,
		actorId: string,
	) => StartEncounterInput;
	readonly dialogueChoices: readonly DialogueChoiceRecord[];
	readonly dialogueNodes: readonly DialogueNodeRecord[];
	readonly dialogueOptions: readonly DialogueOptionRecord[];
	readonly encounterEvents: readonly SocialEncounterEventRecord[];
	readonly encounters: readonly SocialEncounterRecord[];
	readonly npcs: readonly NpcRecord[];
	readonly onRecordsChange: (records: PersistedRecords) => void;
	readonly onWorldStateChange: (records: readonly WorldStateFlagView[]) => void;
	readonly resolveAppeal: (
		input: unknown,
	) => Result<SocialEncounterState, SocialEncounterFailure>;
	readonly resolveAppealOutcome: (
		input: unknown,
	) => Result<SocialAppealResolutionResult, SocialAppealResolutionFailure>;
	readonly startEncounter: (
		input: unknown,
	) => Promise<Result<SocialEncounterState, SocialEncounterFailure>>;
	readonly selectDialogueTreeOption: (
		input: unknown,
	) => Promise<Result<DialogueTraversalResult, DialogueTraversalFailure>>;
	readonly worldState: readonly WorldStateFlagView[];
};

let {
	characters,
	createAppealInput,
	createAppealResolutionInput,
	createStartInput,
	dialogueChoices,
	dialogueNodes,
	dialogueOptions,
	encounterEvents,
	encounters,
	npcs,
	onRecordsChange,
	onWorldStateChange,
	resolveAppeal,
	resolveAppealOutcome,
	startEncounter,
	selectDialogueTreeOption,
	worldState,
}: Props = $props();

let selectedActorId = $state("");
let selectedChoiceId = $state("");
let selectedNpcId = $state("");
let state = $state<SocialEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let lastResolution = $state<SocialAppealResolutionResult | null>(null);
let isWorking = $state(false);
let hydratedKey = $state("");

$effect(() => {
	const nextActorId = resolveSelectedActorId(selectedActorId, characters);
	if (nextActorId !== selectedActorId) {
		selectedActorId = nextActorId;
	}
});

$effect(() => {
	const nextChoiceId = resolveSelectedChoiceId(
		selectedChoiceId,
		dialogueChoices,
	);
	if (nextChoiceId !== selectedChoiceId) {
		selectedChoiceId = nextChoiceId;
	}
});

$effect(() => {
	const nextKey = createHydrationKey(encounters, encounterEvents);
	if (nextKey === hydratedKey) {
		return;
	}

	const encounter = encounters[0] ?? null;
	state = encounter
		? createSocialEncounterStateFromRecords(encounter, encounterEvents)
		: null;
	selectedNpcId = state?.npcId ?? (selectedNpcId || npcs[0]?.id) ?? "";
	selectedActorId =
		state?.actorId ?? resolveSelectedActorId(selectedActorId, characters);
	selectedChoiceId = state
		? resolveDialogueChoiceIdFromEvents(
				state.events,
				dialogueOptions,
				resolveSelectedChoiceId(selectedChoiceId, dialogueChoices),
			)
		: resolveSelectedChoiceId(selectedChoiceId, dialogueChoices);
	errorMessage = null;
	lastResolution = null;
	isWorking = false;
	hydratedKey = nextKey;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(
	createSocialEncounterView({
		characters,
		dialogueChoices,
		errorMessage,
		lastResolution,
		npcs,
		selectedActorId,
		selectedChoiceId,
		selectedNpcId,
		state,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let consequenceView = $derived(
	createSocialEncounterConsequenceView({
		state,
		worldState,
	}),
);

let dialogueTreeView = $derived(
	createSocialDialogueTreeView({
		nodes: dialogueNodes,
		options: dialogueOptions,
		selectedNpcId,
		state,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function startSelectedEncounter(): Promise<void> {
	if (!selectedNpcId || !selectedActorId || isWorking) {
		return;
	}

	isWorking = true;
	const result = await startEncounter(
		createStartInput(selectedNpcId, selectedActorId),
	);
	isWorking = false;

	if (!result.success) {
		errorMessage = mapSocialEncounterFailureToMessage(result.error);
		return;
	}

	lastResolution = null;
	applyState(result.data);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resolveCharacterAppeal(): void {
	if (!state || isWorking) {
		return;
	}

	const character = characters.find(
		(candidate) => candidate.id === selectedActorId,
	);
	if (character === undefined) {
		errorMessage = "Selecione um personagem da sessão para fazer o apelo.";
		return;
	}

	const choice = dialogueChoices.find(
		(candidate) => candidate.id === selectedChoiceId,
	);
	if (choice === undefined) {
		errorMessage = "Selecione um argumento social antes de fazer o apelo.";
		return;
	}

	const profile = createSocialDialogueChoiceProfile({
		character,
		choice,
		state,
	});
	if (!profile.success) {
		errorMessage =
			"Este argumento social nÃ£o pode ser usado nesta negociaÃ§Ã£o.";
		return;
	}

	isWorking = true;
	const resolution = resolveAppealOutcome(
		createAppealResolutionInput(state, character, profile.data),
	);
	if (!resolution.success) {
		isWorking = false;
		errorMessage = mapSocialAppealResolutionFailureToMessage();
		return;
	}

	const result = resolveAppeal(
		createAppealInput(state, resolution.data, profile.data),
	);
	isWorking = false;

	if (!result.success) {
		errorMessage = mapSocialEncounterFailureToMessage(result.error);
		return;
	}

	lastResolution = resolution.data;
	applyState(result.data);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function chooseDialogueOption(optionId: string): Promise<void> {
	if (!state || isWorking || !dialogueTreeView.currentNodeId) {
		return;
	}

	isWorking = true;
	const result = await selectDialogueTreeOption({
		npcId: state.npcId,
		currentNodeId: dialogueTreeView.currentNodeId,
		optionId,
		mentalHpCurrent: state.mentalHpCurrent,
		selectedAt: new Date().toISOString(),
		events: state.events,
	});
	isWorking = false;

	if (!result.success) {
		errorMessage = mapDialogueTraversalFailureToMessage(result.error);
		return;
	}

	selectedChoiceId = result.data.selectedChoiceId;
	const nextState: SocialEncounterState = {
		...state,
		events: [...state.events, result.data.event],
		log: [...state.log, result.data.event.message],
		updatedAt: result.data.event.createdAt,
	};
	applyState(nextState);
}

function applyState(nextState: SocialEncounterState): void {
	state = nextState;
	errorMessage = null;
	const records = createSocialEncounterRecordsFromState(nextState);
	hydratedKey = createHydrationKey(
		records.socialEncounters,
		records.socialEncounterEvents,
	);
	onRecordsChange(records);

	const consequence = createSocialEncounterConsequenceFlag({
		state: nextState,
		dialogueOptions,
		updatedAt: nextState.updatedAt,
	});
	if (consequence) {
		onWorldStateChange(
			upsertSocialEncounterConsequenceFlag(worldState, consequence),
		);
	}
}

function resolveSelectedActorId(
	currentActorId: string,
	availableCharacters: readonly CharacterRecord[],
): string {
	if (
		availableCharacters.some((character) => character.id === currentActorId)
	) {
		return currentActorId;
	}

	return availableCharacters[0]?.id ?? "";
}

function resolveSelectedChoiceId(
	currentChoiceId: string,
	availableChoices: readonly DialogueChoiceRecord[],
): string {
	if (availableChoices.some((choice) => choice.id === currentChoiceId)) {
		return currentChoiceId;
	}

	return availableChoices[0]?.id ?? "";
}

function createHydrationKey(
	encounters: readonly SocialEncounterRecord[],
	events: readonly SocialEncounterEventRecord[],
): string {
	return JSON.stringify({
		encounters,
		events,
	});
}

function mapDialogueTraversalFailureToMessage(
	failure: DialogueTraversalFailure,
): string {
	switch (failure.code) {
		case "INVALID_DIALOGUE_TRAVERSAL_INPUT":
			return "Esta opção de diálogo não pode ser usada agora.";
		case "DIALOGUE_TREE_LOOKUP_FAILED":
			return "Não foi possível carregar a fala deste diálogo.";
		case "DIALOGUE_NODE_MISMATCH":
			return "Esta fala não pertence ao NPC selecionado.";
		case "DIALOGUE_OPTION_MISSING":
			return "Esta opção de diálogo não está disponível nesta fala.";
		case "DIALOGUE_OPTION_BLOCKED":
			return "Esta opção exige mais HP mental antes de ser usada.";
	}
}
</script>

<section aria-labelledby="social-encounter-title" data-testid="social-encounter-panel">
	<div class="border border-bronze bg-blood-shadow px-5 py-5">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<p class="text-sm font-semibold text-ether">Negociação</p>
				<h3 id="social-encounter-title" class="mt-1 text-xl font-semibold text-bone">
					{view.titleLabel}
				</h3>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-bone/85">
					{view.selectedNpcSummary}
				</p>
			</div>
			<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-ether" data-testid="social-encounter-status">
				{view.statusLabel}
			</p>
		</div>

		{#if view.emptyStateLabel}
			<p class="mt-4 border border-bronze bg-ruin px-4 py-3 text-sm text-bone">
				{view.emptyStateLabel}
			</p>
		{:else}
			<div class="mt-5 grid gap-4 lg:grid-cols-[minmax(220px,0.45fr)_minmax(0,1fr)]">
				<div class="grid gap-4">
					<label class="flex flex-col gap-2 text-sm font-semibold text-bone">
						Negociador
						<select
							bind:value={selectedActorId}
							class="border border-bronze bg-ruin px-3 py-2 text-bone disabled:opacity-60"
							data-testid="social-actor-select"
							disabled={state !== null}
						>
							{#each view.characterOptions as character}
								<option value={character.id}>{character.label}</option>
							{/each}
						</select>
					</label>
					<p class="border border-bronze bg-ruin px-3 py-2 text-sm leading-6 text-bone/85" data-testid="social-actor-summary">
						{view.selectedCharacterSummary}
					</p>
					<label class="flex flex-col gap-2 text-sm font-semibold text-bone">
						NPC de treino
						<select
							bind:value={selectedNpcId}
							class="border border-bronze bg-ruin px-3 py-2 text-bone"
							data-testid="social-npc-select"
						>
							{#each view.npcOptions as npc}
								<option value={npc.id}>{npc.label}</option>
							{/each}
						</select>
					</label>
					<label class="flex flex-col gap-2 text-sm font-semibold text-bone">
						Argumento
						<select
							bind:value={selectedChoiceId}
							class="border border-bronze bg-ruin px-3 py-2 text-bone disabled:opacity-60"
							data-testid="social-choice-select"
							disabled={view.dialogueChoiceOptions.length === 0}
						>
							{#each view.dialogueChoiceOptions as choice}
								<option value={choice.id}>{choice.label}</option>
							{/each}
						</select>
					</label>
					<div class="border border-bronze bg-ruin px-3 py-2 text-sm leading-6 text-bone/85" data-testid="social-choice-summary">
						<p>{view.selectedChoiceDescription}</p>
						<p class="mt-1 font-semibold text-ether">{view.selectedChoiceModifierLabel}</p>
					</div>
				</div>

				<div class="grid gap-4">
					<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone" data-testid="social-mental-hp">
							{view.mentalHpLabel}
						</p>
						<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone" data-testid="social-patience">
							{view.patienceLabel}
						</p>
						<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone" data-testid="social-persuasion">
							{view.progressLabel}
						</p>
						<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone">
							{view.attitudeLabel}
						</p>
					</div>
					<div class="border border-bronze bg-ruin px-4 py-4 text-sm leading-6 text-bone" data-testid="social-dialogue-tree">
						<p class="font-semibold text-ether">Fala do NPC</p>
						<p class="mt-2" data-testid="social-dialogue-current-text">
							{dialogueTreeView.currentNodeText}
						</p>
						<p class="mt-2 text-bone/80">{dialogueTreeView.stateLabel}</p>
						{#if dialogueTreeView.options.length > 0}
							<div class="mt-3 flex flex-wrap gap-2">
								{#each dialogueTreeView.options as option}
									<button
										type="button"
										class="rounded-lg border border-bronze bg-blood-shadow px-3 py-2 text-left text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether disabled:cursor-not-allowed disabled:opacity-50"
										disabled={!dialogueTreeView.canChooseOption || !option.isAvailable || isWorking}
										onclick={() => void chooseDialogueOption(option.id)}
										data-testid="social-dialogue-option"
									>
										<span class="block text-ether">{option.label}</span>
										<span class="block font-normal text-bone/85">{option.visibleText}</span>
										{#if option.blockedReason}
											<span class="mt-1 block font-normal text-bronze">
												{option.blockedReason}
											</span>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="mt-5 flex flex-wrap gap-3">
				<button
					type="button"
					class="rounded-lg border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!view.canStart || isWorking}
					onclick={() => void startSelectedEncounter()}
					data-testid="social-start-encounter"
				>
					{view.startButtonLabel}
				</button>
				<button
					type="button"
					class="rounded-lg border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!view.canAppeal || isWorking}
					onclick={resolveCharacterAppeal}
					data-testid="social-resolve-appeal"
				>
					{view.appealButtonLabel}
				</button>
			</div>

			<div class="mt-4 border border-bronze bg-ruin px-4 py-3 text-sm leading-6 text-bone" data-testid="social-resolution-summary">
				<p>{view.resolutionLabel}</p>
				{#if view.resolutionSummaryLabel}
					<p class="mt-1 text-ether">{view.resolutionSummaryLabel}</p>
				{/if}
			</div>

			{#if consequenceView}
				<div class="mt-4 border border-ether bg-ruin px-4 py-3 text-sm leading-6 text-bone" data-testid="social-worldstate-consequence">
					<p class="font-semibold text-ether">{consequenceView.label}</p>
					<p class="mt-1">{consequenceView.summary}</p>
				</div>
			{/if}

			{#if view.errorMessage}
				<p class="mt-4 border border-bronze bg-ruin px-4 py-3 text-sm font-semibold text-ether">
					{view.errorMessage}
				</p>
			{/if}

			<ul class="mt-4 space-y-3" data-testid="social-encounter-log">
				{#each view.logLines as line}
					<li class="border border-bronze bg-ruin px-4 py-3 text-sm leading-6 text-bone">
						{line}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
