<script lang="ts">
import {
	createSocialSession,
	type SocialManeuverType,
} from "$lib/app/model/socialSession";
import type { BargainOffer, SocialTarget } from "../model-api";

const initialTarget: SocialTarget = {
	id: "npc-demo",
	label: "Mercador Desconfiado",
	tier: 2,
	mentalStat: 12,
	resistanceStat: 14,
	attitude: "skeptical",
	patience: { baseValue: 26, currentValue: 26 },
	persuasion: { totalSegments: 4, completedSegments: 0 },
	fatigueCounters: {},
};

const mockPlayer = {
	id: "pc-1",
	name: "Jogador",
	background: "hero",
	tier: 1,
	stats: { physical: 10, mental: 10, social: 12 },
	resistances: { physical: 10, mental: 10, social: 10 },
	hp: 20,
	maxHp: 20,
	mp: 10,
	maxMp: 10,
};

let session = createSocialSession(mockPlayer, initialTarget);

let target = $state(session.target);
let _conflictState = $state(session.conflictState);
let logs = $state<string[]>([]);

function _handleArgument(
	axis: string,
	margin: number,
	maneuver: SocialManeuverType,
) {
	const currentPatience = target.patience.currentValue;
	session.submitArgument(axis, margin, maneuver);

	// Update reactive state
	target = session.target;
	_conflictState = session.conflictState;

	const newPatience = target.patience.currentValue;
	const damage = currentPatience - newPatience;

	if (damage > 0) {
		logs = [...logs, `Argumento (${axis}) reduziu a paciência em ${damage}.`];
	} else if (maneuver !== "mystic_charm" && maneuver !== "group_sense") {
		logs = [
			...logs,
			`Argumento (${axis}) falhou. A paciência do alvo não mudou.`,
		];
	}
}

function _handleOffer(offer: BargainOffer) {
	session.addBargainOffer(offer);

	// Update reactive state
	_conflictState = session.conflictState;

	logs = [...logs, `Ofereceu: ${offer.description}`];
}
</script>

<div class="flex gap-8 items-start w-full">
	<div class="flex-1 flex flex-col gap-8">
		<DialogueWindow {target} onArgument={handleArgument} />
		<div class="flex gap-4">
			<BargainWindow attitude={target.attitude} onOfferMade={handleOffer} />
			<FactionPanel />
		</div>
	</div>
	
	<div class="w-80 bg-ruin border border-bronze rounded-lg p-4 flex flex-col h-[600px]">
		<div class="flex justify-between items-end border-b border-ether pb-2 mb-4">
			<h3 class="font-semibold text-bone">Mesa de Negociação</h3>
			<span class="text-sm text-ether">Turno: {conflictState.currentRound}</span>
		</div>

		{#if conflictState.bargainOffers.length > 0}
			<div class="mb-4 flex flex-col gap-2">
				<h4 class="text-sm font-semibold text-bone/70 uppercase">Ofertas Ativas</h4>
				{#each conflictState.bargainOffers as offer}
					<div class="text-sm bg-void border border-bronze p-2 rounded text-bone flex justify-between">
						<span>{offer.description}</span>
					</div>
				{/each}
				<div class="text-sm text-ether bg-void border border-bronze/50 p-2 rounded text-center">
					Bônus de Margem: +{calculateOfferMarginBonus(conflictState.bargainOffers)}
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-2 overflow-y-auto flex-1 pr-2">
			{#each logs as log}
				<div class="text-sm text-bone p-2 bg-void rounded border border-bronze/30">{log}</div>
			{/each}
			{#if logs.length === 0}
				<p class="text-sm text-bone/50 italic">A negociação ainda não começou...</p>
			{/if}
			{#if target.patience.currentValue === 0}
				<div class="p-3 bg-blood-shadow border border-bronze rounded text-ether mt-4">
					<strong>Trauma:</strong> A paciência do alvo foi quebrada!
				</div>
			{/if}
		</div>
	</div>
</div>
