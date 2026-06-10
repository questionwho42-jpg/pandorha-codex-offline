<script lang="ts">
import { onMount } from "svelte";
// biome-ignore lint/correctness/noUnusedImports: used by Svelte markup
import { fade } from "svelte/transition";
import type {
	CharacterCreateInput,
	CharacterRecord,
	CharacterRepository,
} from "$lib/entities/character";
import { IllnessService } from "$lib/entities/character/domain/IllnessService";
import {
	BaseCharacterStats,
	EterFeverDecorator,
	type ICharacterStats,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import {
	type CompanionRecord,
	CompanionService,
	WorkerCompanionRepository,
} from "$lib/entities/companions";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { WorkerSocialRepository } from "$lib/entities/social";
import type {
	NewTrapRecord,
	TrapDowntimeCharacterService,
	TrapRecord,
} from "$lib/entities/traps";
import { TrapService, WorkerTrapRepository } from "$lib/entities/traps";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { BastionPanel } from "$lib/features/bastion";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CampPanel } from "$lib/features/camp";
import {
	// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
	CharacterCreateForm,
	mapAncestryTraitSelectionFailure,
	mapCharacterCreateFailure,
} from "$lib/features/character-create";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CharacterList } from "$lib/features/character-list";
import { chatState } from "$lib/features/chat";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import ChatLog from "$lib/features/chat/ui/ChatLog.svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { ClockDemo } from "$lib/features/clocks";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CombatEncounterPanel } from "$lib/features/combat-encounter";
import type {
	CombatEncounterActorRef,
	CombatTrainingAttackProfile,
	CombatTrainingTarget,
} from "$lib/features/combat-encounter/model-api";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CompendiumBrowser } from "$lib/features/compendium-browser";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import {
	CraftingWorkshopPanel,
	IllnessWorkshopPanel,
} from "$lib/features/crafting";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { DialoguePanel } from "$lib/features/dialogue";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { DomainCouncilPanel } from "$lib/features/domain-regional";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import EspionageManagementPanel from "$lib/features/espionage/ui/EspionageManagementPanel.svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { HexcrawlMapPanel } from "$lib/features/hexcrawl-map";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { InventoryReadOnlyPanel } from "$lib/features/inventory-readonly";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { MercenaryCompanyPanel } from "$lib/features/mercenary";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { QuestLogPanel } from "$lib/features/quests";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SaveManagerPanel } from "$lib/features/saves";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { NegotiationPanel, SocialDemo } from "$lib/features/social";
import { SocialStandingService } from "$lib/features/social/domain/SocialStandingService";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SpellCastPanel } from "$lib/features/spell-cast";
import { createCharacterListView } from "../features/character-list/model/characterListView";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import TrapDeploymentPanel from "../features/traps/ui/TrapDeploymentPanel.svelte";
import { createCharacterSession } from "./model/characterSession";
import { createCombatEncounterSession } from "./model/combatEncounterSession";
import { createCompendiumSession } from "./model/compendiumSession";
import { createHexcrawlSession } from "./model/hexcrawlSession";
import { createInventorySession } from "./model/inventorySession";
import type { AppNavigationId } from "./model/navigation";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { APP_NAVIGATION_ITEMS, getAppNavigationItem } from "./model/navigation";
import { createSpellCastSession } from "./model/spellCastSession";

const trapRepository = new WorkerTrapRepository();
const trapService = new TrapService();

const characterSession = createCharacterSession();

let characterHudStates = $state<
	Record<
		string,
		{ hp: number; pv: number; actionUsed: boolean; reactionUsed: boolean }
	>
>({});

$effect(() => {
	for (const char of viewItems) {
		if (!characterHudStates[char.id]) {
			const maxHp = char.maxHp;
			const maxPv = (char.axes[0].value + char.applications[2].value) * 3;
			characterHudStates[char.id] = {
				hp: maxHp,
				pv: maxPv,
				actionUsed: false,
				reactionUsed: false,
			};
		}
	}
});
const combatEncounterSession = createCombatEncounterSession();

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleCreateAttackInput(
	attacker: CombatEncounterActorRef,
	target: CombatTrainingTarget,
	targetHitPoints: number,
	attackProfile: CombatTrainingAttackProfile,
) {
	const baseInput = combatEncounterSession.createAttackInput(
		attacker,
		target,
		targetHitPoints,
		attackProfile,
	);
	const realChar = characterRecords.find((c) => c.id === attacker.id);
	if (!realChar) {
		return baseInput;
	}

	const realClass = characterSession.characterClasses.find(
		(c) => c.id === realChar.classId,
	);
	const baseStats = new BaseCharacterStats(realChar, {
		id: realClass ? realClass.id : "warrior",
		baseHp: realClass ? realClass.baseHp : 10,
	});

	let decoratedStats: ICharacterStats = baseStats;
	const charEffects = activeStatusEffects.filter(
		(e) => e.characterId === realChar.id,
	);
	for (const effect of charEffects) {
		if (effect.type === "eter_fever") {
			decoratedStats = new EterFeverDecorator(decoratedStats);
		} else if (effect.type === "wound_infection") {
			decoratedStats = new WoundInfectionDecorator(decoratedStats);
		} else if (effect.type === "viper_poison") {
			decoratedStats = new ViperPoisonDecorator(decoratedStats);
		}
	}

	const isMentalAttack =
		attackProfile.damageType === "spirit" ||
		attackProfile.damageType === "mind";
	const currentAxisValue = isMentalAttack
		? decoratedStats.mental
		: decoratedStats.physical;

	return {
		...baseInput,
		attack: {
			...baseInput.attack,
			axisValue: currentAxisValue,
		},
	};
}
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const compendiumSession = createCompendiumSession();
const hexcrawlSession = createHexcrawlSession();
const inventorySession = createInventorySession();
const spellCastSession = createSpellCastSession();

