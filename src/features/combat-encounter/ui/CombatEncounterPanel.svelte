<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import { LimitBreakService } from "$lib/entities/character/domain/LimitBreakService";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { CompanionRecord } from "$lib/entities/companions";
import { WorkerCraftingRepository } from "$lib/entities/equipment/infrastructure/WorkerCraftingRepository";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import { SynergyService } from "$lib/entities/synergy/domain/SynergyService";
import { WorkerSynergyRepository } from "$lib/entities/synergy/infrastructure/WorkerSynergyRepository";
import { chatState } from "$lib/features/chat";
import { DiceService } from "$lib/shared/dice";
import type { CharacterCraftedItemRecord } from "../../crafting/model/craftingSchema";
import { CombatEncounterService } from "../domain/CombatEncounterService";
import { CombatLootService } from "../domain/CombatLootService";
import { CombatTurnService } from "../domain/CombatTurnService";
import { StealthCombatService } from "../domain/StealthCombatService";
import {
	type TacticalAiActor,
	TacticalAiService,
} from "../domain/TacticalAiService";
import { findUltimateByClass } from "../domain/UltimatesCatalog";
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
	type CombatTrainingTarget,
	findTrainingTargetById,
} from "../model/combatTrainingTargetCatalog";
import { createCombatTrainingTargetTurnLog } from "../model/combatTrainingTargetTurn";
import type {
	CombatTurnFailure,
	CombatTurnState,
} from "../model/combatTurnTypes";
import { MONSTER_TEMPLATES, type Monster } from "../model/monsterCatalog";

type Props = {
	attacker: CombatEncounterActorRef;
	characterClasses: readonly CharacterClassRecord[];
	characters: readonly CharacterRecord[];
	companions?: readonly CompanionRecord[];
	onCompanionDamage?: (companionId: string, damage: number) => void;
	onShareSensory?: (companionId: string, isShare: boolean) => void;
	createAttackInput: (
		attacker: CombatEncounterActorRef,
		target: CombatTrainingTarget,
		targetHitPoints: number,
		attackProfile: CombatTrainingAttackProfile,
	) => CombatEncounterInput;
	initialTarget: CombatTrainingTarget;
	resolveAttack: (
		input: CombatEncounterInput,
	) => ReturnType<CombatEncounterStateResolver>;
	trainingTargets: readonly CombatTrainingTarget[];
	service?: CombatEncounterService;

	// Real combat properties
	characterHudStates?: Record<
		string,
		{ hp: number; pv: number; actionUsed: boolean; reactionUsed: boolean }
	>;
	combatRepository?: any;
	activeCombatEncounterId?: string | null;
	onCombatEnd?: () => void;
	characterRepository?: any;
};

type CombatEncounterStateResolver = (
	input: CombatEncounterInput,
) =>
	| { readonly success: true; readonly data: CombatEncounterState }
	| { readonly success: false; readonly error: CombatEncounterFailure };

const turnService = new CombatTurnService();
const stealthService = new StealthCombatService();
const limitBreakService = new LimitBreakService();

const randRoll = () => {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	return (arr[0] % 20) + 1;
};

const randD6 = () => {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	return (arr[0] % 6) + 1;
};

let {
	attacker,
	characterClasses,
	characters,
	companions = [],
	onCompanionDamage,
	onShareSensory,
	createAttackInput,
	initialTarget,
	resolveAttack,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	trainingTargets,
	service,
	characterHudStates = {},
	combatRepository,
	activeCombatEncounterId = null,
	onCombatEnd,
	characterRepository,
}: Props = $props();

// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for reset.
let targetHitPoints = $state(getInitialTargetHitPoints(initialTarget));
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected target.
let selectedTargetId = $state(initialTarget.id);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected attacker.
let selectedAttackerId = $state(attacker.id);
let attackerChar = $derived(
	characters.find((c) => c.id === selectedAttackerId),
);
let lastState = $state<CombatEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let log = $state<readonly string[]>([]);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial turn state.
let turnState = $state<CombatTurnState>(
	createInitialTurnState(attacker.id, initialTarget.id),
);

let attackerHp = $state(15);
let attackerTension = $derived(attackerChar?.tensionMeter ?? 0);
let attackerDeathSuccesses = $state(0);
let attackerDeathFailures = $state(0);
let attackerIsDying = $state(false);
let _limitBreakActive = $state(false);

let selectedTrickId = $state("marca_presa");
let masterEeSpent = $state(0);
let familiarReactionUsed = $state(false);
let _familiarFlickered = $state(false);

let _isStealthMode = $state(false);
let heatLevel = $state(0);
let guardPosition = $state("flank");
let useShadows = $state(false);
let _isInPoleiro = $state(false);
let _isHanging = $state(false);
let selectedTakedownType = $state("strike");

let activeCompanions = $derived(
	companions.filter((c) => c.characterId === selectedAttackerId),
);

let _activeCompanionStats = $derived(
	activeCompanions.map((comp) => {
		const char = characters.find((c) => c.id === selectedAttackerId);
		if (!char) {
			return {
				record: comp,
				hpMax: comp.hpMax,
				armorClass: 10,
				canAttack: false,
			};
		}

		const masterMatrix = Math.max(char.physical, char.mental, char.social);
		const masterTier = Math.floor((char.level - 1) / 5) + 1;

		let hpMax = comp.hpMax;
		let armorClass = 10;
		let canAttack = false;

		if (comp.type === "aggressor") {
			hpMax = 6 * char.level + masterMatrix;
			armorClass = 12 + masterMatrix + masterTier;
			canAttack = true;
		} else if (comp.type === "protector") {
			hpMax = 10 * char.level + masterMatrix;
			armorClass = 14 + masterMatrix + masterTier;
			canAttack = true;
		} else if (comp.type === "scout") {
			hpMax = 4 * char.level + masterMatrix;
			armorClass = 13 + masterMatrix + masterTier;
			canAttack = true;
		} else if (comp.type === "familiar") {
			hpMax = char.mental * 5 * comp.tier;
			armorClass = 10 + char.mental + comp.tier;
			canAttack = false;
		}

		if (comp.isShareSensory) {
			armorClass = Math.max(0, armorClass - 2);
		}

		return {
			record: comp,
			hpMax,
			armorClass,
			canAttack,
		};
	}),
);

let hasActiveFamiliar = $derived(
	companions.some(
		(comp) =>
			comp.characterId === selectedAttackerId &&
			comp.type === "familiar" &&
			!comp.isDissipated,
	),
);
let masterBaseEe = $derived(
	attackerChar ? attackerChar.level + attackerChar.mental : 0,
);
let masterMaxEe = $derived(
	hasActiveFamiliar ? Math.max(0, masterBaseEe - 1) : masterBaseEe,
);
let masterAvailableEe = $derived(Math.max(0, masterMaxEe - masterEeSpent));
let masterPvSpent = $state(0);
let masterMaxPv = $derived(
	attackerChar ? (attackerChar.physical + attackerChar.resistance) * 3 : 10,
);
let masterAvailablePv = $derived(Math.max(0, masterMaxPv - masterPvSpent));

let canCommandCompanion = $derived(
	turnState.activeActorId === selectedAttackerId &&
		turnState.actionPointsRemaining >= 1 &&
		!attackerIsDying,
);

$effect(() => {
	if (selectedAttackerId) {
		const char = characters.find((c) => c.id === selectedAttackerId);
		if (char) {
			const realClass = characterClasses.find((c) => c.id === char.classId);
			const maxHp =
				((realClass ? realClass.baseHp : 10) +
					char.physical +
					char.resistance) *
				char.level;
			attackerHp = maxHp;
		} else {
			attackerHp = 15;
		}
		_limitBreakActive = false;
		masterPvSpent = 0;

		const moribundEffect = activeEffects.find(
			(e) => e.characterId === selectedAttackerId && e.type === "moribund",
		);
		const unconsciousEffect = activeEffects.find(
			(e) => e.characterId === selectedAttackerId && e.type === "unconscious",
		);

		if (moribundEffect) {
			attackerHp = 0;
			attackerIsDying = true;
			try {
				const meta = moribundEffect.metadata
					? JSON.parse(moribundEffect.metadata)
					: {};
				attackerDeathSuccesses =
					typeof meta.successes === "number" ? meta.successes : 0;
				attackerDeathFailures =
					typeof meta.failures === "number" ? meta.failures : 0;
			} catch {
				attackerDeathSuccesses = 0;
				attackerDeathFailures = 0;
			}
		} else {
			attackerIsDying = false;
			attackerDeathSuccesses = 0;
			attackerDeathFailures = 0;
			if (unconsciousEffect) {
				attackerHp = 0;
			}
		}
	}
});

$effect(() => {
	if (turnState.activeActorId === selectedAttackerId) {
		if (attackerHp === 0 && attackerIsDying) {
			runAutomaticDeathSave();
		}
	}
});

function addStatusEffect(characterId: string, type: string, metadata?: string) {
	const alreadyHas = activeEffects.some(
		(e) => e.characterId === characterId && e.type === type,
	);
	if (alreadyHas) return;

	const isTacticalTalent = type === "extra_breath" || type === "double_time";
	const durationTurns = isTacticalTalent ? 3 : undefined;

	const defaultMetadata =
		type === "moribund"
			? JSON.stringify({ successes: 0, failures: 0 })
			: undefined;

	const newEffect = {
		id: crypto.randomUUID(),
		characterId,
		type,
		severity: isTacticalTalent ? 1 : 2,
		severityMax: isTacticalTalent ? 1 : 4,
		isAggravated: false,
		durationTurns,
		metadata: metadata ?? defaultMetadata,
		createdAt: new Date().toISOString(),
	};
	activeEffects = [...activeEffects, newEffect];
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));

	const isHero = characters.some((c) => c.id === characterId);
	if (isHero && dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: newEffect },
		});
	}
}

function removeStatusEffect(characterId: string, type: string) {
	const effectToRemove = activeEffects.find(
		(e) => e.characterId === characterId && e.type === type,
	);
	activeEffects = activeEffects.filter(
		(e) => !(e.characterId === characterId && e.type === type),
	);
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));

	const isHero = characters.some((c) => c.id === characterId);
	if (isHero && dbWorker && effectToRemove) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "DELETE_STATUS_EFFECT",
			payload: { id: effectToRemove.id },
		});
	}
}

function updateMoribundMetadata(
	characterId: string,
	successes: number,
	failures: number,
) {
	const effectIndex = activeEffects.findIndex(
		(e) => e.characterId === characterId && e.type === "moribund",
	);
	if (effectIndex === -1) return;

	const updatedMetadata = JSON.stringify({ successes, failures });
	const updatedEffect = {
		...activeEffects[effectIndex],
		metadata: updatedMetadata,
	};

	activeEffects = [
		...activeEffects.slice(0, effectIndex),
		updatedEffect,
		...activeEffects.slice(effectIndex + 1),
	];

	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));

	const isHero = characters.some((c) => c.id === characterId);
	if (isHero && dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: updatedEffect },
		});
	}
}

function runAutomaticDeathSave() {
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;

	if (!service) {
		console.warn("CombatEncounterService não foi fornecido ao painel.");
		return;
	}

	const actor: TacticalAiActor = {
		id: char.id,
		name: char.name,
		maxHp: 15,
		currentHp: attackerHp,
		armorClass: 10,
		level: char.level,
		physical: char.physical,
		mental: char.mental,
		resistance: char.resistance,
		isDying: attackerIsDying,
		deathSuccesses: attackerDeathSuccesses,
		deathFailures: attackerDeathFailures,
	};

	const result = service.resolveDeathSaves([actor]);
	if (!result.success) {
		console.error("Erro ao resolver testes de morte:", result.error.message);
		return;
	}

	const updated = result.data.updatedParty[0];
	if (!updated) return;

	attackerHp = updated.currentHp;
	attackerIsDying = updated.isDying;
	attackerDeathSuccesses = updated.deathSuccesses;
	attackerDeathFailures = updated.deathFailures;

	log = [...log, ...result.data.logs];

	if (updated.currentHp > 0) {
		removeStatusEffect(char.id, "moribund");
		removeStatusEffect(char.id, "unconscious");
	} else if (!updated.isDying && updated.deathFailures < 3) {
		removeStatusEffect(char.id, "moribund");
	} else if (updated.deathFailures >= 3) {
		removeStatusEffect(char.id, "moribund");
		removeStatusEffect(char.id, "unconscious");
		addStatusEffect(char.id, "dead");
	} else {
		updateMoribundMetadata(
			char.id,
			updated.deathSuccesses,
			updated.deathFailures,
		);
	}
}

function saveCharacterAndSync(updatedChar: CharacterRecord) {
	window.dispatchEvent(
		new CustomEvent("pandorha:character-updated", { detail: updatedChar }),
	);

	const isHero = characters.some((c) => c.id === updatedChar.id);
	if (isHero && dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_CHARACTER",
			payload: { character: updatedChar },
		});
	}
}

