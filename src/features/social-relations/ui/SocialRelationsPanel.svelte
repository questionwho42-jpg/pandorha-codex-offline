<script lang="ts">
import type {
	FactionRecord,
	FactionStandingRecord,
} from "$lib/entities/faction";
import type {
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "$lib/features/social-standing";
import type { Result } from "$lib/shared/lib/result";
import {
	createSocialRelationsView,
	mapSocialStandingFailureToMessage,
} from "../model/socialRelationsView";

type Props = {
	readonly factions: readonly FactionRecord[];
	readonly invokeTierOneFavor: (
		standing: FactionStandingRecord,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
	readonly onStandingsChange: (
		standings: readonly FactionStandingRecord[],
	) => void;
	readonly redeemTierOneDebt: (
		standing: FactionStandingRecord,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
	readonly standings: readonly FactionStandingRecord[];
};

let {
	factions,
	invokeTierOneFavor,
	onStandingsChange,
	redeemTierOneDebt,
	standings,
}: Props = $props();

let localStandings = $state<FactionStandingRecord[]>([]);
let events = $state<SocialStandingChangeResult["event"][]>([]);
let errorMessage = $state<string | null>(null);
let isWorkingFactionId = $state<string | null>(null);
let hydratedKey = $state("");

$effect(() => {
	const nextKey = createHydrationKey(standings);
	if (nextKey === hydratedKey) {
		return;
	}

	localStandings = [...standings];
	events = [];
	errorMessage = null;
	isWorkingFactionId = null;
	hydratedKey = nextKey;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(
	createSocialRelationsView({
		errorMessage,
		events,
		factions,
		standings: localStandings,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function invokeFavor(factionId: string): Promise<void> {
	await runStandingAction(factionId, invokeTierOneFavor);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function redeemDebt(factionId: string): Promise<void> {
	await runStandingAction(factionId, redeemTierOneDebt);
}

async function runStandingAction(
	factionId: string,
	action: (
		standing: FactionStandingRecord,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>,
): Promise<void> {
	const standing = localStandings.find(
		(record) => record.factionId === factionId,
	);
	if (!standing || isWorkingFactionId !== null) {
		return;
	}

	isWorkingFactionId = factionId;
	const result = await action(standing);
	isWorkingFactionId = null;

	if (!result.success) {
		errorMessage = mapSocialStandingFailureToMessage(result.error);
		return;
	}

	const nextStandings = replaceStanding(localStandings, result.data.standing);
	localStandings = nextStandings;
	hydratedKey = createHydrationKey(nextStandings);
	events = [result.data.event];
	errorMessage = null;
	onStandingsChange(localStandings);
}

function createHydrationKey(
	standings: readonly FactionStandingRecord[],
): string {
	return JSON.stringify(
		standings.map((standing) => [
			standing.factionId,
			standing.fameLevel,
			standing.bloodDebt,
			standing.intriguePoints,
			standing.status,
		]),
	);
}

function replaceStanding(
	standings: readonly FactionStandingRecord[],
	nextStanding: FactionStandingRecord,
): FactionStandingRecord[] {
	return standings.map((standing) =>
		standing.factionId === nextStanding.factionId ? nextStanding : standing,
	);
}
</script>

<section aria-labelledby="social-relations-title" data-testid="social-relations-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Relações</p>
			<h2 id="social-relations-title" class="mt-2 text-2xl font-semibold text-bone">
				{view.titleLabel}
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Acompanhe fama, dívida, intriga e favores com facções de treino.
			</p>
		</div>
	</div>

	{#if view.emptyStateLabel}
		<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-5">
			<p class="text-bone" data-testid="social-empty-state">
				{view.emptyStateLabel}
			</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
			<div class="space-y-4">
				{#each view.rows as row (row.factionId)}
					<article class="border border-bronze bg-blood-shadow px-5 py-5">
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p class="text-sm font-semibold text-ether">{row.kindLabel}</p>
								<h3 class="mt-1 text-xl font-semibold text-bone">{row.label}</h3>
								<p class="mt-2 max-w-2xl text-sm leading-6 text-bone/85">
									{row.summary}
								</p>
							</div>
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-ether">
								{row.statusLabel}
							</p>
						</div>

						<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone">
								{row.fameLabel}
							</p>
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone">
								{row.infamyLabel}
							</p>
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone" data-testid="social-debt">
								{row.debtLabel}
							</p>
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone">
								{row.favorLabel}
							</p>
							<p class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone" data-testid="social-intrigue">
								{row.intrigueLabel}
							</p>
						</div>

						<div class="mt-5 flex flex-wrap gap-3">
							<button
								type="button"
								class="rounded-lg border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!row.canInvokeTierOneFavor || isWorkingFactionId !== null}
								onclick={() => void invokeFavor(row.factionId)}
								data-testid="social-invoke-favor"
							>
								Invocar favor Tier 1
							</button>
							<button
								type="button"
								class="rounded-lg border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!row.canRedeemTierOneDebt || isWorkingFactionId !== null}
								onclick={() => void redeemDebt(row.factionId)}
								data-testid="social-redeem-debt"
							>
								Abater dívida Tier 1
							</button>
						</div>
					</article>
				{/each}
			</div>

			<aside class="border border-bronze bg-blood-shadow px-5 py-5">
				<h3 class="text-lg font-semibold text-bone">Resumo</h3>
				{#if view.errorMessage}
					<p class="mt-3 border border-bronze bg-ruin px-4 py-3 text-sm font-semibold text-ether">
						{view.errorMessage}
					</p>
				{/if}
				<ul class="mt-4 space-y-3" data-testid="social-log">
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