let activeView = $state<AppNavigationId>("home");
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeDialogueTreeId = $state<string | undefined>(undefined);
let campRations = $state(3);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let guildGold = $state(1000);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let dynamicInventoryItems = $derived(
	inventorySession.items.map((item) => {
		if (item.id === "ration-stack") {
			return {
				...item,
				label: `Ração de Acampamento (${campRations} restantes)`,
			};
		}
		return item;
	}),
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let craftingSubTab = $state<"forge" | "alchemy">("forge");

const socialRepository = new WorkerSocialRepository();
const socialStandingService = new SocialStandingService(socialRepository);
const companionRepository = new WorkerCompanionRepository();
const companionService = new CompanionService(
	companionRepository,
	characterSession.repository as unknown as CharacterRepository,
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isRestBlocked = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let fame = $state(0);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let bloodDebt = $state(0);
let dangerCounter = $state(15);
let companions = $state<CompanionRecord[]>([]);

// Cálculo reativo do caster de magia do Tecelão (Fase 22)
let _activeCaster = $derived.by(() => {
	const weaverChar = characterRecords.find((c) => c.classId === "weaver");
	if (weaverChar) {
		const baseEe = weaverChar.level + weaverChar.mental;
		const hasActiveFamiliar = companions.some(
			(comp) =>
				comp.characterId === weaverChar.id &&
				comp.type === "familiar" &&
				!comp.isDissipated,
		);
		const finalEe = hasActiveFamiliar ? Math.max(0, baseEe - 1) : baseEe;

		return {
			id: weaverChar.id,
			label: `${weaverChar.name} (Tecelão)`,
			availableEther: finalEe,
		};
	}
	return spellCastSession.caster;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleSocialStandingChange(blocked: boolean) {
	isRestBlocked = blocked;
}
let characterRecords = $state<CharacterRecord[]>([]);
let activeStatusEffects = $state<CharacterStatusEffectRecord[]>([]);
let craftedItems = $state<CharacterCraftedItemRecord[]>([]);
let trapsList = $state<TrapRecord[]>([]);
let activeTileId = $state(hexcrawlSession.initialTileId);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let currentTraps = $derived(trapsList.filter((t) => t.tileId === activeTileId));

async function persistTrapUpdate(updatedTrap: TrapRecord) {
	const res = await trapRepository.save(updatedTrap);
	if (res.success) {
		trapsList = trapsList.map((t) => (t.id === updatedTrap.id ? res.data : t));
	} else {
		console.error("Erro ao persistir armadilha no SQLite:", res.error);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let characterCreateError = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let characterCreateSuccess = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isCreatingCharacter = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeItem = $derived(getAppNavigationItem(activeView));

// Efeitos de Status reativos e integrados à rotina de sobrevivência do acampamento
let viewItems = $derived(
	createCharacterListView(characterRecords, {
		ancestries: characterSession.ancestries,
		backgrounds: characterSession.backgrounds,
		characterClasses: characterSession.characterClasses,
		statusEffects: activeStatusEffects,
		craftedItems,
	}).items,
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isNaturalRecoveryBlocked = $derived(
	viewItems.some((c) => !c.allowsNaturalRecovery),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let infectedCharacterNames = $derived(
	viewItems.filter((c) => !c.allowsNaturalRecovery).map((c) => c.name),
);

async function handleApplyStatusEffect(characterId: string, type: string) {
	const newEffect = {
		characterId,
		type,
		severity: 2,
		severityMax: 4,
		isAggravated: false,
	};
	const res = await characterSession.repository.saveStatusEffect(newEffect);
	if (res.success) {
		activeStatusEffects = [...activeStatusEffects, res.data];
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleClearStatusEffects(characterId: string) {
	const effectsToRemove = activeStatusEffects.filter(
		(e) => e.characterId === characterId,
	);
	for (const effect of effectsToRemove) {
		await characterSession.repository.deleteStatusEffect(effect.id);
	}
	activeStatusEffects = activeStatusEffects.filter(
		(e) => e.characterId !== characterId,
	);
}

async function _handleSummonCompanion(
	characterId: string,
	name: string,
	type: "aggressor" | "protector" | "scout" | "familiar",
	subModel: string,
	tier: number,
) {
	const res = await companionService.summonCompanion(
		characterId,
		name,
		type,
		subModel,
		tier,
		new Date().toISOString(),
	);
	if (res.success) {
		await reloadCompanions();
	} else {
		console.error("Erro ao invocar companheiro:", res.error);
	}
}

async function _handleShareSensory(companionId: string, isShare: boolean) {
	const res = await companionService.shareSensory(
		companionId,
		isShare,
		new Date().toISOString(),
	);
	if (res.success) {
		await reloadCompanions();
	}
}

async function _handleCompanionDamage(companionId: string, damage: number) {
	const res = await companionService.applyDamageToCompanion(
		companionId,
		damage,
		new Date().toISOString(),
	);
	if (res.success) {
		await reloadCompanions();
		// O dano no familiar pode aplicar dano mental no mestre, então recarregamos os personagens
		characterRecords = characterSession.repository.all();
	}
}

async function _handleStabilizeMaster(characterId: string) {
	const res = await companionService.stabilizeMaster(
		characterId,
		new Date().toISOString(),
	);
	if (res.success && res.data) {
		await reloadCompanions();
		characterRecords = characterSession.repository.all();
	}
}

async function _handleUpdateCompanionTraits(
	companionId: string,
	traits: string[],
) {
	const res = await companionService.updateSelectedTraits(
		companionId,
		traits,
		new Date().toISOString(),
	);
	if (res.success) {
		await reloadCompanions();
	} else {
		alert(`Erro ao atualizar traços: ${res.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleGlobalEndRecess() {
	const illnessService = new IllnessService(
		characterSession.repository,
		characterSession.service.idProvider,
		characterSession.service.clock,
	);

	for (const char of characterRecords) {
		const res = await illnessService.processWeeklyIllnessProgress(char.id);
		if (res.success && res.data.length > 0) {
			for (const prog of res.data) {
				if (prog.curated) {
					chatState.addMessage({
						type: "camp",
						content: `❤️ [Recesso] **${char.name}** superou e curou a patologia **${prog.diseaseType}**!`,
					});
				} else {
					chatState.addMessage({
						type: "camp",
						content: `⚠️ [Recesso] A patologia **${prog.diseaseType}** de **${char.name}** progrediu para gravidade **${prog.newSeverity}**.`,
					});
				}
			}
		}
	}

	// Recarrega todos os status effects e atualiza o estado reativo global
	const nextEffects: CharacterStatusEffectRecord[] = [];
	for (const char of characterRecords) {
		const effectsRes =
			await characterSession.repository.findStatusEffectsByCharacterId(char.id);
		if (effectsRes.success) {
			nextEffects.push(...effectsRes.data);
		}
	}
	activeStatusEffects = nextEffects;
}

async function reloadCompanions() {
	const tempCompanions: CompanionRecord[] = [];
	for (const char of characterRecords) {
		const res = await companionRepository.findCompanionsByCharacter(char.id);
		if (res.success) {
			tempCompanions.push(...res.data);
		}
	}
	companions = tempCompanions;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleRestSuccess() {
	const activeHeroes = characterRecords;
	const rationsRequired = activeHeroes.length > 0 ? activeHeroes.length : 1;
	const rationsAvailable = campRations;

	// Consome rações de acampamento: 1 por aventureiro ativo
	const consumedRations = Math.min(rationsAvailable, rationsRequired);
	campRations -= consumedRations;

	// Itera sobre os aventureiros para aplicar ou curar a fome
	for (let i = 0; i < activeHeroes.length; i++) {
		const char = activeHeroes[i];
		const isFed = i < consumedRations;

		if (isFed) {
			// Se o aventureiro comeu, limpa a fome caso estivesse faminto
			const hungryEffect = activeStatusEffects.find(
				(e) => e.characterId === char.id && e.type === "hungry",
			);
			if (hungryEffect) {
				await characterSession.repository.deleteStatusEffect(hungryEffect.id);
				activeStatusEffects = activeStatusEffects.filter(
					(e) => e.id !== hungryEffect.id,
				);
			}
		} else {
			// Se faltou comida para este aventureiro, ele entra na condição Faminto (Hungry)
			const hasHungry = activeStatusEffects.some(
				(e) => e.characterId === char.id && e.type === "hungry",
			);
			if (!hasHungry) {
				await handleApplyStatusEffect(char.id, "hungry");
			}
		}
	}

	// Recuperação natural das enfermidades normais (Febre de Éter, Veneno de Víbora)
	// apenas para quem comeu e não possui infecção/fome bloqueando (allowsNaturalRecovery = true)
	const restRecoverableEffects = activeStatusEffects.filter((effect) => {
		const char = viewItems.find((c) => c.id === effect.characterId);
		return (
			char?.allowsNaturalRecovery &&
			(effect.type === "eter_fever" || effect.type === "viper_poison")
		);
	});

	for (const effect of restRecoverableEffects) {
		await characterSession.repository.deleteStatusEffect(effect.id);
	}

	activeStatusEffects = activeStatusEffects.filter(
		(e) => !restRecoverableEffects.some((r) => r.id === e.id),
	);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleHexcrawlMoveSuccess(biome: string, toTileId?: string) {
	if (toTileId) {
		activeTileId = toTileId;
	}
	if (characterRecords.length === 0) return;

	// Procuramos se há alguma armadilha ativa e não detectada no bloco de destino
	const blockTraps = trapsList.filter(
		(t) =>
			t.tileId === activeTileId &&
			!t.isDetected &&
			!t.isDisarmed &&
			!t.isTriggered,
	);

	if (blockTraps.length > 0) {
		const trap = blockTraps[0];
		// Escolhe o aventureiro com melhor Mental para vigiar
		let bestChar = characterRecords[0];
		for (const char of characterRecords) {
			if (char.mental > bestChar.mental) {
				bestChar = char;
			}
		}

		const array = new Uint32Array(1);
		crypto.getRandomValues(array);
		const roll = (array[0] % 20) + 1;

		const detectRes = trapService.detectTrap(bestChar, trap, roll);
		if (detectRes.success) {
			chatState.addMessage({
				type: "narrative",
				sender: "Vigília",
				content: detectRes.data.log,
			});

			if (detectRes.data.isDetected) {
				await persistTrapUpdate({ ...trap, isDetected: true });
			} else {
				// Falhou na vigília automática: a armadilha dispara!
				const triggerRollArray = new Uint32Array(1);
				crypto.getRandomValues(triggerRollArray);
				const triggerRoll = (triggerRollArray[0] % 20) + 1;

				const arrayIndex = new Uint32Array(1);
				crypto.getRandomValues(arrayIndex);
				const randomIndex = arrayIndex[0] % characterRecords.length;
				const targetChar = characterRecords[randomIndex];

				const tempCharService: TrapDowntimeCharacterService = {
					saveStatusEffect: async (effect) => {
						await handleApplyStatusEffect(effect.characterId, effect.type);
						return {
							success: true as const,
							data: {
								id: `eff-${effect.characterId}-${effect.type}`,
								characterId: effect.characterId,
								type: effect.type as
									| "eter_fever"
									| "wound_infection"
									| "viper_poison",
								severity: effect.severity,
								severityMax: effect.severityMax,
								isAggravated: effect.isAggravated,
								metadata: null,
								createdAt: new Date().toISOString(),
								updatedAt: new Date().toISOString(),
							},
						};
					},
				};

				const triggerRes = await trapService.resolveTriggeredTrap(
					targetChar,
					trap,
					triggerRoll,
					tempCharService,
				);
				if (triggerRes.success) {
					chatState.addMessage({
						type: "combat",
						sender: "Armadilha",
						content: triggerRes.data.log,
					});
					await persistTrapUpdate({
						...trap,
						isDetected: true,
						isTriggered: true,
					});
				}
			}
		}
		return;
	}

	// Escolhe um aventureiro aleatório para o teste de vigor usando crypto
	const arrayIndex = new Uint32Array(1);
	crypto.getRandomValues(arrayIndex);
	const randomIndex = arrayIndex[0] % characterRecords.length;
	const targetChar = characterRecords[randomIndex];

	// Faz um teste d20 de resistência
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const roll = (array[0] % 20) + 1;

	// Dificuldade contra patógenos ambientais
	const dc = 12;

	// Se o bioma for perigoso e o aventureiro falhar no teste de resistência
	const isDangerousBiome = [
		"Pântano",
		"Floresta",
		"Ruínas",
		"Swamp",
		"Forest",
		"Ruins",
	].some((term) => biome.toLowerCase().includes(term.toLowerCase()));

	if (isDangerousBiome && roll < dc) {
		// Escolhe um efeito aleatório (Febre de Éter ou Veneno de Víbora) usando crypto
		const arrayEffect = new Uint32Array(1);
		crypto.getRandomValues(arrayEffect);
		const effectType = arrayEffect[0] % 2 === 0 ? "eter_fever" : "viper_poison";
		await handleApplyStatusEffect(targetChar.id, effectType);

		chatState.addMessage({
			type: "system",
			content: `⚠️ Perigo Ambiental! **${targetChar.name}** falhou no teste de Vigor (d20: ${roll} vs CD: ${dc}) e contraiu **${effectType === "eter_fever" ? "Febre de Éter" : "Veneno de Víbora"}** no bioma **${biome}**!`,
		});
	}

	// Interceptar movimentação para tiles com eventos de diálogo narrativo
	if (toTileId === "northeast-watch") {
		activeDialogueTreeId = "tree-scribe-lore";
		activeView = "dialogue";
	} else if (toTileId === "southeast-ruins") {
		activeDialogueTreeId = "tree-alchemist-secrets";
		activeView = "dialogue";
	} else if (toTileId === "camp-road") {
		activeDialogueTreeId = "tree-merchant-bargain";
		activeView = "dialogue";
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleManualDetectTrap(
	trapId: string,
	characterId: string,
	roll: number,
) {
	const trap = trapsList.find((t) => t.id === trapId);
	const char = characterRecords.find((c) => c.id === characterId);
	if (!trap || !char) return;

	const res = trapService.detectTrap(char, trap, roll);
	if (res.success) {
		chatState.addMessage({
			type: "narrative",
			sender: "Vigília",
			content: res.data.log,
		});

		if (res.data.isDetected) {
			await persistTrapUpdate({ ...trap, isDetected: true });
		} else {
			// Dispara a armadilha na falha do teste
			const triggerRollArray = new Uint32Array(1);
			crypto.getRandomValues(triggerRollArray);
			const triggerRoll = (triggerRollArray[0] % 20) + 1;

			const tempCharService: TrapDowntimeCharacterService = {
				saveStatusEffect: async (effect) => {
					await handleApplyStatusEffect(effect.characterId, effect.type);
					return {
						success: true as const,
						data: {
							id: `eff-${effect.characterId}-${effect.type}`,
							characterId: effect.characterId,
							type: effect.type as
								| "eter_fever"
								| "wound_infection"
								| "viper_poison",
							severity: effect.severity,
							severityMax: effect.severityMax,
							isAggravated: effect.isAggravated,
							metadata: null,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						},
					};
				},
			};

			const triggerRes = await trapService.resolveTriggeredTrap(
				char,
				trap,
				triggerRoll,
				tempCharService,
			);
			if (triggerRes.success) {
				chatState.addMessage({
					type: "combat",
					sender: "Armadilha",
					content: triggerRes.data.log,
				});
				if (triggerRes.data.tensionIncreased) {
					dangerCounter = Math.min(
						20,
						dangerCounter + triggerRes.data.tensionIncreased,
					);
				}
				await persistTrapUpdate({
					...trap,
					isDetected: true,
					isTriggered: true,
				});
			}
		}
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleManualDisarmTrap(
	trapId: string,
	characterId: string,
	roll: number,
	isTrained: boolean,
) {
	const trap = trapsList.find((t) => t.id === trapId);
	const char = characterRecords.find((c) => c.id === characterId);
	if (!trap || !char) return;

	const tempCharService: TrapDowntimeCharacterService = {
		saveStatusEffect: async (effect) => {
			await handleApplyStatusEffect(effect.characterId, effect.type);
			return {
				success: true as const,
				data: {
					id: `eff-${effect.characterId}-${effect.type}`,
					characterId: effect.characterId,
					type: effect.type as
						| "eter_fever"
						| "wound_infection"
						| "viper_poison",
					severity: effect.severity,
					severityMax: effect.severityMax,
					isAggravated: effect.isAggravated,
					metadata: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			};
		},
	};

	const res = await trapService.disarmTrap(
		char,
		trap,
		roll,
		isTrained,
		tempCharService,
	);
	if (res.success) {
		chatState.addMessage({
			type: "system",
			content: res.data.log,
		});

		if (res.data.isDisarmed) {
			await persistTrapUpdate({ ...trap, isDisarmed: true });
		} else {
			if (res.data.tensionIncreased) {
				dangerCounter = Math.min(20, dangerCounter + res.data.tensionIncreased);
			}
			await persistTrapUpdate({ ...trap, isTriggered: true });
		}
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isOnline = $state(true);

onMount(async () => {
	isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

	if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/sw.js")
			.then((registration) => {
				console.log(
					"Service Worker registrado com sucesso: ",
					registration.scope,
				);
			})
			.catch((error) => {
				console.error("Falha ao registrar Service Worker: ", error);
			});
	}

	const updateOnlineStatus = () => {
		isOnline = navigator.onLine;
	};

	const refreshCraftedItems = () => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("pandorha_crafted_items");
			if (stored) {
				try {
					craftedItems = JSON.parse(stored);
				} catch (e) {
					console.error("Erro ao carregar itens artesanais no App", e);
				}
			}
		}
	};

	window.addEventListener("online", updateOnlineStatus);
	window.addEventListener("offline", updateOnlineStatus);
	refreshCraftedItems();
	window.addEventListener("storage", refreshCraftedItems);
	window.addEventListener(
		"pandorha:crafted-items-changed",
		refreshCraftedItems,
	);

	// Carregar dados iniciais dos personagens da sessão
	characterRecords = characterSession.repository.all();

	// Carregar todos os status effects para os personagens existentes
	const tempEffects: CharacterStatusEffectRecord[] = [];
	for (const char of characterRecords) {
		const res =
			await characterSession.repository.findStatusEffectsByCharacterId(char.id);
		if (res.success) {
			tempEffects.push(...res.data);
		}
	}
	activeStatusEffects = tempEffects;

	const initialTraps: NewTrapRecord[] = [
		{
			id: "trap-north-pines",
			tileId: "north-pines",
			name: "Armadilha de Espinhos de Caça",
			type: "mechanical",
			severity: "simple",
			dc: 6,
			damage: 15,
			isDetected: false,
			isDisarmed: false,
			isTriggered: false,
			effects: JSON.stringify(["wound_infection"]),
			createdAt: new Date().toISOString(),
		},
		{
			id: "trap-southeast-ruins",
			tileId: "southeast-ruins",
			name: "Runa de Conjunção Pestilenta",
			type: "magical",
			severity: "hidden",
			dc: 8,
			damage: 25,
			isDetected: false,
			isDisarmed: false,
			isTriggered: false,
			effects: JSON.stringify(["viper_poison", "eter_fever"]),
			createdAt: new Date().toISOString(),
		},
		{
			id: "trap-south-marsh",
			tileId: "south-marsh",
			name: "Agulhas de Veneno de Serpente",
			type: "mechanical",
			severity: "deadly",
			dc: 12,
			damage: 35,
			isDetected: false,
			isDisarmed: false,
			isTriggered: false,
			effects: JSON.stringify(["viper_poison"]),
			createdAt: new Date().toISOString(),
		},
	];

	for (const trap of initialTraps) {
		const existing = await trapRepository.findById(trap.id);
		if (existing.success) {
			trapsList.push(existing.data);
		} else {
			const res = await trapRepository.save(trap);
			if (res.success) {
				trapsList.push(res.data);
			}
		}
	}

	// Carregar todos os companions para os personagens existentes
	const tempCompanions: CompanionRecord[] = [];
	for (const char of characterRecords) {
		const res = await companionRepository.findCompanionsByCharacter(char.id);
		if (res.success) {
			tempCompanions.push(...res.data);
		}
	}
	companions = tempCompanions;

	// Carregar reputação/standing físico e calcular bloqueio global de descanso
	await socialStandingService.ensureBaseFactions();
	let totalBloodDebt = 0;
	let highestFame = 0;
	let restBlocked = false;
	for (const char of characterRecords) {
		const standing = await socialStandingService.getCharacterStanding(char.id);
		const charDebt = standing.debts
			.filter((d) => !d.isPaid)
			.reduce((sum, d) => sum + d.debtValue, 0);
		totalBloodDebt += charDebt;

		const charFame = standing.reputations.reduce(
			(sum, r) => sum + Math.max(0, r.value),
			0,
		);
		if (charFame > highestFame) {
			highestFame = charFame;
		}

		// Checa se este personagem está bloqueado por dívida de sangue
		for (const rep of standing.reputations) {
			const checkRes = await socialRepository.findReputation(
				char.id,
				rep.factionId,
			);
			if (checkRes.success && checkRes.data) {
				const debtsRes = await socialRepository.findBloodDebtsByCharacter(
					char.id,
				);
				if (debtsRes.success) {
					const charUnpaidDebt = debtsRes.data
						.filter((d) => !d.isPaid)
						.reduce((sum, d) => sum + d.debtValue, 0);
					if (charUnpaidDebt > checkRes.data.value * 3) {
						restBlocked = true;
					}
				}
			}
		}
	}
	fame = highestFame;
	bloodDebt = totalBloodDebt;
	isRestBlocked = restBlocked;

	return () => {
		window.removeEventListener("online", updateOnlineStatus);
		window.removeEventListener("offline", updateOnlineStatus);
		window.removeEventListener("storage", refreshCraftedItems);
		window.removeEventListener(
			"pandorha:crafted-items-changed",
			refreshCraftedItems,
		);
	};
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function createCharacter(
	input: CharacterCreateInput,
	ancestryTraitIds: readonly string[],
): Promise<boolean> {
	isCreatingCharacter = true;
	const traitSelection =
		await characterSession.ancestryTraitSelectionService.chooseLevelOneTraits({
			ancestryId: input.ancestryId,
			traitIds: ancestryTraitIds,
		});

	if (!traitSelection.success) {
		isCreatingCharacter = false;
		characterCreateError = mapAncestryTraitSelectionFailure(
			traitSelection.error,
		);
		characterCreateSuccess = null;
		return false;
	}

	const result = await characterSession.service.createCharacter(input);
	isCreatingCharacter = false;

	if (!result.success) {
		characterCreateError = mapCharacterCreateFailure(result.error);
		characterCreateSuccess = null;
		return false;
	}

	characterRecords = [...characterRecords, result.data];
	characterCreateError = null;
	characterCreateSuccess = `${result.data.name} foi criado e adicionado à lista.`;
	return true;
}
</script>

<main
	aria-labelledby="pandorha-title"
	class="min-h-screen bg-void text-bone flex flex-col"
>
	<div class="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] min-h-screen h-screen overflow-hidden">
		<!-- BARRA LATERAL FIXA DA ESQUERDA (HUD & CHATLOG) -->
		<aside class="border-r border-bronze/35 bg-ruin/15 flex flex-col h-full overflow-hidden p-4 gap-4">
			<!-- Logo / Título Principal do Cockpit -->
			<div class="flex items-center justify-between border-b border-bronze/30 pb-2 flex-shrink-0">
				<div>
					<h2 class="text-xs font-extrabold text-ether tracking-wider uppercase">PANDORHA ENGINE</h2>
					<p class="text-[10px] text-ether/60">Painel do Árbitro / Jogador</p>
				</div>
				<span class="text-[10px] px-2 py-0.5 border border-bronze bg-void text-bronze rounded-sm font-mono font-bold">
					v0.5.0
				</span>
			</div>

			<!-- HUD do Grupo -->
			<div class="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin flex flex-col min-h-0">
				<div class="flex items-center justify-between flex-shrink-0 mb-1">
					<h3 class="text-xs font-bold uppercase tracking-wider text-bone flex items-center gap-1">
						<span>👥</span> Grupo Ativo
					</h3>
					<span class="text-[10px] text-ether/60 font-semibold">{viewItems.length} Heróis</span>
				</div>

				<div class="space-y-3 flex-1 overflow-y-auto min-h-0">
					{#if viewItems.length === 0}
						<div class="text-xs italic text-ether/40 p-4 border border-dashed border-bronze/20 text-center rounded">
							Nenhum aventureiro ativo no grupo.
						</div>
					{:else}
						{#each viewItems as char (char.id)}
							{@const hudState = characterHudStates[char.id] || { hp: 10, pv: 10, actionUsed: false, reactionUsed: false }}
							{@const maxHp = char.maxHp}
							{@const maxPv = (char.axes[0].value + char.applications[2].value) * 3}
							
							<div class="border border-bronze/35 bg-void/60 p-3 rounded-md flex flex-col gap-2 relative transition-all duration-300 hover:border-bronze/70">
								<!-- Nome e Identidade -->
								<div class="flex justify-between items-start gap-1">
									<div class="min-w-0 flex-1">
										<button
											type="button"
											class="text-xs font-bold text-bone hover:text-ether text-left transition-colors cursor-pointer focus:outline-none truncate w-full"
											onclick={() => {
												activeView = "characters";
											}}
											title="Clique para ver ficha completa"
										>
											{char.name}
										</button>
										<p class="text-[9px] text-ether/60 truncate">{char.identityLabel}</p>
									</div>

									<!-- Status de Ação / Reação -->
									<div class="flex items-center gap-1 flex-shrink-0">
										<button
											type="button"
											onclick={() => characterHudStates[char.id].actionUsed = !hudState.actionUsed}
											class="px-1 py-0.5 text-[8px] font-extrabold rounded-sm border transition-all duration-200 cursor-pointer focus:outline-none
												{hudState.actionUsed 
													? 'bg-ruin/50 border-bronze/25 text-bone/45' 
													: 'bg-emerald-poison/15 border-emerald-poison/40 text-emerald-poison shadow-[0_0_4px_rgba(16,185,129,0.1)]'}"
											title="Alternar Ação de Turno"
										>
											ACT
										</button>
										<button
											type="button"
											onclick={() => characterHudStates[char.id].reactionUsed = !hudState.reactionUsed}
											class="px-1 py-0.5 text-[8px] font-extrabold rounded-sm border transition-all duration-200 cursor-pointer focus:outline-none
												{hudState.reactionUsed 
													? 'bg-ruin/50 border-bronze/25 text-bone/45' 
													: 'bg-purple-runic/15 border-purple-runic/40 text-purple-runic shadow-[0_0_4px_rgba(168,85,247,0.1)]'}"
											title="Alternar Reação de Turno"
										>
											REA
										</button>
									</div>
								</div>

								<!-- Barra de HP (Corpo) -->
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-[9px] font-semibold text-bone/85">
										<span class="flex items-center gap-1">❤️ Corpo (HP)</span>
										<div class="flex items-center gap-1 flex-shrink-0">
											<button type="button" onclick={() => characterHudStates[char.id].hp = Math.max(0, hudState.hp - 1)} class="w-3.5 h-3.5 bg-ruin/60 border border-bronze/30 hover:border-bronze hover:bg-void rounded flex items-center justify-center font-bold text-bone cursor-pointer focus:outline-none select-none">-</button>
											<span class="min-w-[32px] text-center font-mono font-bold">{hudState.hp}/{maxHp}</span>
											<button type="button" onclick={() => characterHudStates[char.id].hp = Math.min(maxHp, hudState.hp + 1)} class="w-3.5 h-3.5 bg-ruin/60 border border-bronze/30 hover:border-bronze hover:bg-void rounded flex items-center justify-center font-bold text-bone cursor-pointer focus:outline-none select-none">+</button>
										</div>
									</div>
									<div class="h-1.5 w-full bg-void border border-bronze/25 rounded-sm overflow-hidden">
										<div class="h-full bg-gradient-to-r from-blood to-blood/90 transition-all duration-300" style="width: {Math.min(100, Math.max(0, (hudState.hp / maxHp) * 100))}%"></div>
									</div>
								</div>

								<!-- Barra de PV (Vigor) -->
								<div class="flex flex-col gap-0.5">
									<div class="flex justify-between text-[9px] font-semibold text-bone/85">
										<span class="flex items-center gap-1">⚡ Vigor (PV)</span>
										<div class="flex items-center gap-1 flex-shrink-0">
											<button type="button" onclick={() => characterHudStates[char.id].pv = Math.max(0, hudState.pv - 1)} class="w-3.5 h-3.5 bg-ruin/60 border border-bronze/30 hover:border-bronze hover:bg-void rounded flex items-center justify-center font-bold text-bone cursor-pointer focus:outline-none select-none">-</button>
											<span class="min-w-[32px] text-center font-mono font-bold">{hudState.pv}/{maxPv}</span>
											<button type="button" onclick={() => characterHudStates[char.id].pv = Math.min(maxPv, hudState.pv + 1)} class="w-3.5 h-3.5 bg-ruin/60 border border-bronze/30 hover:border-bronze hover:bg-void rounded flex items-center justify-center font-bold text-bone cursor-pointer focus:outline-none select-none">+</button>
										</div>
									</div>
									<div class="h-1.5 w-full bg-void border border-bronze/25 rounded-sm overflow-hidden">
										<div class="h-full bg-gradient-to-r from-orange-hungry to-ether transition-all duration-300" style="width: {Math.min(100, Math.max(0, (hudState.pv / maxPv) * 100))}%"></div>
									</div>
								</div>

								<!-- Rolagens Rápidas de Eixos -->
								<div class="flex items-center gap-2 mt-1 pt-1.5 border-t border-bronze/20 justify-between">
									<span class="text-[9px] font-extrabold text-ether/60 uppercase tracking-wider">Rolagens:</span>
									<div class="flex items-center gap-1">
										{#each char.axes as stat}
											<button
												type="button"
												onclick={() => chatState.rollD20(char.name, stat.label, stat.value)}
												class="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-void hover:bg-ruin border border-bronze/40 hover:border-ether/50 text-bone rounded-sm transition-all cursor-pointer focus:outline-none select-none"
												title="Rolar d20 + {stat.value} ({stat.label})"
											>
												{stat.label.substring(0, 3)}:{stat.value >= 0 ? '+' : ''}{stat.value}
											</button>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Chat de Logs/Rolagens -->
			<div class="flex-shrink-0">
				<ChatLog />
			</div>
		</aside>

		<!-- ÁREA DINÂMICA DA DIREITA -->
		<div class="flex flex-col h-full overflow-y-auto">
			<div class="px-6 py-6 sm:px-8 lg:px-10 flex flex-col gap-6 max-w-6xl w-full mx-auto">
				<!-- Header Compacto -->
				<header class="border-b border-ether/40 pb-4 flex items-center justify-between gap-4 flex-shrink-0">
					<div>
						<p class="text-xs font-semibold text-ether">Área de Jogo Ativa</p>
						<h1
							id="pandorha-title"
							class="mt-1 text-2xl font-bold leading-tight text-bone sm:text-3xl"
						>
							{activeItem.heading}
						</h1>
					</div>
					<div class="flex items-center gap-2 shrink-0">
						{#if isRestBlocked}
							<button
								type="button"
								onclick={() => activeView = "social"}
								class="inline-flex items-center gap-1.5 rounded-full border border-blood bg-blood-shadow/40 px-3 py-1 text-xs font-bold text-blood transition-all duration-300 animate-pulse hover:bg-blood/20"
								title="Dívida de Sangue excede o limite. Clique para renegociar."
							>
								⚠️ DESCANSO BLOQUEADO
							</button>
						{/if}
						{#if isOnline}
							<span class="inline-flex items-center gap-1.5 rounded-full border border-ether/40 bg-ruin px-3 py-1 text-xs font-semibold text-ether transition-all duration-300">
								<span class="h-2 w-2 rounded-full bg-ether animate-pulse"></span>
								ONLINE
							</span>
						{:else}
							<span class="inline-flex items-center gap-1.5 rounded-full border border-bronze bg-ruin px-3 py-1 text-xs font-semibold text-bronze transition-all duration-300">
								<span class="h-2 w-2 rounded-full bg-bronze"></span>
								OFFLINE
							</span>
						{/if}
					</div>
				</header>

				<!-- Navegação Compacta -->
				<nav aria-label="Navegação principal" class="flex flex-wrap gap-1.5 flex-shrink-0">
					{#each APP_NAVIGATION_ITEMS as item}
						<button
							type="button"
							aria-current={activeView === item.id ? "page" : undefined}
							class="rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether cursor-pointer"
							class:border-ether={activeView === item.id}
							class:bg-ether={activeView === item.id}
							class:text-void={activeView === item.id}
							class:border-bronze={activeView !== item.id}
							class:bg-ruin={activeView !== item.id}
							class:text-bone={activeView !== item.id}
							onclick={() => {
								activeView = item.id;
							}}
						>
							{item.label}
						</button>
					{/each}
				</nav>

				<!-- Painel de Exibição Dinâmica -->
				<section
					aria-live="polite"
					class="rounded-lg glass-runic p-6 border border-bronze/35 bg-ruin/5 shadow-inner"
				>
					{#key activeView}
						<div transition:fade={{ duration: 150 }}>
					{#if activeView === "characters"}
				<div class="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
					<CharacterCreateForm
						ancestries={characterSession.ancestries}
						backgrounds={characterSession.backgrounds}
						characterClasses={characterSession.characterClasses}
						errorMessage={characterCreateError}
						isSubmitting={isCreatingCharacter}
						onCreate={createCharacter}
						successMessage={characterCreateSuccess}
						traitsByAncestryId={characterSession.traitsByAncestryId}
					/>
					<CharacterList
						ancestries={characterSession.ancestries}
						backgrounds={characterSession.backgrounds}
						characterClasses={characterSession.characterClasses}
						records={characterRecords}
						statusEffects={activeStatusEffects}
						craftedItems={craftedItems}
						onApplyStatusEffect={handleApplyStatusEffect}
						onClearStatusEffects={handleClearStatusEffects}
						companions={companions}
						onSummonCompanion={_handleSummonCompanion}
						onShareSensory={_handleShareSensory}
						onCompanionDamage={_handleCompanionDamage}
						onStabilizeMaster={_handleStabilizeMaster}
						onUpdateCompanionTraits={_handleUpdateCompanionTraits}
					/>
				</div>
			{:else if activeView === "compendium"}
				<CompendiumBrowser
					searchEntries={(input) =>
						compendiumSession.searchService.searchEntries(input)}
				/>
			{:else if activeView === "inventory"}
				<InventoryReadOnlyPanel
					capacity={inventorySession.capacity}
					items={dynamicInventoryItems}
					characters={characterRecords}
					activeStatusEffects={activeStatusEffects}
				/>
			{:else if activeView === "exploration"}
				<HexcrawlMapPanel
					createMovementInput={hexcrawlSession.createMovementInput}
					initialTileId={hexcrawlSession.initialTileId}
					moveParty={hexcrawlSession.moveParty}
					tiles={hexcrawlSession.tiles}
					onMoveSuccess={handleHexcrawlMoveSuccess}
					currentTraps={currentTraps}
					characters={characterRecords}
					onDetectTrap={handleManualDetectTrap}
					onDisarmTrap={handleManualDisarmTrap}
				/>
			{:else if activeView === "magic"}
				<SpellCastPanel
					buildCastCommand={spellCastSession.buildCastCommand}
					caster={_activeCaster}
					createCastInput={spellCastSession.createCastInput}
					spells={spellCastSession.spells}
					targets={[spellCastSession.target, ...characterRecords.map(c => ({ id: c.id, label: c.name }))]}
					onCastSpell={async (payload) => {
						const commandInput = {
							...spellCastSession.createCastInput(payload.spellId),
							casterId: payload.casterId,
							targetId: payload.targetId,
							availableEther: _activeCaster.availableEther,
							upcastCircleCount: payload.upcastLevel
						};
						const res = await spellCastSession.buildCastCommand(commandInput);
						if (res.success) {
							chatState.addMessage({
								type: "combat",
								sender: "Magia",
								content: `✨ ${_activeCaster.label} conjurou com sucesso em ${payload.targetId}!`
							});
							const spell = spellCastSession.spells.find(s => s.id === payload.spellId);
							if (spell && spell.targetEffects) {
								for (const effectType of spell.targetEffects) {
									await handleApplyStatusEffect(payload.targetId, effectType);
								}
							}
						}
						return res;
					}}
				/>
			{:else if activeView === "combat"}
				<CombatEncounterPanel
					attacker={combatEncounterSession.attacker}
					characterClasses={characterSession.characterClasses}
					characters={characterRecords}
					createAttackInput={handleCreateAttackInput}
					initialTarget={combatEncounterSession.initialTarget}
					resolveAttack={(input) =>
						combatEncounterSession.service.resolveAttack(input)}
					trainingTargets={combatEncounterSession.trainingTargets}
				/>
			{:else if activeView === "social"}
				<SocialDemo 
					service={socialStandingService} 
					onStandingChange={handleSocialStandingChange} 
					characters={characterRecords}
					activeEffects={activeStatusEffects}
					characterClasses={characterSession.characterClasses}
				/>
			{:else if activeView === "negotiation"}
				<NegotiationPanel
					characters={characterRecords}
					onClose={() => {
						activeView = "home";
					}}
				/>
			{:else if activeView === "clocks"}
				<ClockDemo />
			{:else if activeView === "saves"}
				<SaveManagerPanel />
			{:else if activeView === "dialogue"}
				<DialoguePanel
					characters={characterRecords}
					characterClasses={characterSession.characterClasses}
					activeStatusEffects={activeStatusEffects}
					initialTreeId={activeDialogueTreeId}
					onClose={() => {
						activeView = "exploration";
					}}
				/>
			{:else if activeView === "bastion"}
				<BastionPanel
					characters={characterRecords}
					onEndRecess={handleGlobalEndRecess}
				/>
			{:else if activeView === "quests"}
				<QuestLogPanel />
			{:else if activeView === "camp"}
				<CampPanel 
					isRestBlocked={isRestBlocked}
					isInfectionBlocked={isNaturalRecoveryBlocked}
					characterName={infectedCharacterNames.length > 0 ? infectedCharacterNames.join(', ') : undefined}
					onRestSuccess={handleRestSuccess}
					rations={campRations}
					onConsumeRation={() => {
						if (campRations > 0) campRations--;
					}}
					fame={fame}
					bloodDebt={bloodDebt}
					dangerCounter={dangerCounter}
					characters={characterRecords}
					onUpdateFame={(val) => fame = val}
					onUpdateBloodDebt={(val) => bloodDebt = val}
					onUpdateDangerCounter={(val) => dangerCounter = val}
				/>
			{:else if activeView === "crafting"}
				<div class="flex flex-col gap-4">
					<!-- Alternador de Sub-Abas Premium da Oficina -->
					<div class="flex border-b border-bronze/30 pb-2 gap-2">
						<button
							type="button"
							class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all border
								{craftingSubTab === 'forge' 
									? 'bg-bronze border-ether/40 text-void font-extrabold shadow-[0_0_8px_rgba(168,120,50,0.15)]' 
									: 'bg-ruin border-bronze/35 text-bone/70 hover:border-bronze hover:text-bone'}"
							onclick={() => craftingSubTab = "forge"}
						>
							⚒️ Forja da Bigorna
						</button>
						<button
							type="button"
							class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all border
								{craftingSubTab === 'alchemy' 
									? 'bg-blood-shadow border-bronze text-ether font-extrabold shadow-[0_0_8px_rgba(26,15,15,0.25)]' 
									: 'bg-ruin border-bronze/35 text-bone/70 hover:border-bronze hover:text-bone'}"
							onclick={() => craftingSubTab = "alchemy"}
						>
							🧪 Farmácia Alquímica
						</button>
					</div>

					{#if craftingSubTab === "forge"}
						<CraftingWorkshopPanel 
							characters={characterRecords}
						/>
					{:else}
						<IllnessWorkshopPanel 
							characters={characterRecords}
							characterSession={characterSession}
							bind:activeStatusEffects={activeStatusEffects}
						/>
					{/if}
				</div>
			{:else if activeView === "domain_council"}
				<DomainCouncilPanel
					guildGold={guildGold}
					onUpdateGuildGold={(val) => guildGold = val}
				/>
			{:else if activeView === "mercenary"}
				<MercenaryCompanyPanel
					guildGold={guildGold}
					onUpdateGuildGold={(val) => guildGold = val}
				/>
			{:else if activeView === "espionage"}
				<EspionageManagementPanel
					bind:guildGold={guildGold}
					onUpdateGuildGold={(val) => guildGold = val}
					characters={characterRecords}
					characterSession={characterSession}
				/>
			{:else if activeView === "traps"}
				<TrapDeploymentPanel
					characters={characterRecords}
					currentTileId={activeTileId}
					trapRepository={trapRepository}
					characterSession={characterSession}
					onDeploySuccess={async () => {
						const res = await trapRepository.findByTileId(activeTileId);
						if (res.success) {
							const allTraps: TrapRecord[] = [];
							for (const tile of hexcrawlSession.tiles) {
								const tRes = await trapRepository.findByTileId(tile.id);
								if (tRes.success) {
									allTraps.push(...tRes.data);
								}
							}
							trapsList = allTraps;
						}
					}}
				/>
			{:else}
				<p class="max-w-3xl text-lg leading-8 text-bone">
					{activeItem.description}
				</p>
			{/if}
						</div>
					{/key}
				</section>
			</div>
		</div>
	</div>
</main>