function addTension(amount: number) {
	if (attackerHp === 0 || !attackerChar) return;

	let trigger: "massive_damage" | "adjacent_ally_down" | "lethal_precision" =
		"lethal_precision";
	if (amount === 40) {
		trigger = "adjacent_ally_down";
	} else if (amount === 30) {
		trigger = "massive_damage";
	} else {
		const currentTension = attackerChar.tensionMeter ?? 0;
		const newTension = Math.min(100, Math.max(0, currentTension + amount));
		const updated = {
			...attackerChar,
			tensionMeter: newTension,
			updatedAt: new Date().toISOString(),
		};
		saveCharacterAndSync(updated);
		if (newTension === 100) {
			log = [
				...log,
				`🔥 LIMIT BREAK ATIVO para ${selectedAttacker.label}! A habilidade Ultimate da classe está disponível.`,
			];
		}
		return;
	}

	const result = limitBreakService.accumulateTension(attackerChar, trigger);
	if (result.success) {
		const updatedChar = result.data;
		saveCharacterAndSync(updatedChar);

		if (updatedChar.tensionMeter === 100) {
			log = [
				...log,
				`🔥 LIMIT BREAK ATIVO para ${selectedAttacker.label}! A habilidade Ultimate da classe está disponível.`,
			];
		}
	}
}

function _activateLimitBreak() {
	if (!attackerChar || attackerTension < 100) return;

	const ultimate = findUltimateByClass(attackerChar.classId);
	if (!ultimate) return;

	const result = limitBreakService.consumeLimitBreak(attackerChar);
	if (result.success) {
		const updatedChar = result.data;
		saveCharacterAndSync(updatedChar);
	}

	addStatusEffect(attackerChar.id, ultimate.statusEffectType);
	_limitBreakActive = true;
	log = [
		...log,
		`💥 LIMIT BREAK CONJURADO! ${attackerChar.name} ativou a Ultimate: ${ultimate.name} (${attackerChar.classId === "weaver" ? "Tecelão" : attackerChar.classId === "hunter" ? "Caçador" : attackerChar.classId === "emissary" ? "Emissário" : "Vanguarda"})!`,
	];
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function activateExtraBreath(): void {
	if (!selectedAttackerId || !attackerChar) return;
	if (attackerChar.classId !== "vanguard") return;

	if (masterAvailablePv < 2) {
		errorMessage =
			"Pontos de Vigor (PV) insuficientes para ativar Fôlego Extra.";
		return;
	}

	masterPvSpent += 2;
	addStatusEffect(selectedAttackerId, "extra_breath");

	// Sincronizar com banco via Worker RPC se for personagem real
	const isHero = characters.some((c) => c.id === selectedAttackerId);
	if (isHero && dbWorker) {
		const newEffect = {
			id: crypto.randomUUID(),
			characterId: selectedAttackerId,
			type: "extra_breath",
			severity: 1,
			severityMax: 1,
			isAggravated: false,
			durationTurns: 3,
			createdAt: new Date().toISOString(),
		};
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: newEffect },
		});
	}

	log = [
		...log,
		`🛡️ ${attackerChar.name} ativou o talento tático Fôlego Extra! (Custo: 2 PV). +2 Resistência e +1 Físico por 3 turnos.`,
	];
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function activateDoubleTime(): void {
	if (!selectedAttackerId || !attackerChar) return;
	if (attackerChar.classId !== "weaver") return;

	if (masterAvailableEe < 2) {
		errorMessage =
			"Energia Etérica (EE) insuficiente para ativar Dobrar Tempo.";
		return;
	}

	masterEeSpent += 2;
	addStatusEffect(selectedAttackerId, "double_time");

	// Sincronizar com banco via Worker RPC se for personagem real
	const isHero = characters.some((c) => c.id === selectedAttackerId);
	if (isHero && dbWorker) {
		const newEffect = {
			id: crypto.randomUUID(),
			characterId: selectedAttackerId,
			type: "double_time",
			severity: 1,
			severityMax: 1,
			isAggravated: false,
			durationTurns: 3,
			createdAt: new Date().toISOString(),
		};
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: newEffect },
		});
	}

	log = [
		...log,
		`⏳ ${attackerChar.name} ativou o talento tático Dobrar Tempo! (Custo: 2 EE). +1 Ação Adicional por 3 turnos.`,
	];
	errorMessage = null;
}

function _damageHero(amount: number) {
	if (attackerHp === 0) {
		const isCrit = amount >= 10;
		const failures = isCrit ? 2 : 1;
		attackerDeathFailures += failures;

		log = [
			...log,
			`💥 ${selectedAttacker.label} sofreu ${amount} de dano a 0 HP! +${failures} falha(s) de morte acumulada(s). (Total: ${attackerDeathFailures}/3 falhas).`,
		];

		if (!attackerIsDying) {
			attackerIsDying = true;
			addStatusEffect(selectedAttacker.id, "moribund");
			log = [
				...log,
				`🚨 O dano reativou o estado Moribundo de ${selectedAttacker.label}!`,
			];
		}

		if (attackerDeathFailures >= 3) {
			removeStatusEffect(selectedAttacker.id, "moribund");
			removeStatusEffect(selectedAttacker.id, "unconscious");
			addStatusEffect(selectedAttacker.id, "dead");
			log = [
				...log,
				`🪦 MORTE DEFINITIVA: ${selectedAttacker.label} sucumbiu aos ferimentos e faleceu.`,
			];
		} else {
			updateMoribundMetadata(
				selectedAttacker.id,
				attackerDeathSuccesses,
				attackerDeathFailures,
			);
		}
		return;
	}

	attackerHp = Math.max(0, attackerHp - amount);
	log = [
		...log,
		`💥 ${selectedAttacker.label} sofreu ${amount} de dano! (HP atual: ${attackerHp})`,
	];

	if (amount >= 5) {
		addTension(30);
		log = [
			...log,
			`⚠️ Crise! ${selectedAttacker.label} sofreu dano massivo e acumulou +30 de Tensão.`,
		];
	}

	if (attackerHp === 0) {
		attackerIsDying = true;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
		log = [
			...log,
			`🚨 ${selectedAttacker.label} caiu a 0 HP e está Moribundo!`,
		];
		addStatusEffect(selectedAttacker.id, "unconscious");
		addStatusEffect(selectedAttacker.id, "moribund");

		const familiar = companions.find(
			(c) =>
				c.characterId === selectedAttackerId &&
				c.type === "familiar" &&
				!c.isDissipated,
		);
		if (familiar && !familiarReactionUsed) {
			if (onCompanionDamage) {
				onCompanionDamage(familiar.id, familiar.hpCurrent);
			}
			attackerIsDying = false;
			attackerDeathSuccesses = 0;
			attackerDeathFailures = 0;
			removeStatusEffect(selectedAttackerId, "moribund");
			removeStatusEffect(selectedAttackerId, "unconscious");
			attackerHp = 1;
			log = [
				...log,
				`🧚 PROTOCOLO DE SACRIFÍCIO: Familiar ${familiar.name} sacrificou sua essência vital para reanimar o mestre! ${selectedAttacker.label} estabilizado com 1 HP. O familiar foi desestabilizado.`,
			];
		}
	}
}

function _healHero(amount: number) {
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;
	const realClass = characterClasses.find((c) => c.id === char.classId);
	const maxHp =
		((realClass ? realClass.baseHp : 10) + char.physical + char.resistance) *
		char.level;

	if (attackerHp === 0) {
		removeStatusEffect(char.id, "moribund");
		removeStatusEffect(char.id, "unconscious");
		attackerIsDying = false;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
	}

	attackerHp = Math.min(maxHp, attackerHp + amount);
	log = [
		...log,
		`💖 ${char.name} foi curado em ${amount} HP! (HP atual: ${attackerHp}/${maxHp})`,
	];
}

function _helpHero() {
	if (attackerHp > 0 || !attackerIsDying) return;

	if (!service) {
		console.warn("CombatEncounterService não foi fornecido ao painel.");
		return;
	}

	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;

	const helperChar = characters.find((c) => c.id !== selectedAttackerId) || {
		id: "allied-helper",
		name: "Aliado",
		level: 1,
		physical: 1,
		mental: 1,
		resistance: 1,
		isDying: false,
		deathSuccesses: 0,
		deathFailures: 0,
	};

	const helperActor: TacticalAiActor = {
		id: helperChar.id,
		name: helperChar.name,
		maxHp: 15,
		currentHp: 15,
		armorClass: 10,
		level: helperChar.level,
		physical: helperChar.physical,
		mental: helperChar.mental ?? 1,
		resistance: helperChar.resistance,
		isDying: false,
		deathSuccesses: 0,
		deathFailures: 0,
	};

	const targetActor: TacticalAiActor = {
		id: char.id,
		name: char.name,
		maxHp: 15,
		currentHp: attackerHp,
		armorClass: 10,
		level: char.level,
		physical: char.physical,
		mental: char.mental,
		resistance: char.resistance,
		isDying: attackerIsDying,
		deathSuccesses: attackerDeathSuccesses,
		deathFailures: attackerDeathFailures,
	};

	const kitIndex = craftedItems.findIndex(
		(i) =>
			i.characterId === helperChar.id &&
			i.id === "first-aid-kit" &&
			i.quantity > 0,
	);
	const hasKit = kitIndex !== -1;

	const result = service.resolveFirstAid({
		helper: helperActor,
		target: targetActor,
		hasFirstAidKit: hasKit,
	});

	if (!result.success) {
		console.error("Erro ao aplicar primeiros socorros:", result.error.message);
		return;
	}

	const updated = result.data.updatedTarget;
	attackerIsDying = updated.isDying;
	attackerDeathSuccesses = updated.deathSuccesses;
	attackerDeathFailures = updated.deathFailures;

	log = [...log, ...result.data.logs];

	if (!updated.isDying) {
		removeStatusEffect(char.id, "moribund");
	}

	if (result.data.consumedKitCharge && hasKit) {
		const kit = craftedItems[kitIndex];
		const nextQty = kit.quantity - 1;
		if (nextQty <= 0) {
			craftedItems = craftedItems.filter((_, idx) => idx !== kitIndex);
		} else {
			craftedItems = [
				...craftedItems.slice(0, kitIndex),
				{ ...kit, quantity: nextQty },
				...craftedItems.slice(kitIndex + 1),
			];
		}
		localStorage.setItem(
			"pandorha_crafted_items",
			JSON.stringify(craftedItems),
		);
		window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
		log = [
			...log,
			`📦 Consumido 1 carga do Kit de Primeiros Socorros de ${helperChar.name}. Cargas restantes: ${Math.max(0, nextQty)}.`,
		];
	}
}

// Estado de itens artesanais carregados do localStorage
let craftedItems = $state<CharacterCraftedItemRecord[]>([]);
// biome-ignore lint/suspicious/noExplicitAny: status effects loaded dynamically from local storage
let activeEffects = $state<any[]>([]);
let dbWorker = $state<Worker | null>(null);

// Lógica de Sinergia de Combate
const synergyRepository = new WorkerSynergyRepository();
const synergyService = new SynergyService(synergyRepository);

let cohesionState = $state<any>(null);
let activeElo = $state<any>(null);
let _registeredSignaturesList = $state<any[]>([]);
let openingTact = $state("physical_push");
let reinforceTact = $state("physical_expose");
let selectedReinforcerId = $state("");
let detonationTact = $state("physical_expose");

const _availableTactics = [
	{
		id: "physical_push",
		label: "Física: Empurrar (Ação Imediata: Empurra o alvo)",
	},
	{
		id: "physical_expose",
		label: "Física: Expor (Condição: Aplica Exposto ao inimigo)",
	},
	{
		id: "mental_silence",
		label: "Mental: Silenciar (Condição: Aplica Silenciado ao inimigo)",
	},
];

async function _handleOpenElo() {
	if (!cohesionState) return;
	const res = await synergyService.openSynergyElo({
		cohesionId: cohesionState.id,
		abridorId: selectedAttackerId,
		targetId: selectedTargetId,
		openingTactId: openingTact,
		timestamp: new Date().toISOString(),
	});
	if (res.success) {
		activeElo = res.data;
		const cohesionRes = await synergyRepository.getCohesion(cohesionState.id);
		if (cohesionRes.success) {
			cohesionState = cohesionRes.data;
		}
		log = [
			...log,
			`🔗 Elo de Sinergia aberto por ${getCombatAttacker(selectedAttackerId).name} contra ${getTrainingTarget(selectedTargetId).label} usando tática [${openingTact}].`,
		];
	} else {
		errorMessage = `Erro ao abrir elo: ${res.error.message}`;
	}
}

