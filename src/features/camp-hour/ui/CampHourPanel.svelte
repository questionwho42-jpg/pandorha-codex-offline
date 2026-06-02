<script lang="ts">
import type { CampActivityRecord } from "$lib/entities/camp-activity";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type { CharacterRecord } from "$lib/entities/character";
import type { ClockRecord } from "$lib/entities/clock";
import type { Result } from "$lib/shared/lib/result";
import type {
	CampHourEvent,
	CampHourFailure,
	CampHourInput,
	CampHourResult,
} from "../model/campHourTypes";
import {
	createCampHourView,
	mapCampHourFailureToMessage,
} from "../model/campHourView";

interface CampPersistedState {
	readonly clocks: readonly ClockRecord[];
	readonly campSessions: readonly CampSessionRecord[];
	readonly campAssignments: readonly CampAssignmentRecord[];
}

type Props = {
	readonly activities: readonly CampActivityRecord[];
	readonly campAssignments: readonly CampAssignmentRecord[];
	readonly campSessions: readonly CampSessionRecord[];
	readonly characters: readonly CharacterRecord[];
	readonly clocks: readonly ClockRecord[];
	readonly createInitialState: (createdAt: string) => CampPersistedState;
	readonly onStateChange: (state: CampPersistedState) => void;
	readonly resolveHour: (
		input: CampHourInput,
		clocks: readonly ClockRecord[],
	) => Promise<Result<CampHourResult, CampHourFailure>>;
};

let {
	activities,
	campAssignments,
	campSessions,
	characters,
	clocks,
	createInitialState,
	onStateChange,
	resolveHour,
}: Props = $props();

let localAssignments = $state<CampAssignmentRecord[]>([]);
let localCampSessions = $state<CampSessionRecord[]>([]);
let localClocks = $state<ClockRecord[]>([]);
let selectedActivityIds = $state<Record<string, string>>({});
let events = $state<CampHourEvent[]>([]);
let errorMessage = $state<string | null>(null);
let isResolving = $state(false);
let hydratedKey = $state("");

$effect(() => {
	const nextKey = createHydrationKey({
		assignments: campAssignments,
		characters,
		clocks,
		sessions: campSessions,
	});
	if (nextKey === hydratedKey) {
		return;
	}

	const fallback = createInitialState(new Date().toISOString());
	localClocks = clocks.length > 0 ? [...clocks] : [...fallback.clocks];
	localCampSessions =
		campSessions.length > 0 ? [...campSessions] : [...fallback.campSessions];
	localAssignments = [...campAssignments];
	selectedActivityIds = createInitialSelections(
		characters,
		localAssignments,
		activities,
	);
	events = [];
	errorMessage = null;
	hydratedKey = nextKey;
});

