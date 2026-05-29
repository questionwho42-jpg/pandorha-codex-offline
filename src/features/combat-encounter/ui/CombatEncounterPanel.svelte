<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { CompanionRecord } from "$lib/entities/companions";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import { SynergyService } from "$lib/entities/synergy/domain/SynergyService";
import { WorkerSynergyRepository } from "$lib/entities/synergy/infrastructure/WorkerSynergyRepository";
import type { CharacterCraftedItemRecord } from "../../crafting/model/craftingSchema";
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
};

type CombatEncounterStateResolver = (
	input: CombatEncounterInput,
) =>
	| { readonly success: true; readonly data: CombatEncounterState }
	| { readonly success: false; readonly error: CombatEncounterFailure };

const turnService = new CombatTurnService();

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
}: Props = $props();

// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for reset.
let targetHitPoints = $state(getInitialTargetHitPoints(initialTarget));
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected target.
let selectedTargetId = $state(initialTarget.id);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected attacker.
let selectedAttackerId = $state(attacker.id);
let lastState = $state<CombatEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let log = $state<readonly string[]>([]);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial turn state.
let turnState = $state<CombatTurnState>(
	createInitialTurnState(attacker.id, initialTarget.id),
);

let attackerHp = $state(15);
let attackerTension = $state(0);
let attackerDeathSuccesses = $state(0);
let attackerDeathFailures = $state(0);
let attackerIsDying = $state(false);
let limitBreakActive = $state(false);

let selectedTrickId = $state("marca_presa");
let masterEeSpent = $state(0);
let familiarReactionUsed = $state(false);
let familiarFlickered = $state(false);

let activeCompanions = $derived(
	companions.filter((c) => c.characterId === selectedAttackerId),
);

let activeCompanionStats = $derived(
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

let attackerChar = $derived(
	characters.find((c) => c.id === selectedAttackerId),
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
		attackerTension = 0;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
		attackerIsDying = false;
		limitBreakActive = false;
	}
});

$effect(() => {
	if (turnState.activeActorId === selectedAttackerId) {
		if (attackerHp === 0 && attackerIsDying) {
			runAutomaticDeathSave();
		}
	}
});

function addStatusEffect(characterId: string, type: string) {
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
		createdAt: new Date().toISOString(),
	};
	activeEffects = [...activeEffects, newEffect];
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
}

function removeStatusEffect(characterId: string, type: string) {
	activeEffects = activeEffects.filter(
		(e) => !(e.characterId === characterId && e.type === type),
	);
	localStorage.setItem(
		"pandorha_status_effects",
		JSON.stringify(activeEffects),
	);
	window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
}

function runAutomaticDeathSave() {
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;

	const naturalRoll = randRoll();
	const level = char.level;
	const physical = char.physical;
	const resistance = char.resistance;

	const cdTarget = 10 + level + physical + resistance;
	const totalRoll = naturalRoll + physical + resistance + level;

	log = [
		...log,
		`🩸 Teste de Morte automático de ${char.name}: Rolou d20=${naturalRoll} + mod=${physical + resistance + level} | Total ${totalRoll} vs CD ${cdTarget}.`,
	];

	if (naturalRoll === 20) {
		attackerHp = 1;
		attackerIsDying = false;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
		removeStatusEffect(char.id, "moribund");
		removeStatusEffect(char.id, "unconscious");
		log = [
			...log,
			`🌟 SUCESSO CRÍTICO! ${char.name} estabilizou e recuperou a consciência com 1 HP!`,
		];
	} else if (naturalRoll === 1) {
		attackerDeathFailures += 2;
		log = [
			...log,
			`💀 FALHA CRÍTICA! ${char.name} acumulou mais 2 falhas de morte. (${attackerDeathFailures}/3 falhas).`,
		];
	} else if (totalRoll >= cdTarget) {
		attackerDeathSuccesses += 1;
		log = [
			...log,
			`👍 Sucesso no teste de morte. (${attackerDeathSuccesses}/3 sucessos).`,
		];
	} else {
		attackerDeathFailures += 1;
		log = [
			...log,
			`👎 Falha no teste de morte. (${attackerDeathFailures}/3 falhas).`,
		];
	}

	if (attackerDeathSuccesses >= 3) {
		attackerIsDying = false;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
		removeStatusEffect(char.id, "moribund");
		log = [
			...log,
			`🩹 ${char.name} ESTABILIZOU! Ele permanece inconsciente com 0 HP, mas não corre mais risco de morte.`,
		];
	} else if (attackerDeathFailures >= 3) {
		log = [
			...log,
			`🪦 MORTE DEFINITIVA: ${char.name} sucumbiu aos ferimentos e faleceu.`,
		];
	}
}

function addTension(amount: number) {
	if (attackerHp === 0) return;
	attackerTension = Math.min(10, attackerTension + amount);
	if (attackerTension === 10) {
		log = [
			...log,
			`🔥 LIMIT BREAK ATIVO para ${selectedAttacker.label}! A habilidade Ultimate da classe está disponível.`,
		];
	}
}