async function _handleReinforceElo() {
	if (!cohesionState || !activeElo) return;
	const otherHero = characters.find((c) => c.id !== activeElo.abridorId);
	const reinforcerId = selectedReinforcerId || (otherHero ? otherHero.id : "");
	if (!reinforcerId) {
		errorMessage = "Selecione um reforçador válido.";
		return;
	}
	const res = await synergyService.reinforceSynergyElo({
		cohesionId: cohesionState.id,
		reinforcerId: reinforcerId,
		reinforceTactId: reinforceTact,
		timestamp: new Date().toISOString(),
	});
	if (res.success) {
		activeElo = res.data;
		const cohesionRes = await synergyRepository.getCohesion(cohesionState.id);
		if (cohesionRes.success) {
			cohesionState = cohesionRes.data;
		}
		log = [
			...log,
			`⚡ Sinergia em Cadeia: Elo reforçado por ${getCombatAttacker(reinforcerId).name} com tática [${reinforceTact}].`,
		];
	} else {
		errorMessage = `Erro ao reforçar elo: ${res.error.message}`;
	}
}

async function _handleDetonateElo() {
	if (!cohesionState || !activeElo) return;
	const randRoll = () => {
		const arr = new Uint32Array(1);
		crypto.getRandomValues(arr);
		return (arr[0] % 20) + 1;
	};
	const randD6 = () => {
		const arr = new Uint32Array(1);
		crypto.getRandomValues(arr);
		return (arr[0] % 6) + 3;
	};
	const attackRoll = randRoll() + (trainingAttackProfile.attackBonus || 2);
	const targetDefense = selectedTarget.armorClass;
	const targetSaveRoll = randRoll();
	const targetSaveBonus = selectedTarget.saveBonus ?? 2;
	const res = await synergyService.detonateSynergyElo({
		cohesionId: cohesionState.id,
		detonatorId: selectedAttackerId,
		detonationTactId: detonationTact,
		attackRoll,
		targetDefense,
		targetSaveRoll,
		targetSaveBonus,
		timestamp: new Date().toISOString(),
	});
	if (res.success) {
		const result = res.data;
		const detonatorName = getCombatAttacker(selectedAttackerId).name;
		const targetName = selectedTarget.label;
		let detonationLog = "";
		if (result.hit) {
			detonationLog = `💥 Detonação de Elo por ${detonatorName} contra ${targetName}! Ataque: ${attackRoll} vs CA ${targetDefense} (ACERTO). `;
			if (
				result.conditionsApplied.length > 0 ||
				result.instantEffectsExecuted.length > 0
			) {
				detonationLog += `Efeitos Fundidos: [${[...result.instantEffectsExecuted, ...result.conditionsApplied].join(", ")}]. `;
			}
			if (result.saveSuccess) {
				detonationLog += `O alvo resistiu a efeitos de status (Resistência: ${targetSaveRoll + targetSaveBonus}).`;
			} else {
				detonationLog += `O alvo FALHOU em resistir (Resistência: ${targetSaveRoll + targetSaveBonus}).`;
				for (const cond of result.conditionsApplied) {
					const nextId = crypto.randomUUID();
					const newEffect = {
						id: nextId,
						characterId: selectedTargetId,
						name: cond,
						label: cond,
						color: "#ef4444",
						createdAt: new Date().toISOString(),
					};
					activeEffects = [...activeEffects, newEffect];
					localStorage.setItem(
						"pandorha_status_effects",
						JSON.stringify(activeEffects),
					);
				}
			}
			const damage = randD6();
			targetHitPoints = Math.max(0, targetHitPoints - damage);
			detonationLog += ` Dano de Detonação: ${damage} PV.`;
		} else {
			detonationLog = `💨 Detonação falhou! Ataque de ${detonatorName} (${attackRoll}) errou a CA de ${targetName} (${targetDefense}).`;
		}
		activeElo = null;
		log = [...log, detonationLog];
		const sigsRes = await synergyRepository.findAllSignatures();
		if (sigsRes.success) {
			_registeredSignaturesList = sigsRes.data;
		}
	} else {
		errorMessage = `Erro ao detonar elo: ${res.error.message}`;
	}
}

async function _handleRecoverCohesion() {
	if (!cohesionState) return;
	const res = await synergyService.recoverCohesionOnRest(
		cohesionState.id,
		"long",
		new Date().toISOString(),
	);
	if (res.success) {
		cohesionState = res.data;
		log = [
			...log,
			"💤 Descanso longo realizado. Reserva de Coesão compartilhada restaurada ao máximo!",
		];
	}
}

onMount(async () => {
	const refreshItems = () => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("pandorha_crafted_items");
			if (stored) {
				try {
					craftedItems = JSON.parse(stored);
				} catch (e) {
					console.error("Erro ao ler itens do localStorage no combate", e);
				}
			}
		}
	};

	if (typeof window !== "undefined") {
		dbWorker = new Worker(
			new URL(
				"../../../shared/persistence/worker/pandorhaDatabase.worker.ts",
				import.meta.url,
			),
			{ type: "module" },
		);
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "INIT_DATABASE",
			payload: { requestedAt: new Date().toISOString() },
		});

		const stored = localStorage.getItem("pandorha_crafted_items");
		if (stored) {
			try {
				craftedItems = JSON.parse(stored);
			} catch (e) {
				console.error("Erro ao carregar itens da forja no combate", e);
			}
		}

		const storedEffects = localStorage.getItem("pandorha_status_effects");
		if (storedEffects) {
			try {
				activeEffects = JSON.parse(storedEffects);
			} catch (e) {
				console.error("Erro ao carregar status effects no combate", e);
			}
		}

		const initCohesion = await synergyService.initializeCohesion({
			id: "primary",
			activePlayers: 4,
			updatedAt: new Date().toISOString(),
		});
		if (initCohesion.success) {
			cohesionState = initCohesion.data;
		}

		const sigsRes = await synergyRepository.findAllSignatures();
		if (sigsRes.success) {
			_registeredSignaturesList = sigsRes.data;
		}

		window.addEventListener("pandorha:crafted-items-changed", refreshItems);
	}

	return () => {
		if (typeof window !== "undefined") {
			window.removeEventListener(
				"pandorha:crafted-items-changed",
				refreshItems,
			);
		}
	};
});

// Sincronização reativa sempre que o atacante for alterado
$effect(() => {
	if (typeof window !== "undefined" && selectedAttackerId) {
		const stored = localStorage.getItem("pandorha_crafted_items");
		if (stored) {
			try {
				craftedItems = JSON.parse(stored);
			} catch (e) {
				console.error("Erro ao ler itens do localStorage", e);
			}
		}

		const storedEffects = localStorage.getItem("pandorha_status_effects");
		if (storedEffects) {
			try {
				activeEffects = JSON.parse(storedEffects);
			} catch (e) {
				console.error("Erro ao ler status effects do localStorage", e);
			}
		}
	}
});

// Cálculo reativo das propriedades de carga e arma equipada do personagem
let characterItems = $derived(
	craftedItems.filter((i) => i.characterId === selectedAttackerId),
);

let attackerActiveEffects = $derived(
	activeEffects.filter((e) => e.characterId === selectedAttackerId),
);

let equippedWeapon = $derived(
	characterItems.find((i) => {
		if (i.isEquipped !== 1) return false;
		const eqInfo = OFFICIAL_EQUIPMENT.find((eq) => eq.id === i.equipmentId);
		return eqInfo?.kind === "weapon";
	}),
);

let equippedWeight = $derived(
	characterItems.reduce((acc, item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			const weight = eqInfo ? eqInfo.slotCost : 1;
			return acc + weight;
		}
		return acc;
	}, 0),
);

let armorBonus = $derived(
	characterItems.reduce((acc, item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			if (eqInfo?.kind === "armor") {
				if (eqInfo.id === "leather-armor") return acc + 2;
				if (eqInfo.id === "plate-armor") return acc + 5;
			}
		}
		return acc;
	}, 0),
);

let isHeavy = $derived(
	characterItems.some((item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			return eqInfo?.kind === "armor" && eqInfo.id === "plate-armor";
		}
		return false;
	}),
);

let isNoisy = $derived(
	characterItems.some((item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			return eqInfo?.kind === "armor" && eqInfo.id === "plate-armor";
		}
		return false;
	}),
);

let shieldBonus = $derived(
	characterItems.reduce((acc, item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			if (eqInfo?.kind === "shield") {
				if (eqInfo.id === "round-shield") return acc + 1;
			}
		}
		return acc;
	}, 0),
);

let attackerOptions = $derived(createCombatAttackerOptions(characters));
let selectedAttacker = $derived(getCombatAttacker(selectedAttackerId));

let attackerStatsView = $derived(
	createCombatAttackerStatsView({
		attacker: selectedAttacker,
		characterClasses,
		characters,
		equippedWeight,
		activeEffects: attackerActiveEffects,
		armorBonus,
		isHeavy,
		isNoisy,
		shieldBonus,
	}),
);

