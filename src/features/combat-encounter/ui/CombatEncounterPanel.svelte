<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type {
	EquipmentFailure,
	EquipmentLoadoutDefenseProfile,
	EquipmentLoadoutInput,
	EquipmentLoadoutSnapshot,
	EquipmentRecord,
} from "$lib/entities/equipment";
import type { Result } from "$lib/shared/lib/result";
import { CombatTurnService } from "../domain/CombatTurnService";
import { createCombatAttackerStatsView } from "../model/combatAttackerStatsView";
import type {
	CombatEncounterActorRef,
	CombatEncounterFailure,
	CombatEncounterInput,
	CombatEncounterState,
} from "../model/combatEncounterTypes";
import {
	type CombatEncounterView,
	createCombatEncounterView,
} from "../model/combatEncounterView";
import {
	createCombatAttackerOptions,
	findCombatAttackerOptionById,
} from "../model/combatSessionAttacker";
import {
	type CombatTrainingAttackProfile,
	createCombatTrainingAttackProfile,
} from "../model/combatTrainingAttackProfile";
import {
	applyCombatTrainingDefenderDamage,
	type CombatTrainingDefenderHitPointsFailure,
	type CombatTrainingDefenderHitPointsState,
	createCombatTrainingDefenderHitPoints,
} from "../model/combatTrainingDefenderHitPoints";
import {
	type CombatTrainingEnemyAttackFailure,
	type CombatTrainingEnemyAttackInput,
	type CombatTrainingEnemyAttackResult,
	createCombatTrainingEnemyDefenseProfile,
} from "../model/combatTrainingEnemyAttack";
import {
	type CombatTrainingTarget,
	findTrainingTargetById,
} from "../model/combatTrainingTargetCatalog";
import { createCombatTrainingTargetTurnLog } from "../model/combatTrainingTargetTurn";
import type {
	CombatTurnFailure,
	CombatTurnState,
} from "../model/combatTurnTypes";

type Props = {
	attacker: CombatEncounterActorRef;
	buildEquipmentLoadout: (
		input: EquipmentLoadoutInput,
	) => Promise<Result<EquipmentLoadoutSnapshot, EquipmentFailure>>;
	characterClasses: readonly CharacterClassRecord[];
	characters: readonly CharacterRecord[];
	createAttackInput: (
		attacker: CombatEncounterActorRef,
		target: CombatTrainingTarget,
		targetHitPoints: number,
		attackProfile: CombatTrainingAttackProfile,
	) => CombatEncounterInput;
	defaultArmorId: string;
	defaultShieldId: string;
	defaultWeaponId: string;
	equipmentArmors: readonly EquipmentRecord[];
	equipmentShields: readonly EquipmentRecord[];
	equipmentWeapons: readonly EquipmentRecord[];
	initialTarget: CombatTrainingTarget;
	resolveAttack: (
		input: CombatEncounterInput,
	) => ReturnType<CombatEncounterStateResolver>;
	resolveTrainingEnemyAttack: (
		input: CombatTrainingEnemyAttackInput,
	) => ReturnType<CombatTrainingEnemyAttackResolver>;
	trainingTargets: readonly CombatTrainingTarget[];
};

type CombatEncounterStateResolver = (
	input: CombatEncounterInput,
) =>
	| { readonly success: true; readonly data: CombatEncounterState }
	| { readonly success: false; readonly error: CombatEncounterFailure };

type CombatTrainingEnemyAttackResolver = (
	input: CombatTrainingEnemyAttackInput,
) =>
	| { readonly success: true; readonly data: CombatTrainingEnemyAttackResult }
	| {
			readonly success: false;
			readonly error: CombatTrainingEnemyAttackFailure;
	  };

type TrainingTargetTurnLogResult =
	| { readonly success: true; readonly entries: readonly string[] }
	| { readonly success: false; readonly message: string };

const turnService = new CombatTurnService();

let {
	attacker,
	buildEquipmentLoadout,
	characterClasses,
	characters,
	createAttackInput,
	defaultArmorId,
	defaultShieldId,
	defaultWeaponId,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	equipmentArmors,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	equipmentShields,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	equipmentWeapons,
	initialTarget,
	resolveAttack,
	resolveTrainingEnemyAttack,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	trainingTargets,
}: Props = $props();

// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for reset.
let targetHitPoints = $state(getInitialTargetHitPoints(initialTarget));
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected target.
let selectedTargetId = $state(initialTarget.id);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected attacker.
let selectedAttackerId = $state(attacker.id);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected weapon.
let selectedWeaponId = $state(defaultWeaponId);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected armor.
let selectedArmorId = $state(defaultArmorId);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected shield.
let selectedShieldId = $state(defaultShieldId);
let selectedLoadout = $state<EquipmentLoadoutSnapshot | null>(null);
let loadoutErrorMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isLoadingLoadout = $state(false);
let loadoutRequestId = 0;
let lastState = $state<CombatEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let log = $state<readonly string[]>([]);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial turn state.
let turnState = $state<CombatTurnState>(
	createInitialTurnState(attacker.id, initialTarget.id),
);
let attackerOptions = $derived(createCombatAttackerOptions(characters));
let selectedAttacker = $derived(getCombatAttacker(selectedAttackerId));
let selectedAttackerCharacter = $derived(
	characters.find((character) => character.id === selectedAttacker.id) ?? null,
);
let selectedAttackerIsSessionCharacter = $derived(
	selectedAttackerCharacter !== null,
);
let activeWeaponProfile = $derived(
	selectedAttackerIsSessionCharacter
		? (selectedLoadout?.activeWeaponProfile ?? undefined)
		: undefined,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeDefenseProfile = $derived<
	EquipmentLoadoutDefenseProfile | null | undefined
>(
	selectedAttackerIsSessionCharacter
		? selectedLoadout?.activeDefenseProfile
		: undefined,
);
let trainingEnemyDefenseProfile = $derived(
	selectedAttackerCharacter && selectedLoadout
		? createCombatTrainingEnemyDefenseProfile({
				defenderCharacter: selectedAttackerCharacter,
				defenderDefenseProfile: selectedLoadout.activeDefenseProfile,
			})
		: null,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let trainingEnemyDefenseSummary = $derived(
	trainingEnemyDefenseProfile?.success
		? trainingEnemyDefenseProfile.data.summaryLabel
		: null,
);
let trainingDefenderHitPoints =
	$state<CombatTrainingDefenderHitPointsState | null>(null);
let trainingDefenderHitPointsError = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let visibleTrainingDefenderHitPointsSummary = $derived(
	selectedAttackerIsSessionCharacter
		? (trainingDefenderHitPoints?.summaryLabel ??
				trainingDefenderHitPointsError ??
				"HP de treino indispon\u00edvel.")
		: "Aria n\u00e3o usa HP de treino de personagem.",
);
let canResolveTrainingEnemyAttack = $derived(
	selectedAttackerIsSessionCharacter &&
		selectedAttackerCharacter !== null &&
		selectedLoadout !== null &&
		trainingEnemyDefenseProfile?.success === true,
);
let canUseSelectedWeapon = $derived(
	!selectedAttackerIsSessionCharacter || activeWeaponProfile !== undefined,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let visibleLoadoutErrorMessage = $derived(
	selectedAttackerIsSessionCharacter ? loadoutErrorMessage : null,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let attackerStatsView = $derived(
	createCombatAttackerStatsView({
		attacker: selectedAttacker,
		characterClasses,
		characters,
	}),
);
let trainingAttackProfile = $derived(
	createCombatTrainingAttackProfile(
		activeWeaponProfile
			? {
					attacker: selectedAttacker,
					characters,
					equippedWeapon: activeWeaponProfile,
				}
			: {
					attacker: selectedAttacker,
					characters,
				},
	),
);
let selectedTarget = $derived(getTrainingTarget(selectedTargetId));

let view = $derived<CombatEncounterView>(
	createCombatEncounterView({
		attacker: selectedAttacker,
		attackerOptions,
		target: selectedTarget,
		targetDescription: selectedTarget.description,
		targetHitPoints,
		lastState,
		log,
		errorMessage,
		turn: turnState,
		canResolveTrainingEnemyAttack,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function attack(): void {
	if (!view.canAttack || !canUseSelectedWeapon) {
		if (!canUseSelectedWeapon) {
			errorMessage =
				loadoutErrorMessage ?? "A arma equipada ainda n\u00e3o foi carregada.";
		}
		return;
	}

	const result = resolveAttack(
		createAttackInput(
			selectedAttacker,
			selectedTarget,
			targetHitPoints,
			trainingAttackProfile,
		),
	);
	if (!result.success) {
		errorMessage = mapCombatEncounterFailure(result.error);
		return;
	}

	const spentAction = turnService.spendAction({
		state: turnState,
		actorId: selectedAttacker.id,
		actionCost: 1,
	});
	if (!spentAction.success) {
		errorMessage = mapCombatTurnFailure(spentAction.error);
		return;
	}

	turnState = spentAction.data;
	lastState = result.data;
	targetHitPoints = result.data.target.currentHitPoints;
	log = [...log, ...result.data.log];
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function endTurn(): void {
	if (!view.canEndTurn) {
		return;
	}

	const targetTurnLog = createTrainingTargetTurnLog();
	if (!targetTurnLog.success) {
		errorMessage = targetTurnLog.message;
		return;
	}

	const endedTurn = turnService.endTurn({
		state: turnState,
		actorId: turnState.activeActorId,
	});
	if (!endedTurn.success) {
		errorMessage = mapCombatTurnFailure(endedTurn.error);
		return;
	}

	turnState = endedTurn.data;
	log =
		targetTurnLog.entries.length > 0 ? [...log, ...targetTurnLog.entries] : log;
	errorMessage = null;
}

function resetEncounter(): void {
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttacker.id, selectedTarget.id);
	resetTrainingDefenderHitPoints();
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectAttacker(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedAttackerId = event.currentTarget.value;
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttackerId, selectedTarget.id);
	resetTrainingDefenderHitPoints(selectedAttackerId);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectWeapon(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedWeaponId = event.currentTarget.value;
	resetEncounter();
	void refreshEquipmentLoadout();
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectArmor(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedArmorId = event.currentTarget.value;
	resetEncounter();
	void refreshEquipmentLoadout();
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectShield(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedShieldId = event.currentTarget.value;
	resetEncounter();
	void refreshEquipmentLoadout();
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectTarget(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedTargetId = event.currentTarget.value;
	const nextTarget = getTrainingTarget(selectedTargetId);
	targetHitPoints = nextTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttacker.id, nextTarget.id);
	resetTrainingDefenderHitPoints();
}

async function refreshEquipmentLoadout(): Promise<void> {
	const requestId = loadoutRequestId + 1;
	loadoutRequestId = requestId;
	isLoadingLoadout = true;

	const result = await buildEquipmentLoadout({
		armorId: normalizeEquipmentSlotId(selectedArmorId),
		mainHandWeaponId: selectedWeaponId,
		offHandShieldId: normalizeEquipmentSlotId(selectedShieldId),
	});
	if (requestId !== loadoutRequestId) {
		return;
	}

	isLoadingLoadout = false;
	if (!result.success) {
		selectedLoadout = null;
		loadoutErrorMessage = mapEquipmentLoadoutFailure(result.error);
		return;
	}

	selectedLoadout = result.data;
	loadoutErrorMessage = null;
}

function mapEquipmentLoadoutFailure(failure: EquipmentFailure): string {
	switch (failure.code) {
		case "INVALID_EQUIPMENT_ID":
			return "A arma equipada possui um identificador inv\u00e1lido.";
		case "EQUIPMENT_NOT_FOUND":
			return "A arma equipada n\u00e3o foi encontrada no cat\u00e1logo.";
		case "EQUIPMENT_REPOSITORY_READ_FAILED":
			return "N\u00e3o foi poss\u00edvel ler o cat\u00e1logo de equipamentos.";
		case "CORRUPTED_EQUIPMENT_RECORD":
			return "O registro da arma equipada est\u00e1 corrompido.";
		case "EQUIPMENT_NOT_A_WEAPON":
			return "O item selecionado n\u00e3o \u00e9 uma arma.";
		case "EQUIPMENT_NOT_DEFENSIVE":
			return "O item defensivo selecionado n\u00e3o \u00e9 armadura nem escudo.";
		case "EQUIPMENT_NOT_A_SHIELD":
		case "EQUIPMENT_NOT_ARMOR":
		case "EQUIPMENT_ITEM_UNUSABLE":
		case "EQUIPMENT_LOADOUT_HAND_CONFLICT":
			return "A combina\u00e7\u00e3o de equipamento escolhida n\u00e3o pode ser usada neste treino.";
		case "EQUIPMENT_WEAPON_UNUSABLE":
			return "A arma equipada est\u00e1 quebrada.";
		case "WEAPON_ATTACK_PROFILE_NOT_FOUND":
			return "A arma equipada ainda n\u00e3o tem perfil de ataque.";
		case "DEFENSE_PROFILE_NOT_FOUND":
			return "A armadura ou escudo equipado ainda n\u00e3o tem perfil defensivo.";
		case "INVALID_CONSUMABLE_ID":
		case "CONSUMABLE_NOT_FOUND":
		case "CONSUMABLE_REPOSITORY_READ_FAILED":
		case "CORRUPTED_CONSUMABLE_RECORD":
			return "O loadout de combate recebeu um item fora do escopo de armas.";
	}
}

function normalizeEquipmentSlotId(id: string): string | undefined {
	return id ? id : undefined;
}

function resetTrainingDefenderHitPoints(
	characterId = selectedAttackerId,
): void {
	const character =
		characters.find((candidate) => candidate.id === characterId) ?? null;
	if (!character) {
		trainingDefenderHitPoints = null;
		trainingDefenderHitPointsError = null;
		return;
	}

	const result = createCombatTrainingDefenderHitPoints({
		character,
		characterClasses,
	});
	if (!result.success) {
		trainingDefenderHitPoints = null;
		trainingDefenderHitPointsError = mapCombatTrainingDefenderHitPointsFailure(
			result.error,
		);
		return;
	}

	trainingDefenderHitPoints = result.data;
	trainingDefenderHitPointsError = null;
}

function mapCombatTrainingDefenderHitPointsFailure(
	failure: CombatTrainingDefenderHitPointsFailure,
): string {
	switch (failure.code) {
		case "TRAINING_DEFENDER_CLASS_NOT_FOUND":
			return "N\u00e3o foi poss\u00edvel localizar a classe para calcular o HP de treino.";
		case "TRAINING_DEFENDER_DERIVED_STATS_FAILED":
			return "N\u00e3o foi poss\u00edvel calcular o HP de treino deste personagem.";
	}
}

function mapCombatEncounterFailure(failure: CombatEncounterFailure): string {
	switch (failure.code) {
		case "INVALID_COMBAT_ENCOUNTER_INPUT":
			return "O encontro de combate recebeu dados inválidos.";
		case "ACTION_QUEUE_FAILED":
			return "Não foi possível colocar o ataque na fila de ações.";
		case "RESOLUTION_FAILED":
			return "Não foi possível resolver o teste de ataque.";
		case "DAMAGE_PIPELINE_FAILED":
			return "Não foi possível calcular o dano do ataque.";
	}
}

function mapCombatTrainingEnemyAttackFailure(
	failure: CombatTrainingEnemyAttackFailure,
): string {
	switch (failure.code) {
		case "INVALID_TRAINING_ENEMY_ATTACK_INPUT":
			return "O ataque do alvo de treino recebeu dados inválidos.";
		case "DAMAGE_PIPELINE_FAILED":
			return "N\u00e3o foi poss\u00edvel calcular o dano de treino recebido.";
		case "RESOLUTION_FAILED":
			return "Não foi possível resolver o ataque do alvo de treino.";
	}
}

function mapCombatTurnFailure(failure: CombatTurnFailure): string {
	switch (failure.code) {
		case "INVALID_TURN_INPUT":
			return "O turno recebeu dados inv\u00e1lidos.";
		case "UNKNOWN_TURN_ACTOR":
			return "O participante do turno n\u00e3o foi encontrado.";
		case "INACTIVE_TURN_ACTOR":
			return "Este participante n\u00e3o est\u00e1 com o turno ativo.";
		case "INSUFFICIENT_ACTION_POINTS":
			return "N\u00e3o h\u00e1 a\u00e7\u00f5es suficientes para atacar.";
	}
}

function createTrainingTargetTurnLog(): TrainingTargetTurnLogResult {
	if (turnState.activeActorId !== selectedTarget.id) {
		return { success: true, entries: [] };
	}

	if (!selectedAttackerIsSessionCharacter) {
		const passiveLog = createCombatTrainingTargetTurnLog({
			activeActorId: turnState.activeActorId,
			target: selectedTarget,
		});

		return {
			success: true,
			entries: passiveLog ? [passiveLog] : [],
		};
	}

	if (!selectedAttackerCharacter || !selectedLoadout) {
		return {
			success: false,
			message:
				loadoutErrorMessage ??
				"A defesa equipada ainda não foi carregada para receber o ataque de treino.",
		};
	}

	if (!trainingDefenderHitPoints) {
		resetTrainingDefenderHitPoints(selectedAttackerCharacter.id);
	}

	if (!trainingDefenderHitPoints) {
		return {
			success: false,
			message:
				trainingDefenderHitPointsError ??
				"HP de treino indispon\u00edvel para este personagem.",
		};
	}

	if (trainingDefenderHitPoints.isDefeated) {
		return {
			success: true,
			entries: [
				`${trainingDefenderHitPoints.characterLabel} j\u00e1 est\u00e1 com 0 HP de treino. Reinicie o encontro para testar novamente; Moribundo n\u00e3o foi aplicado.`,
			],
		};
	}

	const result = resolveTrainingEnemyAttack({
		attacker: {
			id: selectedTarget.id,
			label: selectedTarget.label,
		},
		defender: {
			id: selectedAttacker.id,
			label: selectedAttacker.label,
		},
		defenderCharacter: selectedAttackerCharacter,
		defenderDefenseProfile: selectedLoadout.activeDefenseProfile,
	});
	if (!result.success) {
		return {
			success: false,
			message: mapCombatTrainingEnemyAttackFailure(result.error),
		};
	}

	const defenderHitPoints = applyCombatTrainingDefenderDamage({
		state: trainingDefenderHitPoints,
		incomingDamage: result.data.incomingDamage,
	});
	if (!defenderHitPoints.success) {
		return {
			success: false,
			message: mapCombatTrainingDefenderHitPointsFailure(
				defenderHitPoints.error,
			),
		};
	}
	trainingDefenderHitPoints = defenderHitPoints.data.state;

	return {
		success: true,
		entries: [...result.data.log, ...defenderHitPoints.data.log],
	};
}

function getInitialTargetHitPoints(target: CombatTrainingTarget): number {
	return target.currentHitPoints;
}

function getTrainingTarget(id: string): CombatTrainingTarget {
	return findTrainingTargetById(id) ?? initialTarget;
}

function getCombatAttacker(id: string): CombatEncounterActorRef {
	return findCombatAttackerOptionById(attackerOptions, id) ?? attacker;
}

function createInitialTurnState(
	attackerId: string,
	targetId: string,
): CombatTurnState {
	const startedTurn = turnService.startTurnOrder({
		actorOrder: [attackerId, targetId],
	});

	return startedTurn.success
		? startedTurn.data
		: {
				round: 1,
				activeActorId: attackerId,
				activeActorIndex: 0,
				actorOrder: [attackerId, targetId],
				actionPointsRemaining: 3,
				maxActionPoints: 3,
				events: [],
			};
}

onMount(() => {
	resetTrainingDefenderHitPoints();
	void refreshEquipmentLoadout();
});
</script>

<section aria-labelledby="combat-encounter-title" data-testid="combat-encounter-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Combate</p>
			<h2
				id="combat-encounter-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Encontro de treino
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Escolha um alvo de treino e resolva um ataque determinístico.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="combat-status">
			{view.statusLabel}
		</p>
	</div>

	<div class="mt-6 grid gap-3 md:grid-cols-3">
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Rodada</p>
			<p class="mt-1 text-lg font-semibold text-bone" data-testid="combat-round">
				{view.roundLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Turno</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="combat-active-turn"
			>
				{view.activeTurnLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">A&ccedil;&otilde;es</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="combat-action-points"
			>
				{view.actionPointsLabel}
			</p>
		</div>
	</div>
	<p class="mt-3 leading-7 text-bone" data-testid="combat-turn-instruction">
		{view.turnInstruction}
	</p>

	<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
		<label class="block">
			<span class="text-sm font-semibold text-ether">Atacante</span>
			<select
				bind:value={selectedAttackerId}
				onchange={selectAttacker}
				data-testid="combat-attacker-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			>
				{#each view.attackerOptions as option}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>

		<label class="block">
			<span class="text-sm font-semibold text-ether">Arma equipada</span>
			<select
				bind:value={selectedWeaponId}
				onchange={selectWeapon}
				disabled={!selectedAttackerIsSessionCharacter || isLoadingLoadout}
				data-testid="combat-weapon-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether disabled:bg-ruin disabled:text-bone"
			>
				{#each equipmentWeapons as weapon}
					<option value={weapon.id}>{weapon.label}</option>
				{/each}
			</select>
			<p
				class="mt-2 text-sm leading-6 text-bone"
				data-testid="combat-equipped-weapon-helper"
			>
				{#if selectedAttackerIsSessionCharacter}
					{#if activeWeaponProfile}
						Arma ativa: {activeWeaponProfile.label} ({activeWeaponProfile.diceExpression}).
					{:else if isLoadingLoadout}
						Carregando arma equipada.
					{:else}
						{loadoutErrorMessage ?? "Arma equipada indispon\u00edvel."}
					{/if}
				{:else}
					Aria usa perfil fixo de treino.
				{/if}
			</p>
		</label>

		<label class="block">
			<span class="text-sm font-semibold text-ether">Armadura equipada</span>
			<select
				bind:value={selectedArmorId}
				onchange={selectArmor}
				disabled={!selectedAttackerIsSessionCharacter || isLoadingLoadout}
				data-testid="combat-armor-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether disabled:bg-ruin disabled:text-bone"
			>
				<option value="">Sem armadura</option>
				{#each equipmentArmors as armor}
					<option value={armor.id}>{armor.label}</option>
				{/each}
			</select>
		</label>

		<label class="block">
			<span class="text-sm font-semibold text-ether">Escudo equipado</span>
			<select
				bind:value={selectedShieldId}
				onchange={selectShield}
				disabled={!selectedAttackerIsSessionCharacter || isLoadingLoadout}
				data-testid="combat-shield-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether disabled:bg-ruin disabled:text-bone"
			>
				<option value="">Sem escudo</option>
				{#each equipmentShields as shield}
					<option value={shield.id}>{shield.label}</option>
				{/each}
			</select>
		</label>

		<label class="block">
			<span class="text-sm font-semibold text-ether">Alvo de treino</span>
			<select
				bind:value={selectedTargetId}
				onchange={selectTarget}
				data-testid="combat-target-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			>
				{#each trainingTargets as target}
					<option value={target.id}>{target.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Atacante</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.attackerLabel}</h3>
			<div
				class="mt-4 border-t border-bronze pt-4"
				data-testid="combat-attacker-stats"
			>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<p class="text-sm font-semibold text-ether">
						{attackerStatsView.heading}
					</p>
					<p
						class="text-sm font-semibold text-bone"
						data-testid="combat-attacker-stats-source"
					>
						{attackerStatsView.sourceLabel}
					</p>
				</div>
				<dl class="mt-3 grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Classe</dt>
						<dd class="text-right text-bone" data-testid="combat-attacker-class">
							{attackerStatsView.classLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">HP</dt>
						<dd class="text-right text-bone" data-testid="combat-attacker-max-hp">
							{attackerStatsView.maxHpLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Iniciativa</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-initiative"
						>
							{attackerStatsView.initiativeLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Carga</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-carry"
						>
							{attackerStatsView.carrySlotLimitLabel}
						</dd>
					</div>
				</dl>
				<p class="mt-3 text-sm leading-6 text-bone">
					{attackerStatsView.helperText}
				</p>
			</div>
			<div
				class="mt-4 border-t border-bronze pt-4"
				data-testid="combat-equipped-defense-profile"
			>
				<p class="text-sm font-semibold text-ether">Defesa equipada</p>
				<p class="mt-3 text-sm leading-6 text-bone">
					{#if selectedAttackerIsSessionCharacter}
						{#if activeDefenseProfile}
							{activeDefenseProfile.summaryLabel}
						{:else if isLoadingLoadout}
							Carregando defesa equipada.
						{:else}
							Sem armadura ou escudo equipado.
						{/if}
					{:else}
						Aria usa defesa fixa de treino.
					{/if}
				</p>
				<p class="mt-2 text-sm leading-6 text-bone">
					{#if selectedAttackerIsSessionCharacter}
						<span data-testid="combat-training-enemy-defense-summary">
							{trainingEnemyDefenseSummary ??
								"CA contra treino indispon\u00edvel enquanto a defesa carrega."}
						</span>
					{:else}
						O alvo de treino s&oacute; ataca personagens da sess&atilde;o.
					{/if}
				</p>
				{#if selectedAttackerIsSessionCharacter}
					<p class="mt-2 text-sm leading-6 text-bone">
						Ataques recebidos de treino usam esta CA; HP real permanece intacto.
					</p>
					<p
						class="mt-2 text-sm font-semibold leading-6 text-bone"
						data-testid="combat-training-defender-hp"
					>
						{visibleTrainingDefenderHitPointsSummary}
					</p>
				{/if}
			</div>
			<div
				class="mt-4 border-t border-bronze pt-4"
				data-testid="combat-training-damage-profile"
			>
				<p class="text-sm font-semibold text-ether">Perfil de dano</p>
				<dl class="mt-3 grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Matriz</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-training-damage-matrix"
						>
							{trainingAttackProfile.matrixLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Treino</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-training-damage-summary"
						>
							{trainingAttackProfile.summaryLabel}
						</dd>
					</div>
				</dl>
				<p class="mt-3 text-sm leading-6 text-bone">
					{trainingAttackProfile.helperText}
				</p>
			</div>
			<p class="mt-3 leading-7 text-bone">Ação disponível: ataque simples.</p>
		</div>

		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Alvo</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.targetLabel}</h3>
			<p class="mt-3 leading-7 text-bone" data-testid="combat-target-description">
				{view.targetDescription}
			</p>
			<div class="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
				<span class="border border-bronze px-3 py-1 text-bone">
					{view.targetArmorClassLabel}
				</span>
				<span class="border border-bronze px-3 py-1 text-bone">
					{view.targetHitPointsLabel}
				</span>
			</div>
		</div>
	</div>

	<div class="mt-6 flex flex-wrap gap-3">
		<button
			type="button"
			disabled={!view.canAttack || !canUseSelectedWeapon}
			onclick={attack}
			data-testid="combat-attack-button"
			class="border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-colors hover:border-bone hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-ruin disabled:text-bone"
		>
			Atacar
		</button>
		<button
			type="button"
			onclick={resetEncounter}
			disabled={!view.canReset}
			data-testid="combat-reset-button"
			class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
		>
			Reiniciar encontro
		</button>
		<button
			type="button"
			disabled={!view.canEndTurn}
			onclick={endTurn}
			data-testid="combat-end-turn-button"
			class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-blood-shadow disabled:text-bone"
		>
			Encerrar turno
		</button>
	</div>

	{#if view.isEncounterComplete}
		<div
			class="mt-5 border border-ether bg-blood-shadow px-5 py-4"
			data-testid="combat-outcome"
		>
			<p class="text-sm font-semibold text-ether">
				{view.encounterOutcomeLabel}
			</p>
			<p class="mt-2 leading-7 text-bone">
				{view.encounterOutcomeDescription}
			</p>
		</div>
	{/if}

	{#if view.errorMessage || visibleLoadoutErrorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="combat-error"
		>
			{view.errorMessage ?? visibleLoadoutErrorMessage}
		</div>
	{/if}

	<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
		<div class="border border-bronze bg-blood-shadow px-5 py-6">
			<p class="text-sm font-semibold text-ether">Último resultado</p>
			<p class="mt-3 leading-7 text-bone" data-testid="combat-result-summary">
				{view.resultSummary}
			</p>
		</div>

		<div class="border border-bronze bg-blood-shadow px-5 py-6">
			<p class="text-sm font-semibold text-ether">Log do encontro</p>
			<ol class="mt-4 space-y-3" data-testid="combat-log">
				{#each view.logItems as item}
					<li class="leading-7 text-bone">{item}</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