let currentSession = $derived(localCampSessions[0] ?? null);
let currentClock = $derived(findCurrentClock(localClocks, currentSession));
let view = $derived(
	createCampHourView({
		activities,
		assignments: localAssignments,
		characters,
		clock: currentClock,
		errorMessage,
		events,
		isResolving,
		selectedActivityIds,
		session: currentSession,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function updateActivity(characterId: string, activityId: string): void {
	selectedActivityIds = {
		...selectedActivityIds,
		[characterId]: activityId,
	};
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function resolveCurrentHour(): Promise<void> {
	if (!view.canResolve || !currentSession) {
		return;
	}

	isResolving = true;
	const resolvedAt = new Date().toISOString();
	const assignments = createAssignmentsForCharacters({
		characters,
		selectedActivityIds,
		session: currentSession,
		createdAt: resolvedAt,
		activities,
	});
	const result = await resolveHour(
		{
			session: currentSession,
			assignments,
			activities,
			resolvedAt,
		},
		localClocks,
	);
	isResolving = false;

	if (!result.success) {
		errorMessage = mapCampHourFailureToMessage(result.error);
		return;
	}

	localAssignments = [...assignments];
	localCampSessions = [result.data.session];
	localClocks = result.data.advancedClock
		? replaceClock(localClocks, result.data.advancedClock)
		: localClocks;
	events = [...result.data.events];
	errorMessage = null;
	onStateChange({
		clocks: localClocks,
		campSessions: localCampSessions,
		campAssignments: localAssignments,
	});
}

function createHydrationKey(input: {
	readonly assignments: readonly CampAssignmentRecord[];
	readonly characters: readonly CharacterRecord[];
	readonly clocks: readonly ClockRecord[];
	readonly sessions: readonly CampSessionRecord[];
}): string {
	return JSON.stringify({
		assignments: input.assignments.map((assignment) => [
			assignment.id,
			assignment.activityId,
			assignment.characterId,
		]),
		characters: input.characters.map((character) => character.id),
		clocks: input.clocks.map((clock) => [
			clock.id,
			clock.currentSlices,
			clock.status,
		]),
		sessions: input.sessions.map((session) => [
			session.id,
			session.danger,
			session.status,
		]),
	});
}

function createInitialSelections(
	characters: readonly CharacterRecord[],
	assignments: readonly CampAssignmentRecord[],
	activities: readonly CampActivityRecord[],
): Record<string, string> {
	const byCharacterId = Object.fromEntries(
		assignments.map((assignment) => [
			assignment.characterId,
			assignment.activityId,
		]),
	);
	const defaultActivityId = activities[0]?.id ?? "watch";

	return Object.fromEntries(
		characters.map((character, index) => [
			character.id,
			byCharacterId[character.id] ??
				createDefaultActivityId(index, defaultActivityId),
		]),
	);
}

function createDefaultActivityId(
	characterIndex: number,
	fallbackActivityId: string,
): string {
	if (characterIndex === 0) {
		return "watch";
	}
	if (characterIndex === 1) {
		return "fortify-perimeter";
	}

	return fallbackActivityId;
}

function findCurrentClock(
	clocks: readonly ClockRecord[],
	session: CampSessionRecord | null,
): ClockRecord | null {
	if (!session?.fortifyClockId) {
		return clocks[0] ?? null;
	}

	return (
		clocks.find((clock) => clock.id === session.fortifyClockId) ??
		clocks[0] ??
		null
	);
}

function createAssignmentsForCharacters(input: {
	readonly activities: readonly CampActivityRecord[];
	readonly characters: readonly CharacterRecord[];
	readonly createdAt: string;
	readonly selectedActivityIds: Readonly<Record<string, string>>;
	readonly session: CampSessionRecord;
}): readonly CampAssignmentRecord[] {
	const fallbackActivityId = input.activities[0]?.id ?? "watch";
	return input.characters.map((character, index) => ({
		id: `camp-assignment-${input.session.currentHour}-${index + 1}`,
		sessionId: input.session.id,
		characterId: character.id,
		activityId: input.selectedActivityIds[character.id] ?? fallbackActivityId,
		hour: input.session.currentHour,
		createdAt: input.createdAt,
	}));
}

function replaceClock(
	clocks: readonly ClockRecord[],
	advancedClock: ClockRecord,
): ClockRecord[] {
	const withoutClock = clocks.filter((clock) => clock.id !== advancedClock.id);
	return [...withoutClock, advancedClock].sort((left, right) =>
		left.id.localeCompare(right.id),
	);
}
</script>

<section aria-labelledby="camp-hour-title" data-testid="camp-hour-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Acampamento</p>
			<h2 id="camp-hour-title" class="mt-2 text-2xl font-semibold text-bone">
				Descanso ativo
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Planeje uma hora de acampamento, acompanhe o Contador de Perigo e avance
				o relógio coletivo de Fortificar perímetro.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="camp-status">
			{view.sessionStatusLabel}
		</p>
	</div>

	{#if view.emptyStateLabel}
		<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-5">
			<p class="text-bone" data-testid="camp-empty-state">
				{view.emptyStateLabel}
			</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
			<div class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="border border-bronze bg-blood-shadow px-4 py-3">
						<p class="text-sm font-semibold text-ether">Contador de Perigo</p>
						<p class="mt-1 text-xl font-semibold text-bone" data-testid="camp-danger">
							{view.dangerLabel}
						</p>
					</div>
					<div class="border border-bronze bg-blood-shadow px-4 py-3">
						<p class="text-sm font-semibold text-ether">{view.clockLabel}</p>
						<p class="mt-1 text-xl font-semibold text-bone" data-testid="camp-clock">
							{view.clockProgressLabel}
						</p>
						<p class="mt-1 text-sm text-bone/80">{view.clockStatusLabel}</p>
					</div>
				</div>

				<div class="border border-bronze bg-blood-shadow px-5 py-5">
					<h3 class="text-lg font-semibold text-bone">Ações da hora</h3>
					<div class="mt-4 grid gap-3">
						{#each view.characterRows as row (row.characterId)}
							<label class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)] sm:items-center">
								<span class="font-semibold text-bone">{row.characterName}</span>
								<select
									class="w-full border border-bronze bg-ruin px-3 py-2 text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:cursor-not-allowed disabled:opacity-60"
									disabled={row.isLocked || isResolving}
									value={row.selectedActivityId}
									onchange={(event) =>
										updateActivity(
											row.characterId,
											event.currentTarget.value,
										)}
								>
									{#each view.actionOptions as activity (activity.id)}
										<option value={activity.id}>{activity.label}</option>
									{/each}
								</select>
							</label>
						{/each}
					</div>
					<button
						type="button"
						class="mt-5 rounded-lg border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!view.canResolve}
						onclick={() => void resolveCurrentHour()}
						data-testid="camp-resolve-hour"
					>
						Resolver 1 hora
					</button>
				</div>
			</div>

			<aside class="border border-bronze bg-blood-shadow px-5 py-5">
				<h3 class="text-lg font-semibold text-bone">Resumo</h3>
				{#if view.errorMessage}
					<p class="mt-3 border border-bronze bg-ruin px-4 py-3 text-sm font-semibold text-ether">
						{view.errorMessage}
					</p>
				{/if}
				<ul class="mt-4 space-y-3" data-testid="camp-log">
					{#each view.logLines as line}
						<li class="border border-bronze bg-ruin px-4 py-3 text-sm leading-6 text-bone">
							{line}
						</li>
					{/each}
				</ul>
			</aside>
		</div>
	{/if}
</section>