let trainingAttackProfile = $derived(
	createCombatTrainingAttackProfile(
		{
			attacker: selectedAttacker,
			characters,
			activeEffects: attackerActiveEffects,
			characterClasses,
		},
		equippedWeapon,
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
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function attack() {
	if (!view.canAttack) {
		return;
	}

	if (attackerStatsView.carrySlotLimitLabel.includes("OVERLOADED")) {
		errorMessage =
			"⚠️ PERSONAGEM IMOBILIZADO: Sobrecarga extrema! Ataques bloqueados e velocidade zero!";
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

	if (activeCombatEncounterId && combatRepository) {
		const mon = activeMonsters.find((m) => m.id === selectedTargetId);
		if (mon) {
			mon.currentHitPoints = result.data.target.currentHitPoints;

			const dbMonsterRes = await combatRepository.findMonstersByEncounterId(
				activeCombatEncounterId,
			);
			if (dbMonsterRes.success) {
				const dbMonster = dbMonsterRes.data.find((m: any) => m.id === mon.id);
				if (dbMonster) {
					await combatRepository.saveMonster({
						...dbMonster,
						hpCurrent: mon.currentHitPoints,
						updatedAt: new Date().toISOString(),
					});
				}
			}
		}
	}

	if (
		result.data.resolution.degree === "criticalSuccess" &&
		result.data.resolution.margin >= 10
	) {
		addTension(30);
		log = [
			...log,
			`🎯 PRECISÃO LETAL! ${selectedAttacker.label} obteve um Sucesso Crítico (Margem: +${result.data.resolution.margin}) e acumulou +30 de Tensão.`,
		];
	}

	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function endTurn() {
	if (!view.canEndTurn) {
		return;
	}

	const activeActorId = turnState.activeActorId;

	// Decrementar durações de status do ator que está encerrando o turno
	const actorEffects = activeEffects.filter(
		(e) =>
			e.characterId === activeActorId &&
			e.durationTurns !== undefined &&
			e.durationTurns !== null,
	);

	for (const effect of actorEffects) {
		const nextTurns = effect.durationTurns - 1;
		if (nextTurns <= 0) {
			activeEffects = activeEffects.filter((e) => e.id !== effect.id);

			const isHero = characters.some((c) => c.id === activeActorId);
			if (isHero && dbWorker) {
				dbWorker.postMessage({
					messageId: crypto.randomUUID(),
					type: "DELETE_STATUS_EFFECT",
					payload: { id: effect.id },
				});
			}
			log = [
				...log,
				`⏳ Efeito de status [${effect.type}] em ${activeActorId === selectedAttacker.id ? selectedAttacker.label : activeActorId} expirou e foi removido.`,
			];
		} else {
			activeEffects = activeEffects.map((e) => {
				if (e.id === effect.id) {
					return { ...e, durationTurns: nextTurns };
				}
				return e;
			});

			const isHero = characters.some((c) => c.id === activeActorId);
			if (isHero && dbWorker) {
				const updatedEffect = {
					id: effect.id,
					characterId: effect.characterId,
					type: effect.type,
					severity: effect.severity,
					severityMax: effect.severityMax,
					isAggravated: effect.isAggravated,
					createdAt: effect.createdAt,
					durationTurns: nextTurns,
				};
				dbWorker.postMessage({
					messageId: crypto.randomUUID(),
					type: "SAVE_STATUS_EFFECT",
					payload: { effect: updatedEffect },
				});
			}
			log = [
				...log,
				`⏳ Efeito de status [${effect.type}] em ${activeActorId === selectedAttacker.id ? selectedAttacker.label : activeActorId} reduzido para ${nextTurns} turnos.`,
			];
		}
	}

	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));

	if (activeCombatEncounterId && combatRepository) {
		const endedTurn = turnService.endTurn({
			state: turnState,
			actorId: turnState.activeActorId,
		});
		if (!endedTurn.success) {
			errorMessage = mapCombatTurnFailure(endedTurn.error);
			return;
		}

		turnState = endedTurn.data;
		errorMessage = null;

		const currentEncounter = await combatRepository.findEncounterById(
			activeCombatEncounterId,
		);
		if (currentEncounter.success && currentEncounter.data) {
			const nextTurn = currentEncounter.data.turn + 1;
			await combatRepository.saveEncounter({
				...currentEncounter.data,
				turn: nextTurn,
				round: endedTurn.data.round,
				updatedAt: new Date().toISOString(),
			});
			_combatEncounterState = {
				...currentEncounter.data,
				turn: nextTurn,
				round: endedTurn.data.round,
			};
		}
	} else {
		const targetTurnLog = createCombatTrainingTargetTurnLog({
			activeActorId: turnState.activeActorId,
			target: selectedTarget,
		});
		const endedTurn = turnService.endTurn({
			state: turnState,
			actorId: turnState.activeActorId,
		});
		if (!endedTurn.success) {
			errorMessage = mapCombatTurnFailure(endedTurn.error);
			return;
		}

		turnState = endedTurn.data;
		log = targetTurnLog ? [...log, targetTurnLog] : log;
		errorMessage = null;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resetEncounter(): void {
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttacker.id, selectedTarget.id);
	masterEeSpent = 0;
	masterPvSpent = 0;
	familiarReactionUsed = false;
	_familiarFlickered = false;
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
	masterEeSpent = 0;
	masterPvSpent = 0;
	familiarReactionUsed = false;
	_familiarFlickered = false;
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
	masterEeSpent = 0;
	masterPvSpent = 0;
	familiarReactionUsed = false;
	_familiarFlickered = false;
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

function getInitialTargetHitPoints(target: CombatTrainingTarget): number {
	return target.currentHitPoints;
}

let activeMonsters = $state<Monster[]>([]);
let realInitiativeOrder = $state<string[]>([]);
let _combatEncounterState = $state<any>(null);

const roleMap: Record<string, "brute" | "sniper" | "controller"> = {
	bruto: "brute",
	assassino: "sniper",
	suporte: "controller",
};

$effect(() => {
	if (activeCombatEncounterId && combatRepository) {
		loadRealCombat(activeCombatEncounterId);
	}
});

async function loadRealCombat(encounterId: string) {
	const encRes = await combatRepository.findEncounterById(encounterId);
	if (encRes.success && encRes.data) {
		_combatEncounterState = encRes.data;

		const monstersRes =
			await combatRepository.findMonstersByEncounterId(encounterId);
		if (monstersRes.success) {
			activeMonsters = monstersRes.data.map((dbMonster: any) => {
				let template: any = null;
				for (const key of Object.keys(MONSTER_TEMPLATES)) {
					const match = MONSTER_TEMPLATES[key].find(
						(t: any) =>
							dbMonster.monsterId.startsWith(t.id) ||
							dbMonster.name.includes(t.label),
					);
					if (match) {
						template = match;
						break;
					}
				}
				return {
					id: dbMonster.id,
					label: dbMonster.name,
					description: template?.description || "Inimigo hostil.",
					maxHitPoints: dbMonster.hpMax,
					currentHitPoints: dbMonster.hpCurrent,
					armorClass: template?.armorClass || 12,
					level: template?.level || 1,
					attackBonus: template?.attackBonus || 2,
					damageDice: template?.damageDice || "1d6",
					damageBonus: template?.damageBonus || 1,
					initiativeBase: template?.initiativeBase || 2,
					xpValue: template?.xpValue || 50,
					role: roleMap[dbMonster.tacticalRole] || "brute",
					position: { x: 0, y: 0 },
					debuffs: [],
					spellsCount: dbMonster.eeCurrent,
				};
			});
		}

		realInitiativeOrder = JSON.parse(encRes.data.initiativeOrderJson);

		const turnIndex = (encRes.data.turn - 1) % realInitiativeOrder.length;
		const activeActorId = realInitiativeOrder[turnIndex] || "";

		turnState = {
			round: encRes.data.round,
			roundNumber: encRes.data.round,
			turnNumber: encRes.data.turn,
			activeActorId,
			activeActorIndex: turnIndex,
			actorOrder: realInitiativeOrder,
			actionPointsRemaining: activeActorId === selectedAttackerId ? 2 : 0,
			maxActionPoints: 2,
			events: [],
		};

		const aliveMonster = activeMonsters.find((m) => m.currentHitPoints > 0);
		if (aliveMonster) {
			selectedTargetId = aliveMonster.id;
			targetHitPoints = aliveMonster.currentHitPoints;
		}
	}
}

function originalHeroHasMoribund(heroId: string): boolean {
	return activeEffects.some(
		(e) => e.characterId === heroId && e.type === "moribund",
	);
}

async function addStatusEffectReal(
	characterId: string,
	type: string,
	metadata?: string,
) {
	const alreadyHas = activeEffects.some(
		(e) => e.characterId === characterId && e.type === type,
	);
	if (alreadyHas) return;

	const newEffect = {
		id: crypto.randomUUID(),
		characterId,
		type,
		severity: 2,
		severityMax: 4,
		isAggravated: false,
		metadata: metadata ?? null,
		createdAt: new Date().toISOString(),
	};
	activeEffects = [...activeEffects, newEffect];
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);

	if (dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: newEffect },
		});
	}
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
}

async function removeStatusEffectReal(characterId: string, type: string) {
	const effectToRemove = activeEffects.find(
		(e) => e.characterId === characterId && e.type === type,
	);
	if (!effectToRemove) return;

	activeEffects = activeEffects.filter((e) => e.id !== effectToRemove.id);
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);

	if (dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "DELETE_STATUS_EFFECT",
			payload: { id: effectToRemove.id },
		});
	}
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
}

async function updateStatusEffectReal(
	characterId: string,
	type: string,
	metadata: string,
) {
	const index = activeEffects.findIndex(
		(e) => e.characterId === characterId && e.type === type,
	);
	if (index === -1) return;

	const updated = {
		...activeEffects[index],
		metadata,
		updatedAt: new Date().toISOString(),
	};
	activeEffects = [
		...activeEffects.slice(0, index),
		updated,
		...activeEffects.slice(index + 1),
	];
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);

	if (dbWorker) {
		dbWorker.postMessage({
			messageId: crypto.randomUUID(),
			type: "SAVE_STATUS_EFFECT",
			payload: { effect: updated },
		});
	}
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
}

async function runMonsterTurn(monsterId: string) {
	const monster = activeMonsters.find((m) => m.id === monsterId);
	if (!monster || monster.currentHitPoints <= 0) {
		await advanceTurn();
		return;
	}

	const partyActors: TacticalAiActor[] = characters.map((c) => {
		const hud = characterHudStates[c.id] || { hp: 10, pv: 0 };
		const realClass = characterClasses.find((cls) => cls.id === c.classId);
		const baseHp = realClass ? realClass.baseHp : 10;
		const maxHp = (baseHp + c.physical + c.resistance) * c.level;
		const moribund = activeEffects.find(
			(e) => e.characterId === c.id && e.type === "moribund",
		);
		let successes = 0;
		let failures = 0;
		if (moribund) {
			try {
				const meta = moribund.metadata ? JSON.parse(moribund.metadata) : {};
				successes = typeof meta.successes === "number" ? meta.successes : 0;
				failures = typeof meta.failures === "number" ? meta.failures : 0;
			} catch {}
		}
		return {
			id: c.id,
			name: c.name,
			maxHp,
			currentHp: hud.hp,
			armorClass: 10 + c.physical + c.resistance,
			level: c.level,
			physical: c.physical,
			mental: c.mental,
			resistance: c.resistance,
			isDying: !!moribund,
			deathSuccesses: successes,
			deathFailures: failures,
			debuffs: [],
			position: { x: 0, y: 0 },
		};
	});

	const aiService = new TacticalAiService(
		new DiceService(
			{
				next: () => {
					const arr = new Uint32Array(1);
					crypto.getRandomValues(arr);
					return arr[0] / 0xffffffff;
				},
			},
			{ generate: () => `ai-roll-${Date.now()}` },
			{ now: () => new Date().toISOString() },
		),
	);

	const runRes = aiService.runMonsterTurns({
		monsters: [monster],
		party: partyActors,
	});

	if (runRes.success) {
		const result = runRes.data;
		log = [...log, ...result.logs];

		for (const updatedHero of result.updatedParty) {
			const originalHud = characterHudStates[updatedHero.id];
			if (originalHud) {
				originalHud.hp = updatedHero.currentHp;
				if (updatedHero.isDying && !originalHeroHasMoribund(updatedHero.id)) {
					await addStatusEffectReal(
						updatedHero.id,
						"moribund",
						JSON.stringify({
							successes: updatedHero.deathSuccesses,
							failures: updatedHero.deathFailures,
						}),
					);
				} else if (
					!updatedHero.isDying &&
					originalHeroHasMoribund(updatedHero.id)
				) {
					await removeStatusEffectReal(updatedHero.id, "moribund");
				} else if (updatedHero.isDying) {
					await updateStatusEffectReal(
						updatedHero.id,
						"moribund",
						JSON.stringify({
							successes: updatedHero.deathSuccesses,
							failures: updatedHero.deathFailures,
						}),
					);
				}
			}
		}

		const updatedMonster = result.updatedMonsters[0];
		if (updatedMonster) {
			monster.currentHitPoints = updatedMonster.currentHitPoints;
			if (combatRepository) {
				const dbMonsterRes = await combatRepository.findMonstersByEncounterId(
					activeCombatEncounterId,
				);
				if (dbMonsterRes.success) {
					const dbMonster = dbMonsterRes.data.find(
						(m: any) => m.id === monster.id,
					);
					if (dbMonster) {
						await combatRepository.saveMonster({
							...dbMonster,
							hpCurrent: monster.currentHitPoints,
							updatedAt: new Date().toISOString(),
						});
					}
				}
			}
		}
	}

	await advanceTurn();
}

async function advanceTurn() {
	if (!activeCombatEncounterId || !combatRepository) return;

	const endedTurn = turnService.endTurn({
		state: turnState,
		actorId: turnState.activeActorId,
	});

	if (endedTurn.success) {
		turnState = endedTurn.data;

		const currentEncounter = await combatRepository.findEncounterById(
			activeCombatEncounterId,
		);
		if (currentEncounter.success && currentEncounter.data) {
			const nextTurn = currentEncounter.data.turn + 1;
			await combatRepository.saveEncounter({
				...currentEncounter.data,
				turn: nextTurn,
				round: endedTurn.data.round,
				updatedAt: new Date().toISOString(),
			});
			_combatEncounterState = {
				...currentEncounter.data,
				turn: nextTurn,
				round: endedTurn.data.round,
			};
		}
	}
}

async function _retreat() {
	if (!activeCombatEncounterId || !combatRepository) return;

	const partyActors: TacticalAiActor[] = characters.map((c) => {
		const hud = characterHudStates[c.id] || { hp: 10, pv: 0 };
		const realClass = characterClasses.find((cls) => cls.id === c.classId);
		const baseHp = realClass ? realClass.baseHp : 10;
		const maxHp = (baseHp + c.physical + c.resistance) * c.level;
		return {
			id: c.id,
			name: c.name,
			maxHp,
			currentHp: hud.hp,
			armorClass: 10 + c.physical + c.resistance,
			level: c.level,
			physical: c.physical,
			mental: c.mental,
			resistance: c.resistance,
			isDying: originalHeroHasMoribund(c.id),
			deathSuccesses: 0,
			deathFailures: 0,
			debuffs: [],
			position: { x: 0, y: 0 },
		};
	});

	const diceService = new DiceService(
		{
			next: () => {
				const arr = new Uint32Array(1);
				crypto.getRandomValues(arr);
				return arr[0] / 0xffffffff;
			},
		},
		{ generate: () => `retreat-roll-${Date.now()}` },
		{ now: () => new Date().toISOString() },
	);

	const localService =
		service ??
		new CombatEncounterService(
			{} as any,
			{} as any,
			{ now: () => new Date().toISOString() },
			diceService,
		);

	const retRes = localService.resolveRetreat({
		party: partyActors,
		monsters: activeMonsters,
	});

	if (retRes.success) {
		const resData = retRes.data;
		log = [...log, ...resData.logs];

		if (resData.success) {
			for (const char of characters) {
				const hud = characterHudStates[char.id];
				if (hud && hud.hp > 0 && !originalHeroHasMoribund(char.id)) {
					await addStatusEffectReal(char.id, "exhausted");
				}
			}

			await combatRepository.saveActiveSession({
				id: "current-session",
				combatEncounterId: null,
				updatedAt: new Date().toISOString(),
			});

			if (onCombatEnd) {
				onCombatEnd();
			}
		} else {
			chatState.addMessage({
				type: "combat",
				content: "⚠️ Falha na fuga! Os monstros atacam imediatamente!",
			});
			for (const monster of activeMonsters) {
				if (monster.currentHitPoints > 0) {
					await runMonsterTurn(monster.id);
				}
			}
		}
	}
}