function activateLimitBreak() {
	if (attackerTension < 10) return;
	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;

	let ultimateType = "avatar_guerra";
	let ultimateLabel = "Avatar da Guerra (Vanguarda)";
	if (char.classId === "weaver") {
		ultimateType = "surto_tempo";
		ultimateLabel = "Surto de Tempo (Tecelão)";
	} else if (char.classId === "hunter") {
		ultimateType = "cacada_selvagem";
		ultimateLabel = "Caçada Selvagem (Caçador)";
	} else if (char.classId === "emissary") {
		ultimateType = "rede_intrigas";
		ultimateLabel = "Rede de Intrigas (Emissário)";
	}

	addStatusEffect(char.id, ultimateType);
	attackerTension = 0;
	limitBreakActive = true;
	log = [
		...log,
		`💥 LIMIT BREAK CONJURADO! ${char.name} ativou a Ultimate: ${ultimateLabel}!`,
	];
}

function damageHero(amount: number) {
	if (attackerHp === 0) return;
	attackerHp = Math.max(0, attackerHp - amount);
	log = [
		...log,
		`💥 ${selectedAttacker.label} sofreu ${amount} de dano! (HP atual: ${attackerHp})`,
	];

	if (amount >= 5) {
		addTension(2);
		log = [
			...log,
			`⚠️ Crise! ${selectedAttacker.label} sofreu dano massivo e acumulou +2 de Tensão.`,
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

function healHero(amount: number) {
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

function helpHero() {
	if (attackerHp > 0 || !attackerIsDying) return;
	const helper = characters.find((c) => c.id !== selectedAttackerId) || {
		name: "Aliado",
		level: 1,
		mental: 1,
	};
	const naturalRoll = randRoll();
	const totalRoll = naturalRoll + helper.level + (helper.mental ?? 1);

	const char = characters.find((c) => c.id === selectedAttackerId);
	if (!char) return;
	const cdTarget = 10 + char.level + char.physical + char.resistance;

	log = [
		...log,
		`🩹 Primeiros Socorros: ${helper.name} tenta estabilizar ${char.name}. Rolou d20=${naturalRoll} + mod=${helper.level + (helper.mental ?? 1)} | Total ${totalRoll} vs CD ${cdTarget}.`,
	];

	if (totalRoll >= cdTarget) {
		attackerIsDying = false;
		attackerDeathSuccesses = 0;
		attackerDeathFailures = 0;
		removeStatusEffect(char.id, "moribund");
		log = [
			...log,
			`💖 SUCESSO! ${char.name} foi estabilizado por ${helper.name}!`,
		];
	} else {
		log = [
			...log,
			`❌ FALHA! ${helper.name} não conseguiu estabilizar ${char.name}.`,
		];
	}
}

// Estado de itens artesanais carregados do localStorage
let craftedItems = $state<CharacterCraftedItemRecord[]>([]);
// biome-ignore lint/suspicious/noExplicitAny: status effects loaded dynamically from local storage
let activeEffects = $state<any[]>([]);

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
function attack(): void {
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
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function endTurn(): void {
	if (!view.canEndTurn) {
		return;
	}

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

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resetEncounter(): void {
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttacker.id, selectedTarget.id);
	masterEeSpent = 0;
	familiarReactionUsed = false;
	familiarFlickered = false;
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
	familiarReactionUsed = false;
	familiarFlickered = false;
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
	familiarReactionUsed = false;
	familiarFlickered = false;
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

function getTrickCost(id: string): number {
	if (id === "marca_presa") return 1;
	if (id === "uivo_encorajador") return 2;
	if (id === "mordida_astral") return 3;
	return 1;
}

function commandCompanionAttack(comp: CompanionRecord) {
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

function castFamiliarTrick(comp: CompanionRecord) {
	if (familiarReactionUsed) return;
	const cost = getTrickCost(selectedTrickId);
	if (masterAvailableEe < cost) return;
	if (turnState.activeActorId !== selectedAttackerId || attackerIsDying) return;

	masterEeSpent += cost;
	familiarReactionUsed = true;
	familiarFlickered = true;

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

function toggleSensorySharing(comp: CompanionRecord) {
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

function damageCompanion(comp: CompanionRecord, amount: number) {
	if (onCompanionDamage) {
		onCompanionDamage(comp.id, amount);
		log = [
			...log,
			`💥 Companheiro ${comp.name} sofreu ${amount} de dano no simulador!`,
		];
	}
}

function healCompanion(comp: CompanionRecord, amount: number) {
	if (onCompanionDamage) {
		onCompanionDamage(comp.id, -amount);
		log = [
			...log,
			`💖 Companheiro ${comp.name} foi curado em ${amount} PV no simulador!`,
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

					<!-- Medidor de Tensão e Limit Break (Fase 39) -->
					{#if attackerHp > 0}
						<div class="mt-3 bg-void/50 border border-bronze/20 p-3 rounded flex flex-col gap-2">
							<div class="flex justify-between items-center text-xs">
								<span class="text-bone/70 uppercase tracking-wider font-semibold">Medidor de Tensão</span>
								<span class="font-mono font-bold text-[#f59e0b]">
									{attackerTension} / 10 fatias
								</span>
							</div>
							<div class="w-full bg-void rounded-full h-2.5 overflow-hidden border border-bronze/30 relative">
								<div class="bg-[#f59e0b] h-full transition-all duration-300 {attackerTension === 10 ? 'animate-pulse bg-[#dab973] shadow-[0_0_10px_#f59e0b]' : ''}" style="width: {attackerTension * 10}%"></div>
							</div>

							{#if attackerTension === 10}
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
								onclick={() => addTension(2)}
								disabled={attackerHp === 0}
								class="py-1 px-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/25 transition-colors disabled:opacity-50"
							>
								⚡ Tensão (+2)
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
		<button
			type="button"
			disabled={!view.canAttack}
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
