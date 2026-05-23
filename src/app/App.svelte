<script lang="ts">
import { onMount } from "svelte";
import type {
	CharacterCreateInput,
	CharacterRecord,
} from "$lib/entities/character";
import {
	BaseCharacterStats,
	EterFeverDecorator,
	type ICharacterStats,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import { InMemorySocialRepository } from "$lib/entities/social";
import type {
	NewTrapRecord,
	TrapDowntimeCharacterService,
	TrapRecord,
} from "$lib/entities/traps";
import { SessionTrapRepository, TrapService } from "$lib/entities/traps";
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
import { HexcrawlMapPanel } from "$lib/features/hexcrawl-map";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { InventoryReadOnlyPanel } from "$lib/features/inventory-readonly";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { QuestLogPanel } from "$lib/features/quests";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SocialDemo } from "$lib/features/social";
import { SocialStandingService } from "$lib/features/social/domain/SocialStandingService";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SpellCastPanel } from "$lib/features/spell-cast";
import { createCharacterListView } from "../features/character-list/model/characterListView";
import { createCharacterSession } from "./model/characterSession";
import { createCombatEncounterSession } from "./model/combatEncounterSession";
import { createCompendiumSession } from "./model/compendiumSession";
import { createHexcrawlSession } from "./model/hexcrawlSession";
import { createInventorySession } from "./model/inventorySession";
import type { AppNavigationId } from "./model/navigation";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { APP_NAVIGATION_ITEMS, getAppNavigationItem } from "./model/navigation";
import { createSpellCastSession } from "./model/spellCastSession";

const trapRepository = new SessionTrapRepository();
const trapService = new TrapService();

const characterSession = createCharacterSession();
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
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const spellCastSession = createSpellCastSession();

let activeView = $state<AppNavigationId>("home");
let campRations = $state(3);

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

const socialRepository = new InMemorySocialRepository();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const socialStandingService = new SocialStandingService(socialRepository);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isRestBlocked = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let fame = $state(2);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let bloodDebt = $state(3);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let dangerCounter = $state(15);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleSocialStandingChange(blocked: boolean) {
	isRestBlocked = blocked;
}
let characterRecords = $state<CharacterRecord[]>([]);
let activeStatusEffects = $state<CharacterStatusEffectRecord[]>([]);
let trapsList = $state<TrapRecord[]>([]);
let activeTileId = $state(hexcrawlSession.initialTileId);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let currentTraps = $derived(trapsList.filter((t) => t.tileId === activeTileId));

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
			console.log(detectRes.data.log);

			if (detectRes.data.isDetected) {
				trapsList = trapsList.map((t) =>
					t.id === trap.id ? { ...t, isDetected: true } : t,
				);
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
					console.log(triggerRes.data.log);
					trapsList = trapsList.map((t) =>
						t.id === trap.id
							? { ...t, isDetected: true, isTriggered: true }
							: t,
					);
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

		console.log(
			`⚠️ Perigo Ambiental! ${targetChar.name} falhou no teste de Vigor (d20: ${roll} vs CD: ${dc}) e contraiu ${effectType === "eter_fever" ? "Febre de Éter" : "Veneno de Víbora"} no bioma ${biome}!`,
		);
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
		console.log(res.data.log);

		if (res.data.isDetected) {
			trapsList = trapsList.map((t) =>
				t.id === trapId ? { ...t, isDetected: true } : t,
			);
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
				console.log(triggerRes.data.log);
				trapsList = trapsList.map((t) =>
					t.id === trapId ? { ...t, isDetected: true, isTriggered: true } : t,
				);
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
		console.log(res.data.log);

		if (res.data.isDisarmed) {
			trapsList = trapsList.map((t) =>
				t.id === trapId ? { ...t, isDisarmed: true } : t,
			);
		} else {
			trapsList = trapsList.map((t) =>
				t.id === trapId ? { ...t, isTriggered: true } : t,
			);
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

	window.addEventListener("online", updateOnlineStatus);
	window.addEventListener("offline", updateOnlineStatus);

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
		const res = await trapRepository.save(trap);
		if (res.success) {
			trapsList.push(res.data);
		}
	}

	return () => {
		window.removeEventListener("online", updateOnlineStatus);
		window.removeEventListener("offline", updateOnlineStatus);
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
	class="min-h-screen bg-void text-bone"
>
	<div
		class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 lg:px-10"
	>
		<header class="border-b border-ether pb-6 flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-semibold text-ether">Pandorha Engine</p>
				<h1
					id="pandorha-title"
					class="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-bone sm:text-5xl"
				>
					{activeItem.heading}
				</h1>
			</div>
			<div class="flex items-center gap-2 shrink-0">
				{#if isOnline}
					<span class="inline-flex items-center gap-1.5 rounded-full border border-ether/40 bg-ruin px-3 py-1 text-xs font-semibold text-ether transition-all duration-300">
						<span class="h-2 w-2 rounded-full bg-ether animate-pulse"></span>
						ONLINE
					</span>
				{:else}
					<span class="inline-flex items-center gap-1.5 rounded-full border border-bronze bg-ruin px-3 py-1 text-xs font-semibold text-bronze transition-all duration-300">
						<span class="h-2 w-2 rounded-full bg-bronze"></span>
						MODO OFFLINE
					</span>
				{/if}
			</div>
		</header>

		<nav aria-label="Navegação principal" class="mt-6 flex flex-wrap gap-2">
			{#each APP_NAVIGATION_ITEMS as item}
				<button
					type="button"
					aria-current={activeView === item.id ? "page" : undefined}
					class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
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

		<section
			aria-live="polite"
			class="mt-8 rounded-lg border border-bronze bg-ruin p-6 sm:p-8"
		>
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
						onApplyStatusEffect={handleApplyStatusEffect}
						onClearStatusEffects={handleClearStatusEffects}
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
					caster={spellCastSession.caster}
					createCastInput={spellCastSession.createCastInput}
					spells={spellCastSession.spells}
					target={spellCastSession.target}
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
			{:else if activeView === "clocks"}
				<ClockDemo />
			{:else if activeView === "saves"}
				<SaveManagerPanel />
			{:else if activeView === "dialogue"}
				<DialoguePanel
					characters={characterRecords}
					characterClasses={characterSession.characterClasses}
					activeStatusEffects={activeStatusEffects}
				/>
			{:else if activeView === "bastion"}
				<BastionPanel
					characters={characterRecords}
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
						/>
					{/if}
				</div>
			{:else}
				<p class="max-w-3xl text-lg leading-8 text-bone">
					{activeItem.description}
				</p>
			{/if}
		</section>
	</div>
</main>