async function _collectRewards() {
	if (!activeCombatEncounterId || !combatRepository || !characterRepository)
		return;

	let bestChar = characters[0];
	for (const char of characters) {
		if (char.mental > bestChar.mental) {
			bestChar = char;
		}
	}
	const batedorId = bestChar ? bestChar.id : selectedAttackerId;

	const partyActors: TacticalAiActor[] = characters.map((c) => {
		const hud = characterHudStates[c.id] || { hp: 10, pv: 0 };
		const realClass = characterClasses.find((cls) => cls.id === c.classId);
		const baseHp = realClass ? realClass.baseHp : 10;
		const maxHp = (baseHp + c.physical + c.resistance) * c.level;
		return {
			id: c.id,
			name: c.name,
			maxHp,
			currentHp: hud.hp,
			armorClass: 10 + c.physical + c.resistance,
			level: c.level,
			physical: c.physical,
			mental: c.mental,
			resistance: c.resistance,
			isDying: originalHeroHasMoribund(c.id),
			deathSuccesses: 0,
			deathFailures: 0,
			debuffs: [],
			position: { x: 0, y: 0 },
		};
	});

	const craftingRepo = new WorkerCraftingRepository();
	const diceService = new DiceService(
		{
			next: () => {
				const arr = new Uint32Array(1);
				crypto.getRandomValues(arr);
				return arr[0] / 0xffffffff;
			},
		},
		{ generate: () => `loot-roll-${Date.now()}` },
		{ now: () => new Date().toISOString() },
	);

	const lootService = new CombatLootService(
		characterRepository,
		craftingRepo as any,
		diceService,
	);

	const lootRes = await lootService.distributeRewards({
		party: partyActors,
		monsters: activeMonsters,
		batedorId,
	});

	if (lootRes.success) {
		log = [...log, ...lootRes.data.logs];

		await combatRepository.saveActiveSession({
			id: "current-session",
			combatEncounterId: null,
			updatedAt: new Date().toISOString(),
		});

		setTimeout(() => {
			if (onCombatEnd) {
				onCombatEnd();
			}
		}, 1500);
	} else {
		errorMessage = "Erro ao distribuir recompensas de combate.";
	}
}

$effect(() => {
	if (activeCombatEncounterId && turnState.activeActorId) {
		const isHero = characters.some((c) => c.id === turnState.activeActorId);
		if (isHero) {
			selectedAttackerId = turnState.activeActorId;
		} else {
			const isMonster = activeMonsters.some(
				(m) => m.id === turnState.activeActorId,
			);
			if (isMonster) {
				setTimeout(() => {
					runMonsterTurn(turnState.activeActorId);
				}, 1000);
			}
		}
	}
});

let _isHeroTurn = $derived(
	!activeCombatEncounterId ||
		characters.some((c) => c.id === turnState.activeActorId),
);
let _isVictory = $derived(
	activeCombatEncounterId
		? activeMonsters.length > 0 &&
				activeMonsters.every((m) => m.currentHitPoints <= 0)
		: false,
);
let _isDefeat = $derived(
	activeCombatEncounterId
		? characters.every((c) => {
				const hud = characterHudStates[c.id];
				return hud ? hud.hp <= 0 : false;
			})
		: false,
);

