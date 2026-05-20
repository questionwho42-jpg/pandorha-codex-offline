<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import type { NpcRecord } from "$lib/entities/npc";
import type {
	SocialEncounterEventRecord,
	SocialEncounterRecord,
} from "$lib/entities/social-encounter";
import type { Result } from "$lib/shared/lib/result";
import type {
	SocialAppealResolutionFailure,
	SocialAppealResolutionResult,
} from "../model/socialAppealResolutionTypes";
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
	) => AppealInput;
	readonly createAppealResolutionInput: (
		state: SocialEncounterState,
		character: CharacterRecord,
	) => unknown;
	readonly createStartInput: (
		npcId: string,
		actorId: string,
	) => StartEncounterInput;
	readonly encounterEvents: readonly SocialEncounterEventRecord[];
	readonly encounters: readonly SocialEncounterRecord[];
	readonly npcs: readonly NpcRecord[];
	readonly onRecordsChange: (records: PersistedRecords) => void;
	readonly resolveAppeal: (
		input: unknown,
	) => Result<SocialEncounterState, SocialEncounterFailure>;
	readonly resolveAppealOutcome: (
		input: unknown,
	) => Result<SocialAppealResolutionResult, SocialAppealResolutionFailure>;
	readonly startEncounter: (
		input: unknown,
	) => Promise<Result<SocialEncounterState, SocialEncounterFailure>>;
};

let {
	characters,
	createAppealInput,
	createAppealResolutionInput,
	createStartInput,
	encounterEvents,
	encounters,
	npcs,
	onRecordsChange,
	resolveAppeal,
	resolveAppealOutcome,
	startEncounter,
}: Props = $props();

let selectedActorId = $state("");
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
	errorMessage = null;
	lastResolution = null;
	isWorking = false;
	hydratedKey = nextKey;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(
	createSocialEncounterView({
		characters,
		errorMessage,
		lastResolution,
		npcs,
		selectedActorId,
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

	isWorking = true;
	const resolution = resolveAppealOutcome(
		createAppealResolutionInput(state, character),
	);
	if (!resolution.success) {
		isWorking = false;
		errorMessage = mapSocialAppealResolutionFailureToMessage();
		return;
	}

	const result = resolveAppeal(createAppealInput(state, resolution.data));
	isWorking = false;

	if (!result.success) {
		errorMessage = mapSocialEncounterFailureToMessage(result.error);
		return;
	}

	lastResolution = resolution.data;
	applyState(result.data);
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

function createHydrationKey(
	encounters: readonly SocialEncounterRecord[],
	events: readonly SocialEncounterEventRecord[],
): string {
	return JSON.stringify({
		encounters,
		events,
	});
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
				</div>

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
