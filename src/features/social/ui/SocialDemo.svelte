<script lang="ts">
import {
	createSocialSession,
	type SocialManeuverType,
} from "$lib/app/model/socialSession";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { calculateOfferMarginBonus } from "../domain/BargainCalculator";
import type { SocialStandingService } from "../domain/SocialStandingService";
import type { BargainOffer, SocialTarget } from "../model-api";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import BargainWindow from "./BargainWindow.svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import DialogueWindow from "./DialogueWindow.svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import FactionPanel from "./FactionPanel.svelte";

interface Props {
	service?: SocialStandingService;
	onStandingChange?: (isRestBlocked: boolean) => void;
}
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let { service = $bindable(), onStandingChange }: Props = $props();

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
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let conflictState = $state(session.conflictState);
let logs = $state<string[]>([]);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleArgument(
	axis: string,
	margin: number,
	maneuver: SocialManeuverType,
) {
	const currentPatience = target.patience.currentValue;
	session.submitArgument(axis, margin, maneuver);

	// Update reactive state
	target = session.target;
	conflictState = session.conflictState;

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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleOffer(offer: BargainOffer) {
	session.addBargainOffer(offer);

	// Update reactive state
	conflictState = session.conflictState;

	logs = [...logs, `Ofereceu: ${offer.description}`];
}
</script>

<div class="flex gap-8 items-start w-full p-6 bg-ruin text-bone rounded-lg border border-bronze shadow-2xl">
	<div class="flex-1 flex flex-col gap-8">
		<DialogueWindow {target} onArgument={handleArgument} />
		<div class="flex gap-6">
			<BargainWindow attitude={target.attitude} onOfferMade={handleOffer} />
			<FactionPanel bind:service={service} onStandingChange={onStandingChange} />
		</div>
	</div>
	
	<div class="w-80 bg-void border border-bronze rounded-lg p-5 flex flex-col h-[600px] shadow-inner">
		<div class="flex justify-between items-center border-b border-ether/30 pb-3 mb-4">
			<h3 class="font-bold text-bone uppercase tracking-widest text-sm">Mesa de Negociação</h3>
			<span class="text-[10px] text-ether font-mono">TURNO {conflictState.currentRound}</span>
		</div>

		{#if conflictState.bargainOffers.length > 0}
			<div class="mb-6 flex flex-col gap-3">
				<h4 class="text-[10px] font-bold text-bone/40 uppercase tracking-tighter">Ofertas na Mesa</h4>
				<div class="flex flex-col gap-2">
					{#each conflictState.bargainOffers as offer}
						<div class="text-xs bg-ruin/50 border border-bronze/30 p-2 rounded text-bone flex justify-between items-center">
							<span class="italic">"{offer.description}"</span>
							<span class="text-[9px] text-ether font-bold">+{offer.valueInGold} PO</span>
						</div>
					{/each}
				</div>
				<div class="text-[10px] text-void bg-ether font-bold p-2 rounded text-center uppercase tracking-widest">
					Bônus de Margem: +{calculateOfferMarginBonus(conflictState.bargainOffers)}
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
			{#each logs as log}
				<div class="text-xs p-3 bg-ruin/30 rounded border border-bronze/10 leading-relaxed font-mono">
                    <span class="text-bronze opacity-50 mr-1">></span> {log}
                </div>
			{/each}
			{#if logs.length === 0}
				<p class="text-[11px] text-bone/20 italic text-center mt-10">Inicie o diálogo para registrar a crônica...</p>
			{/if}
			{#if target.patience.currentValue === 0}
				<div class="p-4 bg-blood-shadow/20 border border-bronze rounded text-ether mt-4 text-center animate-pulse">
					<strong class="block text-xs uppercase tracking-widest mb-1">Paciência Esgotada</strong>
					<p class="text-[10px]">O alvo não aceitará mais argumentos neste encontro.</p>
				</div>
			{/if}
		</div>
	</div>
</div>