function getTrainingTarget(id: string): CombatTrainingTarget {
	if (activeCombatEncounterId) {
		const mon = activeMonsters.find((m) => m.id === id);
		if (mon) {
			return {
				id: mon.id,
				label: mon.label,
				description: mon.description,
				maxHitPoints: mon.maxHitPoints,
				currentHitPoints: mon.currentHitPoints,
				armorClass: mon.armorClass,
			};
		}
	}
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

function getTrickCost(id: string): number {
	if (id === "marca_presa") return 1;
	if (id === "uivo_encorajador") return 2;
	if (id === "mordida_astral") return 3;
	return 1;
}

function _commandCompanionAttack(comp: CompanionRecord) {
	if (!canCommandCompanion) return;

	const spentAction = turnService.spendAction({
		state: turnState,
		actorId: selectedAttackerId,
		actionCost: 1,
	});
	if (!spentAction.success) {
		errorMessage = mapCombatTurnFailure(spentAction.error);
		return;
	}
	turnState = spentAction.data;

	const char = characters.find((c) => c.id === selectedAttackerId);
	const masterMatrix = char
		? Math.max(char.physical, char.mental, char.social)
		: 1;
	const attackMod =
		masterMatrix + (char ? Math.floor((char.level - 1) / 4) + 2 : 2);
	const attackRollValue = randRoll() + attackMod;

	let damage = 0;
	for (let i = 0; i < comp.tier; i++) {
		damage += randD6();
	}
	damage += masterMatrix;

	if (attackRollValue >= selectedTarget.armorClass) {
		targetHitPoints = Math.max(0, targetHitPoints - damage);
		log = [
			...log,
			`🐾 Companheiro Animal ${comp.name} atacou ${selectedTarget.label}! Rolou d20+mod: ${attackRollValue} vs CA ${selectedTarget.armorClass} (ACERTO). Dano: ${damage} físico.`,
		];
	} else {
		log = [
			...log,
			`🐾 Companheiro Animal ${comp.name} tentou atacar ${selectedTarget.label}, mas errou! Rolou d20+mod: ${attackRollValue} vs CA ${selectedTarget.armorClass}.`,
		];
	}
}

function _castFamiliarTrick(comp: CompanionRecord) {
	if (familiarReactionUsed) return;
	const cost = getTrickCost(selectedTrickId);
	if (masterAvailableEe < cost) return;
	if (turnState.activeActorId !== selectedAttackerId || attackerIsDying) return;

	masterEeSpent += cost;
	familiarReactionUsed = true;
	_familiarFlickered = true;

	const char = characters.find((c) => c.id === selectedAttackerId);
	const mental = char ? char.mental : 1;
	const level = char ? char.level : 1;
	const cdTarget = 10 + level + mental;

	if (selectedTrickId === "marca_presa") {
		log = [
			...log,
			`✨ Familiar ${comp.name} conjurou Marca da Presa! (Custo: 1 EE). O próximo ataque contra ${selectedTarget.label} terá Vantagem. Familiar está TANGÍVEL e visível.`,
		];
	} else if (selectedTrickId === "uivo_encorajador") {
		log = [
			...log,
			`✨ Familiar ${comp.name} conjurou Uivo Encorajador! (Custo: 2 EE). Aliados ganham +3m de deslocamento. Familiar está TANGÍVEL e visível.`,
		];
	} else if (selectedTrickId === "mordida_astral") {
		const targetRoll = randRoll();
		const targetBonus = selectedTarget.saveBonus ?? 2;
		const totalSave = targetRoll + targetBonus;
		if (totalSave >= cdTarget) {
			log = [
				...log,
				`✨ Familiar ${comp.name} conjurou Mordida Astral! (Custo: 3 EE). ${selectedTarget.label} resistiu com Fortitude ${totalSave} vs CD ${cdTarget}. Familiar está TANGÍVEL e visível.`,
			];
		} else {
			log = [
				...log,
				`✨ Familiar ${comp.name} conjurou Mordida Astral! (Custo: 3 EE). ${selectedTarget.label} falhou na salvaguarda (Fortitude ${totalSave} vs CD ${cdTarget}). Seu deslocamento foi reduzido a 0 até o próximo turno! Familiar está TANGÍVEL e visível.`,
			];
		}
	}
}

function _toggleSensorySharing(comp: CompanionRecord) {
	if (onShareSensory) {
		onShareSensory(comp.id, !comp.isShareSensory);
		log = [
			...log,
			comp.isShareSensory
				? `👁️ Transe Sensorial desativado para o familiar ${comp.name}.`
				: `👁️ Transe Sensorial ativado para o familiar ${comp.name}. Sentidos partilhados!`,
		];
	}
}

function _damageCompanion(comp: CompanionRecord, amount: number) {
	if (onCompanionDamage) {
		onCompanionDamage(comp.id, amount);
		log = [
			...log,
			`💥 Companheiro ${comp.name} sofreu ${amount} de dano no simulador!`,
		];
	}
}

function _healCompanion(comp: CompanionRecord, amount: number) {
	if (onCompanionDamage) {
		onCompanionDamage(comp.id, -amount);
		log = [
			...log,
			`💖 Companheiro ${comp.name} foi curado em ${amount} PV no simulador!`,
		];
	}
}

function _enableStealthMode(): void {
	_isStealthMode = true;
	const clock = stealthService.initTensionClock(heatLevel);
	turnState = {
		...turnState,
		tensionClockSegmentsFilled: clock.filledSegments,
		tensionClockSegmentsMax: clock.maxSegments,
		isAlarmTriggered: clock.alarmTriggered,
		isAmbush: true,
	};
	log = [
		...log,
		`🕵️‍♂️ Infiltração tática iniciada sob nível de Heat ${heatLevel}. Relógio de Tensão ativo.`,
	];
}

function _disableStealthMode(): void {
	_isStealthMode = false;
	turnState = {
		...turnState,
		isAmbush: false,
		isAlarmTriggered: false,
	};
	log = [
		...log,
		`❌ Infiltração cancelada. Retornando ao estado de alerta normal.`,
	];
}

function _handleClimbPoleiro(): void {
	const char = characters.find((c) => c.id === selectedAttackerId);
	const physical = char ? char.physical : 1;
	const roll = randRoll();
	const dc = 15;
	const res = stealthService.resolvePoleiroClimb({
		rollValue: roll,
		modifier: physical,
		dc,
	});
	if (res.success) {
		_isInPoleiro = true;
		_isHanging = res.isHanging;
		log = [
			...log,
			`🪜 Teste de Atletismo/Furtividade: Rolou ${roll} + ${physical} vs CD ${dc} (SUCESSO). ${res.isHanging ? "Ficou pendurado!" : "Subiu no poleiro com perfeição!"}`,
		];
	} else {
		_isInPoleiro = false;
		_isHanging = false;
		const nextClock = stealthService.addTensionSegments(
			{
				filledSegments: turnState.tensionClockSegmentsFilled || 0,
				maxSegments: turnState.tensionClockSegmentsMax || 10,
				alarmTriggered: turnState.isAlarmTriggered || false,
			},
			res.segmentsAdded,
		);
		turnState = {
			...turnState,
			tensionClockSegmentsFilled: nextClock.filledSegments,
			isAlarmTriggered: nextClock.alarmTriggered,
		};
		log = [
			...log,
			`💥 Teste de Atletismo/Furtividade: Rolou ${roll} + ${physical} vs CD ${dc} (FALHA TOTAL). Você caiu do poleiro e fez barulho (+${res.segmentsAdded} Tensão).`,
		];
	}
}

function _handleGuardVisionCheck(): void {
	const char = characters.find((c) => c.id === selectedAttackerId);
	const stealthMod = char ? char.physical + (char.level > 1 ? 2 : 0) : 2;
	const roll = randRoll();
	const passivePerception = selectedTarget.perceptionBonus
		? 10 + selectedTarget.perceptionBonus
		: 12;

	const res = stealthService.checkGuardVision({
		position: guardPosition as any,
		stealthRoll: roll,
		stealthModifier: stealthMod,
		guardPassivePerception: passivePerception,
		useShadows,
	});

	if (!res.success) {
		errorMessage = "Erro ao resolver a visão do guarda.";
		return;
	}

	const checkData = res.data;
	if (checkData.detected) {
		const nextClock = stealthService.addTensionSegments(
			{
				filledSegments: turnState.tensionClockSegmentsFilled || 0,
				maxSegments: turnState.tensionClockSegmentsMax || 10,
				alarmTriggered: turnState.isAlarmTriggered || false,
			},
			checkData.tensionSegmentsAdded,
		);
		turnState = {
			...turnState,
			tensionClockSegmentsFilled: nextClock.filledSegments,
			isAlarmTriggered: nextClock.alarmTriggered,
		};
		log = [
			...log,
			`🚨 DETECTADO! Guarda observou sua aproximação (${guardPosition}). Teste: ${roll} + ${stealthMod} vs Percepção Passiva ${passivePerception}. (+${checkData.tensionSegmentsAdded} Tensão)`,
		];
	} else {
		log = [
			...log,
			`👥 Sucesso. Você se manteve oculto (${guardPosition}). Teste: ${roll} + ${stealthMod} vs Percepção Passiva ${passivePerception}.`,
		];
	}
}

function _handleStealthySlide(): void {
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;
	log = [
		...log,
		`💨 Deslizamento Furtivo executado por ${char.name}. Evitou a visão direta do guarda (Custo: -1 PV).`,
	];
}

function _handleTakedown(): void {
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;

	const physical = char.physical;
	const roll = randRoll();
	const level = char.level;

	const res = stealthService.resolveTakedown({
		type: selectedTakedownType as any,
		rollValue: roll,
		modifier: physical,
		targetLevel: selectedTarget.level || 1,
		casterLevel: level,
		isElite:
			selectedTarget.label.includes("Elite") ||
			selectedTarget.label.includes("Chefe"),
		targetHp: targetHitPoints,
		targetMaxHp: selectedTarget.currentHitPoints,
	});

	if (!res.success) {
		errorMessage =
			res.error.code === "STEALTH_ACTION_FAILED"
				? "Seu nível é menor que o do alvo, impossibilitando a Execução Tática."
				: "Ação de Abate inválida.";
		return;
	}

	const td = res.data;
	targetHitPoints = td.targetNewHp;

	if (td.tensionSegmentsAdded > 0) {
		const nextClock = stealthService.addTensionSegments(
			{
				filledSegments: turnState.tensionClockSegmentsFilled || 0,
				maxSegments: turnState.tensionClockSegmentsMax || 10,
				alarmTriggered: turnState.isAlarmTriggered || false,
			},
			td.tensionSegmentsAdded,
		);
		turnState = {
			...turnState,
			tensionClockSegmentsFilled: nextClock.filledSegments,
			isAlarmTriggered: nextClock.alarmTriggered,
		};
	}

	if (td.success) {
		log = [
			...log,
			`🗡️ Abate Furtivo (${selectedTakedownType}) SUCESSO! Rolou ${roll} + ${physical}. Alvo ${selectedTarget.label} reduzido a ${td.targetNewHp} HP. Tensão adicionada: ${td.tensionSegmentsAdded}.`,
		];
		if (td.applyBleeding) {
			log = [...log, `🩸 Alvo Elite está SANGRAMENTO!`];
		}
	} else {
		log = [
			...log,
			`⚠️ Abate Furtivo FALHOU! O ataque fez barulho e iniciou o combate convencional. Alvo ${selectedTarget.label} ficou com ${td.targetNewHp} HP. (+${td.tensionSegmentsAdded} Tensão)`,
		];
	}
	errorMessage = null;
}

function _handleEvidenceCleanup(): void {
	const char = characters.find((c) => c.id === selectedAttackerId);
	const physical = char ? char.physical : 1;
	const roll = randRoll();
	const dc = 15;

	const res = stealthService.resolveEvidenceCleanup({
		rollValue: roll,
		modifier: physical,
		dc,
	});

	const nextClock = stealthService.addTensionSegments(
		{
			filledSegments: turnState.tensionClockSegmentsFilled || 0,
			maxSegments: turnState.tensionClockSegmentsMax || 10,
			alarmTriggered: turnState.isAlarmTriggered || false,
		},
		res.segmentsAdded,
	);
	turnState = {
		...turnState,
		tensionClockSegmentsFilled: nextClock.filledSegments,
		isAlarmTriggered: nextClock.alarmTriggered,
	};

	if (res.success) {
		log = [
			...log,
			`🧹 Ocultar Rastro: Sucesso total (${roll} + ${physical} vs CD ${dc}). Limpou vestígios sem gerar ruído.`,
		];
	} else {
		log = [
			...log,
			`⚠️ Ocultar Rastro: Falha na limpeza (${roll} + ${physical} vs CD ${dc}). Apressar-se gerou suspeita (+${res.segmentsAdded} Tensão).`,
		];
	}
}
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

	<div class="mt-6 grid gap-4 md:grid-cols-2">
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
			<span class="text-sm font-semibold text-ether">
				{#if activeCombatEncounterId}Alvo do Combate{:else}Alvo de treino{/if}
			</span>
			<select
				bind:value={selectedTargetId}
				onchange={selectTarget}
				data-testid="combat-target-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			>
				{#if activeCombatEncounterId}
					{#each activeMonsters as target}
						<option value={target.id}>{target.label} (HP: {target.currentHitPoints}/{target.maxHitPoints})</option>
					{/each}
				{:else}
					{#each trainingTargets as target}
						<option value={target.id}>{target.label}</option>
					{/each}
				{/if}
			</select>
		</label>
	</div>

	<!-- Controles Gerais de Furtividade / Infiltração (Fase 46) -->
	<div class="mt-6 border border-bronze bg-blood-shadow p-5 rounded-md shadow-lg" data-testid="combat-stealth-panel">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-bronze/20 pb-3">
			<div>
				<h3 class="text-lg font-semibold text-ether flex items-center gap-2">
					🕵️‍♂️ Códice de Espionagem & Furtividade Tática
				</h3>
				<p class="text-xs text-bone/70 mt-1">
					Infiltre-se nas sombras, evite cones de visão e execute abates silenciosos.
				</p>
			</div>
			<div class="flex items-center gap-3">
				{#if !_isStealthMode}
					<button
						type="button"
						onclick={enableStealthMode}
						class="text-xs border border-bronze bg-void px-3 py-1.5 text-bone hover:border-ether transition-colors font-bold uppercase tracking-wider"
					>
						🕵️ Iniciar Infiltração
					</button>
				{:else}
					<button
						type="button"
						onclick={disableStealthMode}
						class="text-xs border border-[#ef4444] bg-blood-shadow px-3 py-1.5 text-bone hover:bg-blood/25 transition-colors font-bold uppercase tracking-wider"
					>
						❌ Cancelar Furtividade
					</button>
				{/if}
			</div>
		</div>

		{#if _isStealthMode}
			<div class="mt-4 grid gap-4 md:grid-cols-3">
				<!-- Relógio de Tensão e Vigilância -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm flex flex-col justify-between">
					<div>
						<p class="text-xs font-bold text-ether uppercase tracking-wider">⏱️ Relógio de Tensão</p>
						<p class="text-[10px] text-bone/60 mt-0.5">Teto baseado no Heat de Vigilância local.</p>

						<div class="mt-3 flex items-center justify-between">
							<span class="text-xs text-bone/70">Nível de Heat (0 a 3):</span>
							<select
								bind:value={heatLevel}
								onchange={enableStealthMode}
								class="text-xs border border-bronze bg-blood-shadow px-1.5 py-0.5 text-bone outline-none"
							>
								<option value={0}>Heat 0 (12 Segs)</option>
								<option value={1}>Heat 1 (10 Segs)</option>
								<option value={2}>Heat 2 (8 Segs)</option>
								<option value={3}>Heat 3 (6 Segs)</option>
							</select>
						</div>

						<div class="mt-4 bg-void/50 border border-bronze/20 p-2.5 rounded text-center">
							<p class="text-xs text-bone/70 uppercase tracking-widest font-bold">Relógio de Tensão</p>
							<p class="text-xl font-black mt-1 {turnState.isAlarmTriggered ? 'text-blood animate-pulse' : 'text-[#f59e0b]'}">
								{turnState.tensionClockSegmentsFilled ?? 0} / {turnState.tensionClockSegmentsMax ?? 10} Fatias
							</p>
							{#if turnState.isAlarmTriggered}
								<div class="mt-2 text-[9px] bg-blood-shadow border border-[#ef4444] text-[#ef4444] font-black uppercase py-0.5 rounded animate-pulse">
									🚨 ALARME GERAL DISPARADO! 🚨
								</div>
							{/if}
						</div>
					</div>
					
					<button
						type="button"
						onclick={() => {
							const res = turnService.increaseTensionClock(turnState, 1, selectedAttackerId);
							if (res.success) turnState = res.data;
						}}
						class="mt-3 w-full border border-bronze/60 bg-void py-1 text-xs text-bone/80 hover:border-ether"
					>
						+1 Segmento de Tensão (Ruído)
					</button>
				</div>

				<!-- Campo de Visão e Poleiro -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm">
					<p class="text-xs font-bold text-ether uppercase tracking-wider">👀 Cones de Visão & Encaramento</p>
					<p class="text-[10px] text-bone/60 mt-0.5">Visão do Guarda vs Cobertura.</p>

					<label class="block mt-3">
						<span class="text-[11px] font-semibold text-ether">Posicionamento em Relação ao Guarda</span>
						<select
							bind:value={guardPosition}
							disabled={isInPoleiro}
							class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1 text-bone outline-none focus:border-ether disabled:opacity-50"
						>
							<option value="blind_spot">Ponto Cego (Costas - Auto Sucesso)</option>
							<option value="flank">Flanco (Periférica - Teste Furtividade)</option>
							<option value="frontal_cone">Cone Frontal (Direta - Alerta!)</option>
						</select>
					</label>

					<div class="mt-2.5 flex items-center justify-between text-xs">
						<span class="text-bone/70">Sombras Profundas (Cobertura)</span>
						<input type="checkbox" bind:checked={useShadows} class="accent-ether" />
					</div>

					<div class="mt-2.5 flex items-center justify-between text-xs border-t border-bronze/10 pt-2">
						<span class="text-bone/70 font-semibold {isInPoleiro ? 'text-ether' : 'text-bone/50'}">
							Status: {isInPoleiro ? (isHanging ? '🪜 Pendurado no Poleiro' : '🦉 No Poleiro (Predador Vertical)') : '🚶 No Chão'}
						</span>
						<button
							type="button"
							onclick={handleClimbPoleiro}
							class="text-[10px] border border-bronze bg-void px-2 py-0.5 text-bone hover:border-ether"
						>
							🪜 Subir Poleiro
						</button>
					</div>

					<div class="mt-3.5 grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={handleGuardVisionCheck}
							class="border border-bronze bg-void py-1.5 text-xs text-bone hover:border-ether"
						>
							🎲 Testar Visão
						</button>
						<button
							type="button"
							onclick={handleStealthySlide}
							class="border border-bronze bg-void py-1.5 text-xs text-bone hover:border-ether"
						>
							💨 Deslizar (-1 PV)
						</button>
					</div>
				</div>

				<!-- Abates Furtivos e Evidências -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm flex flex-col justify-between">
					<div>
						<p class="text-xs font-bold text-ether uppercase tracking-wider">🗡️ Abates Silenciosos (Takedown)</p>
						<p class="text-[10px] text-bone/60 mt-0.5">Abater guardas isolados antes do combate.</p>

						<label class="block mt-2">
							<span class="text-[11px] font-semibold text-ether">Tática de Abate</span>
							<select
								bind:value={selectedTakedownType}
								class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1 text-bone outline-none"
							>
								<option value="strike">Golpe Ligeiro (Dano Crítico Dobrado)</option>
								<option value="submission">Submissão (Físico vs Defesa)</option>
								<option value="tactical_execution">Execução Tática (Auto / Custa 2 PV)</option>
							</select>
						</label>
					</div>

					<div class="mt-4 grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={handleTakedown}
							class="border border-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/25 py-2 text-xs font-bold text-[#ef4444] transition-colors"
						>
							🗡️ Executar Abate
						</button>
						<button
							type="button"
							onclick={handleEvidenceCleanup}
							class="border border-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/25 py-2 text-xs font-bold text-[#38bdf8] transition-colors"
						>
							🧹 Ocultar Rastro
						</button>
					</div>
				</div>
			</div>

			<!-- Status das Regras de Emboscada ativa -->
			<div class="mt-3 bg-[#1e293b]/50 border border-bronze/20 p-2.5 rounded-sm flex items-center justify-between text-xs">
				<div class="flex items-center gap-2">
					<span class="text-ether font-bold">Emboscada Ativa:</span>
					{#if turnState.isAmbush}
						<span class="font-semibold text-bone">⚡ Golpe de Abertura (1 Ação Livre) + Inimigos DESPREVENIDOS!</span>
						{#if turnState.surprisedActorIds && turnState.surprisedActorIds.length > 0}
							<span class="text-[10px] bg-blood-shadow border border-blood/40 text-blood px-1.5 py-0.5 rounded-sm ml-2">
								Desprevenidos: {turnState.surprisedActorIds.join(", ")}
							</span>
						{/if}
					{:else}
						<span class="text-bone/50">Rodada de Emboscada encerrada. Início do combate padrão.</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Painel de Sinergia de Combate e Coesão Compartilhada -->
	{#if cohesionState}
		<div class="mt-6 border border-[#38bdf8]/40 bg-[#0f172a]/90 p-5 rounded-md shadow-lg" data-testid="combat-synergy-panel">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#38bdf8]/20 pb-3">
				<div>
					<h3 class="text-lg font-semibold text-[#38bdf8] flex items-center gap-2">
						🌌 Sinergia de Combate (Forja Tática)
					</h3>
					<p class="text-xs text-bone/70 mt-1">
						Teça elos cooperativos consumindo a Coesão compartilhada do grupo.
					</p>
				</div>
				<div class="flex items-center gap-3">
					<div class="bg-[#1e293b] border border-[#38bdf8]/30 px-3.5 py-1.5 rounded-sm">
						<span class="text-xs font-semibold text-[#38bdf8]">Coesão Tier {cohesionState.cohesionLevel}</span>
						<span class="text-sm font-bold text-bone ml-2">{cohesionState.cohesionPoints} / {cohesionState.cohesionLevel + cohesionState.activePlayers} PE</span>
					</div>
					<button
						type="button"
						onclick={handleRecoverCohesion}
						class="text-xs border border-bronze bg-ruin px-2.5 py-1.5 text-bone hover:border-ether transition-colors"
					>
						💤 Recuperar (Descanso)
					</button>
				</div>
			</div>

			<div class="mt-4 grid gap-4 md:grid-cols-3">
				<!-- Passo 1: Abertura de Elo -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm">
					<p class="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">1. Abrir Elo (Abertura)</p>
					<p class="text-xs text-bone/80 mt-1">Custa 1 ponto de Coesão. Marca o alvo com um Eixo.</p>
					
					<label class="block mt-3">
						<span class="text-[11px] font-semibold text-ether">Selecionar Tática de Abertura</span>
						<select
							bind:value={openingTact}
							class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1.5 text-bone outline-none focus:border-ether"
						>
							{#each availableTactics as tact}
								<option value={tact.id}>{tact.label}</option>
							{/each}
						</select>
					</label>

					<button
						type="button"
						disabled={cohesionState.cohesionPoints < 1 || activeElo !== null}
						onclick={handleOpenElo}
						class="mt-3.5 w-full border border-[#38bdf8] bg-[#38bdf8]/15 py-1.5 text-xs font-semibold text-[#38bdf8] transition-colors hover:bg-[#38bdf8]/35 disabled:opacity-40 disabled:hover:bg-[#38bdf8]/15"
					>
						Vincular Elo 🔗
					</button>
				</div>

				<!-- Passo 2: Sinergia em Cadeia (Reforço) -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm">
					<p class="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">2. Reforçar Elo (Cadeia)</p>
					<p class="text-xs text-bone/80 mt-1">Disponível no Tier 2+. Custa 1 ponto de Coesão adicional.</p>
					
					{#if cohesionState.cohesionLevel < 2}
						<div class="mt-4 border border-[#ef4444]/30 bg-[#1e1212] p-2 text-center rounded-sm">
							<p class="text-[10px] font-bold text-[#ef4444]">🚫 BLOQUEADO: Exige Coesão Tier 2</p>
						</div>
					{:else}
						<label class="block mt-2.5">
							<span class="text-[11px] font-semibold text-ether">Herói Auxiliar</span>
							<select
								bind:value={selectedReinforcerId}
								class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1.5 text-bone outline-none focus:border-ether"
							>
								<option value="">Selecione outro herói...</option>
								{#each characters as char}
									{#if activeElo && char.id !== activeElo.abridorId}
										<option value={char.id}>{char.name}</option>
									{/if}
								{/each}
							</select>
						</label>

						<label class="block mt-2">
							<span class="text-[11px] font-semibold text-ether">Tática de Reforço</span>
							<select
								bind:value={reinforceTact}
								class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1.5 text-bone outline-none focus:border-ether"
							>
								{#each availableTactics as tact}
									<option value={tact.id}>{tact.label}</option>
								{/each}
							</select>
						</label>

						<button
							type="button"
							disabled={!activeElo || activeElo.reinforceTactId !== undefined || cohesionState.cohesionPoints < 1}
							onclick={handleReinforceElo}
							class="mt-3 w-full border border-[#dab973] bg-[#dab973]/15 py-1.5 text-xs font-semibold text-[#dab973] transition-colors hover:bg-[#dab973]/35 disabled:opacity-40"
						>
							Adicionar Reforço ⚡
						</button>
					{/if}
				</div>

				<!-- Passo 3: Detonação e Técnicas -->
				<div class="border border-bronze/30 bg-[#1e293b]/40 p-3.5 rounded-sm flex flex-col justify-between">
					<div>
						<p class="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">3. Detonar Elo (Forja)</p>
						<p class="text-xs text-bone/80 mt-1">Atacante active detona os efeitos combinados no alvo.</p>

						<label class="block mt-3">
							<span class="text-[11px] font-semibold text-ether">Tática de Detonação</span>
							<select
								bind:value={detonationTact}
								class="mt-1 w-full text-xs border border-bronze bg-blood-shadow px-2 py-1.5 text-bone outline-none focus:border-ether"
							>
								{#each availableTactics as tact}
									<option value={tact.id}>{tact.label}</option>
								{/each}
							</select>
						</label>
					</div>

					<button
						type="button"
						disabled={!activeElo}
						onclick={handleDetonateElo}
						class="mt-4 w-full border border-[#ef4444] bg-[#ef4444]/15 py-2 text-xs font-bold text-[#ef4444] transition-colors hover:bg-[#ef4444]/35 disabled:opacity-40"
					>
						💥 Detonar Fusão de Sinergia
					</button>
				</div>
			</div>

			<!-- Status do Elo Ativo -->
			<div class="mt-4 bg-[#1e293b]/50 border border-bronze/20 p-3 rounded-sm flex items-center justify-between text-xs">
				<div class="flex items-center gap-2">
					<span class="text-[#38bdf8]">Status do Elo:</span>
					{#if activeElo}
						<span class="font-bold text-bone">🔗 ELO ATIVO (Abridor: {getCombatAttacker(activeElo.abridorId).name} ➔ Alvo: {getTrainingTarget(activeElo.targetId).label})</span>
						<span class="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] px-1.5 py-0.5 border border-[#38bdf8]/40 rounded-sm ml-2">
							Tática 1: {activeElo.openingTactId}
						</span>
						{#if activeElo.reinforceTactId}
							<span class="text-[10px] bg-[#dab973]/20 text-[#dab973] px-1.5 py-0.5 border border-[#dab973]/40 rounded-sm ml-2">
								Tática 2: {activeElo.reinforceTactId} ({getCombatAttacker(activeElo.reinforcerId || '').name})
							</span>
						{/if}
					{:else}
						<span class="text-bone/50">Nenhum Elo de sinergia ativo no momento.</span>
					{/if}
				</div>
				{#if activeElo}
					<button
						type="button"
						onclick={() => activeElo = null}
						class="text-[10px] text-[#ef4444] hover:underline"
					>
						Cancelar Elo
					</button>
				{/if}
			</div>

			<!-- Técnicas de Assinatura Desbloqueadas -->
			{#if registeredSignaturesList.length > 0}
				<div class="mt-4 border-t border-[#38bdf8]/20 pt-3">
					<p class="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
						🔮 Técnicas de Assinatura Registradas na Campanha:
					</p>
					<div class="mt-2 grid gap-2 sm:grid-cols-2">
						{#each registeredSignaturesList as sig}
							<div class="border border-bronze/20 bg-void p-2 rounded-sm text-xs flex justify-between items-center">
								<div>
									<span class="font-bold text-bone">{sig.name}</span>
									<p class="text-[10px] text-bone/60 mt-0.5">
										Fusão: {sig.openingTactId} ➔ {sig.reinforceTactId ? sig.reinforceTactId + ' ➔ ' : ''}{sig.detonationTactId}
									</p>
								</div>
								<span class="text-[10px] bg-[#dab973]/20 text-[#dab973] px-1.5 py-0.5 border border-[#dab973]/40 rounded-sm">
									Usos: {sig.usageCount}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Atacante</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.attackerLabel}</h3>

			<!-- Barra de HP do Aventureiro (Fase 40) -->
			{#if selectedAttackerId !== attacker.id}
				{@const char = characters.find(c => c.id === selectedAttackerId)}
				{#if char}
					{@const realClass = characterClasses.find(c => c.id === char.classId)}
					{@const maxHp = ((realClass ? realClass.baseHp : 10) + char.physical + char.resistance) * char.level}
					
					<div class="mt-3 bg-void/50 border border-bronze/20 p-3 rounded flex flex-col gap-2">
						<div class="flex justify-between items-center text-xs">
							<span class="text-bone/70 uppercase tracking-wider font-semibold">Integridade Física (HP)</span>
							<span class="font-mono font-bold {attackerHp === 0 ? 'text-blood animate-pulse' : 'text-bone'}">
								{attackerHp} / {maxHp} HP
							</span>
						</div>
						<div class="w-full bg-void rounded-full h-2.5 overflow-hidden border border-bronze/30">
							<div class="bg-blood h-full transition-all duration-300" style="width: {(attackerHp / maxHp) * 100}%"></div>
						</div>

						<!-- Tokens de Morte se estiver caído a 0 HP -->
						{#if attackerHp === 0}
							<div class="mt-2 flex flex-col gap-1.5 p-2 bg-blood-shadow/20 border border-blood/20 rounded">
								<div class="flex justify-between items-center text-[10px]">
									<span class="text-blood font-bold uppercase tracking-widest animate-pulse">⚠️ Estado Moribundo ⚠️</span>
									<span class="text-bone/60">Turno de Morte Ativo</span>
								</div>
								
								<div class="flex gap-4 text-xs mt-1">
									<div class="flex items-center gap-1.5">
										<span class="text-ether font-bold">🩹 Sucessos:</span>
										<div class="flex gap-1">
											{#each Array(3) as _, i}
												<span class="text-base {i < attackerDeathSuccesses ? 'text-[#38bdf8]' : 'text-bone/20'}">💙</span>
											{/each}
										</div>
									</div>
									<div class="flex items-center gap-1.5">
										<span class="text-blood font-bold">☠️ Falhas:</span>
										<div class="flex gap-1">
											{#each Array(3) as _, i}
												<span class="text-base {i < attackerDeathFailures ? 'text-[#ef4444]' : 'text-bone/20'}">💀</span>
											{/each}
										</div>
									</div>
								</div>

								{#if attackerIsDying}
									<button
										type="button"
										onclick={runAutomaticDeathSave}
										class="mt-2 bg-blood hover:bg-blood-shadow text-bone font-bold text-[10px] py-1 rounded transition-colors uppercase tracking-wider"
									>
										🎲 Rolar Teste de Morte Manual
									</button>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Medidor de Tensão e Limit Break (Fase 39/70) -->
					{#if attackerHp > 0}
						<div class="mt-3 bg-void/50 border border-bronze/20 p-3 rounded flex flex-col gap-2">
							<div class="flex justify-between items-center text-xs">
								<span class="text-bone/70 uppercase tracking-wider font-semibold">Medidor de Tensão</span>
								<span class="font-mono font-bold text-[#f59e0b]">
									{attackerTension} / 100 Tensão
								</span>
							</div>
							<div class="w-full bg-void rounded-full h-2.5 overflow-hidden border border-bronze/30 relative">
								<div class="bg-[#f59e0b] h-full transition-all duration-300 {attackerTension === 100 ? 'animate-pulse bg-[#dab973] shadow-[0_0_10px_#f59e0b]' : ''}" style="width: {attackerTension}%"></div>
							</div>

							{#if attackerTension === 100}
								<button
									type="button"
									onclick={activateLimitBreak}
									class="mt-2 bg-[#ef4444] border border-[#f59e0b] hover:bg-[#f59e0b] text-bone font-black text-xs py-1.5 rounded transition-all uppercase tracking-widest shadow-[0_0_15px_#f59e0b] animate-bounce"
								>
									⚡ LIMIT BREAK DISPONÍVEL! ⚡
								</button>
							{/if}
						</div>
					{/if}

					<!-- Painel de Simulação de Crises de Combate -->
					<div class="mt-3 p-3 bg-ruin/50 border border-bronze/20 rounded flex flex-col gap-2">
						<p class="text-[10px] uppercase font-bold text-ether tracking-widest">Laboratório de Crise (Simulador)</p>
						<div class="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider">
							<button
								type="button"
								onclick={() => damageHero(2)}
								disabled={attackerHp === 0}
								class="py-1 px-1.5 bg-blood-shadow/20 border border-blood/20 text-blood hover:bg-blood-shadow/40 transition-colors disabled:opacity-50"
							>
								💥 Dano Leve (-2)
							</button>
							<button
								type="button"
								onclick={() => damageHero(5)}
								disabled={attackerHp === 0}
								class="py-1 px-1.5 bg-blood-shadow/30 border border-blood/30 text-blood hover:bg-blood-shadow/60 transition-colors disabled:opacity-50"
							>
								🚨 Dano Massivo (-5)
							</button>
							<button
								type="button"
								onclick={() => healHero(5)}
								class="py-1 px-1.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/25 transition-colors"
							>
								💖 Curar (+5 HP)
							</button>
							<button
								type="button"
								onclick={() => addTension(30)}
								disabled={attackerHp === 0}
								class="py-1 px-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/25 transition-colors disabled:opacity-50"
							>
								⚡ Precisão Letal (+30)
							</button>
							<button
								type="button"
								onclick={() => addTension(40)}
								disabled={attackerHp === 0}
								class="py-1 px-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/25 transition-colors disabled:opacity-50 col-span-2 text-center"
							>
								👥 Aliado Caído (+40)
							</button>
						</div>
						{#if attackerHp === 0 && attackerIsDying}
							<button
								type="button"
								onclick={helpHero}
								class="w-full mt-1 py-1.5 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/25 transition-colors text-[9px] font-bold uppercase tracking-wider"
							>
								🩹 Ajudar Companheiro (Primeiros Socorros)
							</button>
						{/if}
					</div>

					<!-- Seção de Companheiros e Familiares (Fase 42 & 45) -->
					{#if activeCompanionStats.length > 0}
						<div class="mt-4 border-t border-bronze/40 pt-4" data-testid="combat-companions-block">
							<h4 class="text-xs font-bold text-ether uppercase tracking-wider mb-3">
								🐾 Companheiros & Familiares Vinculados
							</h4>
							
							{#each activeCompanionStats as comp}
								{@const isFamiliar = comp.record.type === "familiar"}
								{@const isAnimal = !isFamiliar}
								<div class="bg-void/40 border border-bronze/30 p-3 rounded mb-3 flex flex-col gap-2">
									<div class="flex justify-between items-center">
										<div>
											<span class="font-bold text-bone">{comp.record.name}</span>
											<span class="text-[10px] text-bone/60 ml-2">
												({comp.record.subModel} · {comp.record.type === 'aggressor' ? 'Agressor' : comp.record.type === 'protector' ? 'Protetor' : comp.record.type === 'scout' ? 'Batedor' : 'Familiar'})
											</span>
										</div>
										<div class="flex items-center gap-1.5">
											{#if isFamiliar}
												{#if familiarFlickered}
													<span class="text-[9px] bg-blood-shadow border border-blood text-blood px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
														Tangível (Cintilando)
													</span>
												{:else}
													<span class="text-[9px] bg-[#1e293b] border border-[#38bdf8]/30 text-[#38bdf8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
														Intangível
													</span>
												{/if}
											{/if}
											<span class="text-[10px] bg-bronze/20 text-[#dab973] px-1.5 py-0.5 rounded font-mono">
												CA: {comp.armorClass}
											</span>
										</div>
									</div>

									<!-- HP do Companheiro -->
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between items-center text-[10px]">
											<span class="text-bone/70 uppercase">Pontos de Vida</span>
											<span class="font-mono font-bold {comp.record.hpCurrent === 0 ? 'text-blood' : 'text-bone'}">
												{comp.record.hpCurrent} / {comp.hpMax} PV
											</span>
										</div>
										<div class="w-full bg-void rounded-full h-1.5 overflow-hidden border border-bronze/20">
											<div class="bg-blood h-full transition-all duration-300" style="width: {(comp.record.hpCurrent / comp.hpMax) * 100}%"></div>
										</div>
									</div>

									<!-- Ações do Companheiro Animal -->
									{#if isAnimal && comp.record.hpCurrent > 0}
										<div class="mt-1 flex gap-2">
											<button
												type="button"
												disabled={!canCommandCompanion}
												onclick={() => commandCompanionAttack(comp.record)}
												class="flex-1 bg-ether hover:bg-bone text-void text-xs font-bold py-1.5 px-2 rounded transition-colors uppercase tracking-wider disabled:opacity-50"
											>
												⚔️ Comandar Ataque [A]
											</button>
										</div>
									{/if}

									<!-- Ações do Familiar Místico -->
									{#if isFamiliar && comp.record.hpCurrent > 0}
										<div class="mt-1 flex flex-col gap-2">
											<div class="flex justify-between items-center">
												<span class="text-[10px] font-semibold text-ether">Reação do Familiar:</span>
												<span class="text-[10px] font-bold {familiarReactionUsed ? 'text-blood' : 'text-[#10b981]'}">
													{familiarReactionUsed ? '🚫 Exaurida' : '✅ Disponível'}
												</span>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-[10px] font-semibold text-ether">Energia do Mestre:</span>
												<span class="text-[10px] font-mono font-bold text-bone">
													{masterAvailableEe} / {masterMaxEe} EE
												</span>
											</div>
											
											<div class="grid grid-cols-1 gap-2 mt-1">
												<label class="block">
													<span class="text-[9px] uppercase font-bold text-bone/60">Selecionar Truque:</span>
													<select
														bind:value={selectedTrickId}
														class="w-full text-xs border border-bronze bg-blood-shadow px-2 py-1 text-bone outline-none focus:border-ether mt-1"
													>
														<option value="marca_presa">Marca da Presa (1 EE - Vantagem no ataque)</option>
														<option value="uivo_encorajador">Uivo Encorajador (2 EE - Deslocamento +3m)</option>
														<option value="mordida_astral">Mordida Astral (3 EE - Fortitude ou Imobilizado)</option>
													</select>
												</label>
												<button
													type="button"
													disabled={familiarReactionUsed || masterAvailableEe < getTrickCost(selectedTrickId) || turnState.activeActorId !== selectedAttackerId || attackerIsDying}
													onclick={() => castFamiliarTrick(comp.record)}
													class="bg-[#38bdf8] hover:bg-[#38bdf8]/80 text-void text-xs font-bold py-1.5 px-2 rounded transition-colors uppercase tracking-wider disabled:opacity-50"
												>
													✨ Conjurar Truque [R]
												</button>
											</div>

											<!-- Transe Sensorial -->
											<div class="mt-1 pt-1.5 border-t border-bronze/20 flex justify-between items-center">
												<span class="text-[10px] text-bone/80">Transe Sensorial (Sentidos Partilhados):</span>
												<button
													type="button"
													onclick={() => toggleSensorySharing(comp.record)}
													class="text-[9px] border px-2 py-1 font-bold uppercase tracking-wider rounded transition-colors {comp.record.isShareSensory ? 'bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444]' : 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8]'}"
												>
													{comp.record.isShareSensory ? 'Desativar' : 'Ativar'}
												</button>
											</div>
										</div>
									{/if}

									<!-- Simulador de Danos do Companheiro (Crisis Simulator) -->
									<div class="mt-2 pt-2 border-t border-bronze/20 flex flex-col gap-1.5">
										<p class="text-[9px] font-bold text-bone/60 uppercase">Simulador de Dano no Companheiro</p>
										<div class="flex gap-2">
											<button
												type="button"
												disabled={comp.record.hpCurrent === 0 || (isFamiliar && !familiarFlickered)}
												onclick={() => damageCompanion(comp.record, 5)}
												class="flex-1 text-[9px] font-bold py-1 px-1.5 bg-blood-shadow/30 border border-blood/30 text-blood hover:bg-blood-shadow/60 transition-colors disabled:opacity-30"
											>
												💥 Sofrer Dano (-5)
											</button>
											<button
												type="button"
												disabled={comp.record.hpCurrent === comp.hpMax}
												onclick={() => healCompanion(comp.record, 5)}
												class="flex-1 text-[9px] font-bold py-1 px-1.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/25 transition-colors"
											>
												💖 Curar (+5)
											</button>
										</div>
										{#if isFamiliar && !familiarFlickered && comp.record.hpCurrent > 0}
											<p class="text-[8px] text-[#dab973] font-semibold">
												⚠️ Familiar intangível não pode sofrer dano. Use um truque primeiro.
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			{/if}
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
						<dt class="text-ether">Defesa (CA)</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-armor-class"
						>
							{attackerStatsView.armorClassLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Velocidade</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-speed"
						>
							{attackerStatsView.movementSpeedLabel}
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
				{#if attackerStatsView.activeEffectsLabels && attackerStatsView.activeEffectsLabels.length > 0}
					<div class="mt-3 border border-[#ef4444]/30 bg-[#1e1212] p-2.5 rounded-sm">
						<p class="text-xs font-semibold text-[#ef4444] uppercase tracking-wider flex items-center gap-1.5">
							🤢 Aflições Ativas do Códex:
						</p>
						<div class="mt-1.5 flex flex-col gap-1">
							{#each attackerStatsView.activeEffectsLabels as effect}
								<span class="text-xs font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1.5" style="color: {effect.color}; background-color: {effect.color}15; border: 1px solid {effect.color}40;">
									{effect.label}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<!-- Talentos Táticos de Classe -->
			{#if attackerChar && (attackerChar.classId === "vanguard" || attackerChar.classId === "weaver")}
				<div class="mt-4 border-t border-bronze pt-4" data-testid="combat-class-talents">
					<p class="text-sm font-semibold text-ether">Talentos Táticos de Classe</p>
					{#if attackerChar.classId === "vanguard"}
						<div class="mt-3 bg-void/40 border border-bronze/30 p-3 rounded flex flex-col gap-2">
							<div class="flex justify-between items-center text-xs">
								<span class="text-bone/70 uppercase font-semibold">Vigor do Personagem:</span>
								<span class="font-mono font-bold text-bone">
									{masterAvailablePv} / {masterMaxPv} PV
								</span>
							</div>
							<button
								type="button"
								onclick={activateExtraBreath}
								disabled={masterAvailablePv < 2 || activeEffects.some(e => e.characterId === selectedAttackerId && e.type === 'extra_breath') || turnState.activeActorId !== selectedAttackerId || attackerIsDying}
								class="bg-ether hover:bg-bone text-void text-xs font-bold py-1.5 px-2 rounded transition-colors uppercase tracking-wider disabled:opacity-50"
							>
								🛡️ Ativar Fôlego Extra (Custa 2 PV)
							</button>
							{#if activeEffects.some(e => e.characterId === selectedAttackerId && e.type === 'extra_breath')}
								<p class="text-[10px] text-[#10b981] font-bold">
									✅ Fôlego Extra Ativo (+2 Resistência, +1 Físico)
								</p>
							{/if}
						</div>
					{:else if attackerChar.classId === "weaver"}
						<div class="mt-3 bg-void/40 border border-bronze/30 p-3 rounded flex flex-col gap-2">
							<div class="flex justify-between items-center text-xs">
								<span class="text-bone/70 uppercase font-semibold">Energia do Mestre:</span>
								<span class="font-mono font-bold text-bone">
									{masterAvailableEe} / {masterMaxEe} EE
								</span>
							</div>
							<button
								type="button"
								onclick={activateDoubleTime}
								disabled={masterAvailableEe < 2 || activeEffects.some(e => e.characterId === selectedAttackerId && e.type === 'double_time') || turnState.activeActorId !== selectedAttackerId || attackerIsDying}
								class="bg-[#38bdf8] hover:bg-[#38bdf8]/80 text-void text-xs font-bold py-1.5 px-2 rounded transition-colors uppercase tracking-wider disabled:opacity-50"
							>
								⏳ Ativar Dobrar Tempo (Custa 2 EE)
							</button>
							{#if activeEffects.some(e => e.characterId === selectedAttackerId && e.type === 'double_time')}
								<p class="text-[10px] text-[#06b6d4] font-bold">
									✅ Dobrar Tempo Ativo (+1 Ação Adicional)
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
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
				{#if equippedWeapon}
					<div class="mt-3 border border-[#DAB973]/30 bg-[#1A1412] p-2.5 rounded-sm">
						<p class="text-xs font-semibold text-[#DAB973] uppercase tracking-wider flex items-center gap-1.5">
							⚔️ Arma Equipada: {equippedWeapon.label}
						</p>
						<div class="mt-1.5 flex flex-wrap gap-1">
							{#if equippedWeapon.isSharp === 1}
								<span class="text-[10px] font-bold bg-[#DAB973]/20 text-[#DAB973] px-1.5 py-0.5 border border-[#DAB973]/40 rounded-sm">
									AFIADA (+2 Margem, +1 Dano)
								</span>
							{/if}
							{#if equippedWeapon.isRunic === 1}
								<span class="text-[10px] font-bold bg-[#38bdf8]/20 text-[#38bdf8] px-1.5 py-0.5 border border-[#38bdf8]/40 rounded-sm">
									RÚNICA (Dano de Éter)
								</span>
							{/if}
						</div>
					</div>
				{/if}
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
		{#if !_isVictory && !_isDefeat}
			<button
				type="button"
				disabled={!view.canAttack || !_isHeroTurn}
				onclick={attack}
				data-testid="combat-attack-button"
				class="border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-colors hover:border-bone hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-ruin disabled:text-bone"
			>
				Atacar
			</button>
			{#if !activeCombatEncounterId}
				<button
					type="button"
					onclick={resetEncounter}
					disabled={!view.canReset}
					data-testid="combat-reset-button"
					class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
				>
					Reiniciar encontro
				</button>
			{/if}
			<button
				type="button"
				disabled={!view.canEndTurn || !_isHeroTurn}
				onclick={endTurn}
				data-testid="combat-end-turn-button"
				class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-blood-shadow disabled:text-bone"
			>
				Encerrar turno
			</button>
			{#if activeCombatEncounterId}
				<button
					type="button"
					onclick={retreat}
					disabled={!_isHeroTurn}
					data-testid="combat-retreat-button"
					class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-blood-shadow disabled:text-bone"
				>
					Recuar
				</button>
			{/if}
		{/if}
		{#if activeCombatEncounterId && _isVictory}
			<button
				type="button"
				onclick={collectRewards}
				data-testid="combat-collect-rewards-button"
				class="border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-colors hover:border-bone hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
			>
				Coletar Recompensas
			</button>
		{/if}
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

	{#if view.errorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="combat-error"
		>
			{view.errorMessage}
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
