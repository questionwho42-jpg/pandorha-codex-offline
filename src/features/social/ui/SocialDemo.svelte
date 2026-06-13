<script lang="ts">
import {
	createSocialSession,
	type SocialManeuverType,
} from "$lib/app/model/socialSession";
import {
	applyStatusEffects,
	BaseCharacterStats,
	type ICharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
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
import FactionTeiaPanel from "./FactionTeiaPanel.svelte";

interface Props {
	service?: SocialStandingService;
	onStandingChange?: (isRestBlocked: boolean) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic record models
	characters?: readonly any[];
	// biome-ignore lint/suspicious/noExplicitAny: dynamic status effect records
	activeEffects?: readonly any[];
	// biome-ignore lint/suspicious/noExplicitAny: Compendium dynamic metadata
	characterClasses?: readonly any[];
}

let {
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	service = $bindable(),
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	onStandingChange,
	characters = [],
	activeEffects = [],
	characterClasses = [],
}: Props = $props();

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

let selectedOratorId = $state<string>("");

// Inicializar selectedOratorId se houver personagens
$effect(() => {
	if (characters.length > 0 && !selectedOratorId) {
		selectedOratorId = characters[0].id;
	}
});

let oratorStats = $derived.by(() => {
	const realChar = characters.find((c) => c.id === selectedOratorId);
	if (!realChar) {
		return {
			name: "Aria (Treino)",
			physical: 10,
			mental: 10,
			social: 12,
			activeEffects: [],
		};
	}

	const charEffects = activeEffects.filter(
		(e) => e.characterId === selectedOratorId,
	);

	const realClass = characterClasses.find((c) => c.id === realChar.classId);
	const baseStats = new BaseCharacterStats(realChar, {
		id: realClass ? realClass.id : "warrior",
		baseHp: realClass ? realClass.baseHp : 10,
	});

	let decoratedStats: ICharacterStats = applyStatusEffects(
		baseStats,
		charEffects,
	);

	const effectsLabels: string[] = [];
	for (const effect of charEffects) {
		if (effect.type === "eter_fever") {
			effectsLabels.push("🤒 Febre de Éter (-1 Mente)");
		} else if (effect.type === "wound_infection") {
			effectsLabels.push("🩸 Infecção de Ferida (-1 Físico)");
		} else if (effect.type === "viper_poison") {
			effectsLabels.push("🤢 Veneno de Víbora (-2 Físico)");
		} else if (effect.type === "hungry") {
			effectsLabels.push("🍗 Faminto (-1 Físico, -1 Mente)");
		}
	}

	return {
		name: realChar.name,
		physical: decoratedStats.physical,
		mental: decoratedStats.mental,
		social: decoratedStats.social,
		activeEffects: effectsLabels,
	};
});

let session = $derived.by(() => {
	const player = {
		id: selectedOratorId || "pc-1",
		name: oratorStats.name,
		background: "hero",
		tier: 1,
		stats: {
			physical: oratorStats.physical,
			mental: oratorStats.mental,
			social: oratorStats.social,
		},
		resistances: { physical: 10, mental: 10, social: 10 },
		hp: 20,
		maxHp: 20,
		mp: 10,
		maxMp: 10,
	};
	return createSocialSession(player, initialTarget);
});

let target = $state(initialTarget);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let conflictState = $state({ currentRound: 1, bargainOffers: [] });
let logs = $state<string[]>([]);

$effect(() => {
	target = session.target;
	conflictState = session.conflictState;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleArgument(
	axis: string,
	margin: number,
	maneuver: SocialManeuverType,
) {
	let finalMargin = margin;
	if (
		axis.includes("Mental") &&
		(oratorStats.activeEffects.some((e) => e.includes("Febre")) ||
			oratorStats.activeEffects.some((e) => e.includes("Faminto")))
	) {
		finalMargin = Math.max(1, margin - 1);
		const cause = oratorStats.activeEffects.some((e) => e.includes("Faminto"))
			? "FOME EXTREMA"
			: "FEBRE DE ÉTER";
		logs = [
			...logs,
			`⚠️ ${cause}: A debilidade mental de ${oratorStats.name} reduziu a margem em -1!`,
		];
	}

	const currentPatience = target.patience.currentValue;
	session.submitArgument(axis, finalMargin, maneuver);

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
		<!-- Seletor de Orador Premium -->
		<div class="p-4 bg-void border border-bronze rounded flex flex-col gap-3">
			<label class="block">
				<span class="text-xs font-bold text-ether uppercase tracking-wider block mb-1.5">🗣️ Selecionar Negociador da Guilda</span>
				<select 
					bind:value={selectedOratorId}
					class="w-full bg-ruin border border-bronze rounded p-2 text-xs font-semibold text-bone outline-none focus:border-ether"
				>
					{#each characters as char}
						<option value={char.id}>{char.name} ({char.classId.toUpperCase()})</option>
					{/each}
					{#if characters.length === 0}
						<option value="">Aria (Treino)</option>
					{/if}
				</select>
			</label>
			
			<div class="flex gap-4 items-center justify-between border-t border-bronze/20 pt-2 text-[10px] text-bone/60">
				<div class="flex gap-3">
					<span>💪 FÍSICO: <strong class="text-bone">{oratorStats.physical}</strong></span>
					<span>🧠 MENTE: <strong class="text-bone">{oratorStats.mental}</strong></span>
					<span>🤝 SOCIAL: <strong class="text-bone">{oratorStats.social}</strong></span>
				</div>
				
				{#if oratorStats.activeEffects.length > 0}
					<div class="flex gap-1">
						{#each oratorStats.activeEffects as eff}
							<span class="text-[9px] font-bold text-blood uppercase tracking-tighter bg-blood-shadow/30 border border-blood/20 px-1.5 py-0.5 rounded-sm">
								{eff}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<DialogueWindow {target} onArgument={handleArgument} />
		<div class="flex gap-6">
			<BargainWindow attitude={target.attitude} onOfferMade={handleOffer} />
			<FactionPanel bind:service={service} onStandingChange={onStandingChange} />
		</div>
		<div class="w-full mt-4">
			<FactionTeiaPanel characterId={selectedOratorId || 'char-wanderer'} />
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


