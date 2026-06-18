<script lang="ts">
import { onMount } from "svelte";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type {
	CharacterCreateInput,
	CharacterRecord,
	CharacterTraitSelectionRecord,
} from "$lib/entities/character";
import type { ClockRecord } from "$lib/entities/clock";
import type { EquipmentLoadoutEventRecord } from "$lib/entities/equipment";
import type { FactionStandingRecord } from "$lib/entities/faction";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import type { NpcRelationshipRecord } from "$lib/entities/npc-relationship";
import type {
	SocialEncounterEventRecord,
	SocialEncounterRecord,
} from "$lib/entities/social-encounter";
import type { WorldStateFlagView } from "$lib/entities/world-state";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CampHourPanel } from "$lib/features/camp-hour";
import {
	// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
	CharacterCreateForm,
	mapAncestryTraitSelectionFailure,
	mapCharacterCreateFailure,
} from "$lib/features/character-create";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CharacterList } from "$lib/features/character-list";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CombatEncounterPanel } from "$lib/features/combat-encounter";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { CompendiumBrowser } from "$lib/features/compendium-browser";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { HexcrawlMapPanel } from "$lib/features/hexcrawl-map";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { InventoryManagementPanel } from "$lib/features/inventory-management";
import {
	// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
	SaveLoadControls,
	type SaveLoadUiState,
} from "$lib/features/save-load";
import {
	// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
	SocialEncounterPanel,
	type SocialPressurePenaltyIntent,
} from "$lib/features/social-encounter";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SocialRelationsPanel } from "$lib/features/social-relations";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SpellCastPanel } from "$lib/features/spell-cast";
import { createCampSession } from "./model/campSession";
import { createCharacterSession } from "./model/characterSession";
import { createCombatEncounterSession } from "./model/combatEncounterSession";
import { createCombatPersistentLoadoutResolver } from "./model/combatPersistentLoadoutResolver";
import {
	createCombatPotionBeltConsumer,
	createCombatPotionBeltResolver,
} from "./model/combatPotionBeltBridge";
import { createCompendiumSession } from "./model/compendiumSession";
import { createHexcrawlSession } from "./model/hexcrawlSession";
import { createInventorySession } from "./model/inventorySession";
import type { AppNavigationId } from "./model/navigation";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { APP_NAVIGATION_ITEMS, getAppNavigationItem } from "./model/navigation";
import { registerPwaOfflineSupport } from "./model/pwaOfflineRegistration";
import {
	createPwaStatusView,
	type PwaOfflineStatus,
} from "./model/pwaStatusView";
import { createSaveLoadSession } from "./model/saveLoadSession";
import { createSocialEncounterSession } from "./model/socialEncounterSession";
import { applySocialPressurePenaltyIntent } from "./model/socialPressurePenaltySession";
import { createSocialRelationsSession } from "./model/socialRelationsSession";
import { createSpellCastSession } from "./model/spellCastSession";

const characterSession = createCharacterSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const characterAncestryTraits = Object.values(
	characterSession.traitsByAncestryId,
).flat();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const campSession = createCampSession();
const combatEncounterSession = createCombatEncounterSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const compendiumSession = createCompendiumSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const hexcrawlSession = createHexcrawlSession();
const inventorySession = createInventorySession(characterSession.repository);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const spellCastSession = createSpellCastSession();
const saveLoadSession = createSaveLoadSession();
const socialEncounterSession = createSocialEncounterSession();
const socialRelationsSession = createSocialRelationsSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const resolveCombatPersistentLoadout = createCombatPersistentLoadoutResolver({
	buildEquipmentLoadout: combatEncounterSession.buildEquipmentLoadout,
	inventoryService: inventorySession.service,
});
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const resolveCombatPotionBelt = createCombatPotionBeltResolver({
	inventoryService: inventorySession.service,
});

let activeView = $state<AppNavigationId>("home");
let campAssignmentRecords = $state<CampAssignmentRecord[]>([]);
let campSessionRecords = $state<CampSessionRecord[]>([]);
let characterRecords = $state<CharacterRecord[]>([]);
let characterTraitSelectionRecords = $state<CharacterTraitSelectionRecord[]>(
	[],
);
let clockRecords = $state<ClockRecord[]>([]);
let factionStandingRecords = $state<FactionStandingRecord[]>(
	socialRelationsSession.createInitialStandings(),
);
let equipmentLoadoutEventRecords = $state<EquipmentLoadoutEventRecord[]>([]);
let inventoryEventRecords = $state<InventoryEventRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const consumeCombatPotionBelt = createCombatPotionBeltConsumer({
	getInventoryEvents: () => inventoryEventRecords,
	inventoryService: inventorySession.service,
	onInventoryEventsChange: (records) => {
		inventoryEventRecords = [...records];
	},
});
let npcRelationshipRecords = $state<NpcRelationshipRecord[]>([]);
let socialEncounterRecords = $state<SocialEncounterRecord[]>([]);
let socialEncounterEventRecords = $state<SocialEncounterEventRecord[]>([]);
let worldStateRecords = $state<WorldStateFlagView[]>([]);
let pwaOfflineStatus = $state<PwaOfflineStatus>({ kind: "checking" });
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let saveLoadState = $state<SaveLoadUiState>({ kind: "initializing" });
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let characterCreateError = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let characterCreateSuccess = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isCreatingCharacter = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeItem = $derived(getAppNavigationItem(activeView));
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let pwaStatusView = $derived(createPwaStatusView(pwaOfflineStatus));
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let factionFameLevelsByNpcId = $derived(
	createFactionFameLevelsByNpcId(
		socialEncounterSession.npcs,
		factionStandingRecords,
	),
);

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

	const persistedTraits = await characterSession.createTraitSelections({
		characterId: result.data.id,
		ancestryId: input.ancestryId,
		traitIds: ancestryTraitIds,
	});
	if (!persistedTraits.success) {
		characterCreateError =
			"NÃ£o foi possÃ­vel salvar os traÃ§os do personagem nesta sessÃ£o.";
		characterCreateSuccess = null;
		return false;
	}

	characterRecords = [...characterRecords, result.data];
	characterTraitSelectionRecords = [
		...characterTraitSelectionRecords,
		...persistedTraits.data,
	];
	characterCreateError = null;
	characterCreateSuccess = `${result.data.name} foi criado e adicionado à lista.`;
	return true;
}

async function initializeSaveLoad(): Promise<void> {
	const initialized = await saveLoadSession.initializeDatabase();
	saveLoadState = initialized.success
		? { kind: "ready" }
		: { kind: "error", message: "Não foi possível preparar o save local." };
}

async function initializePwaOfflineSupport(): Promise<void> {
	const registered = await registerPwaOfflineSupport();
	if (registered.success) {
		pwaOfflineStatus = registered.data;
		return;
	}

	pwaOfflineStatus =
		registered.error.code === "SERVICE_WORKER_UNSUPPORTED"
			? { kind: "unsupported" }
			: { kind: "failed" };
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function saveSession(): Promise<void> {
	saveLoadState = { kind: "saving" };
	const result = await saveLoadSession.service.saveSession({
		characters: characterRecords,
		characterTraitSelections: characterTraitSelectionRecords,
		worldState: worldStateRecords,
		clocks: clockRecords,
		campSessions: campSessionRecords,
		campAssignments: campAssignmentRecords,
		factionStandings: factionStandingRecords,
		socialEncounters: socialEncounterRecords,
		socialEncounterEvents: socialEncounterEventRecords,
		npcRelationships: npcRelationshipRecords,
		inventoryEvents: inventoryEventRecords,
		equipmentLoadoutEvents: equipmentLoadoutEventRecords,
		savedAt: new Date().toISOString(),
	});

	saveLoadState = result.success
		? { kind: "saved" }
		: { kind: "error", message: "Não foi possível salvar a sessão." };
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function loadSession(): Promise<void> {
	saveLoadState = { kind: "loading" };
	const result = await saveLoadSession.service.loadSession();
	if (!result.success) {
		saveLoadState = {
			kind: "error",
			message: "Não foi possível carregar o save local.",
		};
		return;
	}

	const restored = characterSession.restoreRecords(result.data.characters);
	if (!restored.success) {
		saveLoadState = {
			kind: "error",
			message: "O save local contém personagens inválidos.",
		};
		return;
	}
	const restoredTraitSelections = characterSession.restoreTraitSelections(
		result.data.characterTraitSelections,
	);
	if (!restoredTraitSelections.success) {
		saveLoadState = {
			kind: "error",
			message: "O save local contÃ©m traÃ§os de personagem invÃ¡lidos.",
		};
		return;
	}
	const restoredInventory = inventorySession.restoreEvents(
		result.data.inventoryEvents,
	);
	if (!restoredInventory.success) {
		saveLoadState = {
			kind: "error",
			message: "O save local contém um inventário inválido.",
		};
		return;
	}
	const restoredLoadout = inventorySession.restoreLoadoutEvents(
		result.data.equipmentLoadoutEvents,
	);
	if (!restoredLoadout.success) {
		saveLoadState = {
			kind: "error",
			message: "O save local contÃ©m equipamento invÃ¡lido.",
		};
		return;
	}

	characterRecords = [...restored.data];
	characterTraitSelectionRecords = [...restoredTraitSelections.data];
	worldStateRecords = [...result.data.worldState];
	clockRecords = [...result.data.clocks];
	campSessionRecords = [...result.data.campSessions];
	campAssignmentRecords = [...result.data.campAssignments];
	factionStandingRecords = socialRelationsSession.normalizeStandings(
		result.data.factionStandings,
	);
	socialEncounterRecords = [...result.data.socialEncounters];
	socialEncounterEventRecords = [...result.data.socialEncounterEvents];
	npcRelationshipRecords = [...result.data.npcRelationships];
	inventoryEventRecords = [...restoredInventory.data];
	equipmentLoadoutEventRecords = [...restoredLoadout.data];
	saveLoadState = { kind: "loaded" };
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function applySocialPressurePenalty(
	intent: SocialPressurePenaltyIntent,
): Promise<void> {
	const result = await applySocialPressurePenaltyIntent({
		clocks: clockRecords,
		factions: socialRelationsSession.factions,
		intent,
		factionStandings: factionStandingRecords,
		gainInfamy: socialRelationsSession.gainInfamy,
		loseFame: socialRelationsSession.loseFame,
		npcRelationships: npcRelationshipRecords,
		npcs: socialEncounterSession.npcs,
		worldState: worldStateRecords,
	});
	if (!result.success) {
		return;
	}

	clockRecords = [...result.data.clocks];
	factionStandingRecords = [...result.data.factionStandings];
	npcRelationshipRecords = [...result.data.npcRelationships];
	worldStateRecords = [...result.data.worldState];
}

function createFactionFameLevelsByNpcId(
	npcs: readonly { readonly id: string; readonly factionId: string }[],
	standings: readonly FactionStandingRecord[],
): Readonly<Record<string, number>> {
	const fameByFactionId = new Map(
		standings.map((standing) => [standing.factionId, standing.fameLevel]),
	);
	return Object.fromEntries(
		npcs.map((npc) => [npc.id, fameByFactionId.get(npc.factionId) ?? 0]),
	);
}

onMount(() => {
	void initializeSaveLoad();
	void initializePwaOfflineSupport();
});
</script>

<main
	aria-labelledby="pandorha-title"
	class="min-h-screen bg-void text-bone"
>
	<div
		class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 lg:px-10"
	>
		<header class="border-b border-ether pb-6">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-sm font-semibold text-ether">Pandorha Engine</p>
				<p
					aria-live="polite"
					class="border border-bronze bg-blood-shadow px-3 py-2 text-sm font-semibold"
					class:text-ether={pwaStatusView.tone === "ready"}
					class:text-bone={pwaStatusView.tone === "pending"}
					class:text-bronze={pwaStatusView.tone === "warning"}
					data-testid="pwa-status"
				>
					{pwaStatusView.label}
				</p>
			</div>
			<h1
				id="pandorha-title"
				class="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-bone sm:text-5xl"
			>
				{activeItem.heading}
			</h1>
		</header>

		<nav aria-label="Navegação principal" class="mt-6 flex flex-wrap gap-2">
			{#each APP_NAVIGATION_ITEMS as item}
				<button
					type="button"
					aria-current={activeView === item.id ? "page" : undefined}
					class={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether ${
						activeView === item.id
							? "border-ether bg-ether text-void hover:text-void"
							: "border-bronze bg-ruin text-bone hover:text-ether"
					}`}
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
				<div class="space-y-6">
					<SaveLoadControls
						onLoad={loadSession}
						onSave={saveSession}
						state={saveLoadState}
					/>
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
							ancestryTraits={characterAncestryTraits}
							backgrounds={characterSession.backgrounds}
							characterClasses={characterSession.characterClasses}
							records={characterRecords}
							traitSelections={characterTraitSelectionRecords}
						/>
					</div>
				</div>
			{:else if activeView === "compendium"}
				<CompendiumBrowser
					searchEntries={(input) =>
						compendiumSession.searchService.searchEntries(input)}
				/>
			{:else if activeView === "inventory"}
				<InventoryManagementPanel
					characters={characterRecords}
					consumables={inventorySession.consumables}
					equipment={inventorySession.equipment}
					equipmentLoadoutEvents={equipmentLoadoutEventRecords}
					inventoryEvents={inventoryEventRecords}
					onEventsChange={(records) => {
						inventoryEventRecords = [...records];
					}}
					onLoadoutEventsChange={(records) => {
						equipmentLoadoutEventRecords = [...records];
					}}
					onOpenCharacters={() => {
						activeView = "characters";
					}}
					service={inventorySession.service}
				/>
			{:else if activeView === "exploration"}
				<HexcrawlMapPanel
					createMovementInput={hexcrawlSession.createMovementInput}
					initialTileId={hexcrawlSession.initialTileId}
					moveParty={hexcrawlSession.moveParty}
					tiles={hexcrawlSession.tiles}
				/>
			{:else if activeView === "camp"}
				<CampHourPanel
					activities={campSession.activities}
					campAssignments={campAssignmentRecords}
					campSessions={campSessionRecords}
					characters={characterRecords}
					clocks={clockRecords}
					createInitialState={campSession.createInitialState}
					onStateChange={(state) => {
						clockRecords = [...state.clocks];
						campSessionRecords = [...state.campSessions];
						campAssignmentRecords = [...state.campAssignments];
					}}
					resolveHour={campSession.resolveHour}
				/>
			{:else if activeView === "relations"}
				<div class="space-y-6">
					<SaveLoadControls
						onLoad={loadSession}
						onSave={saveSession}
						state={saveLoadState}
					/>
					<SocialRelationsPanel
						clocks={clockRecords}
						factions={socialRelationsSession.factions}
						invokeTierOneFavor={socialRelationsSession.invokeTierOneFavor}
						npcRelationships={npcRelationshipRecords}
						npcs={socialEncounterSession.npcs}
						onStandingsChange={(standings) => {
							factionStandingRecords = [...standings];
						}}
						redeemTierOneDebt={socialRelationsSession.redeemTierOneDebt}
						standings={factionStandingRecords}
					/>
					<SocialEncounterPanel
						characters={characterRecords}
						createAppealInput={socialEncounterSession.createAppealInput}
						createAppealResolutionInput={socialEncounterSession.createAppealResolutionInput}
						createStartInput={socialEncounterSession.createStartInput}
						dialogueChoices={socialEncounterSession.dialogueChoices}
						dialogueNodes={socialEncounterSession.dialogueNodes}
						dialogueOptions={socialEncounterSession.dialogueOptions}
						encounterEvents={socialEncounterEventRecords}
						encounters={socialEncounterRecords}
						factionFameLevelsByNpcId={factionFameLevelsByNpcId}
						npcs={socialEncounterSession.npcs}
						onRecordsChange={(records) => {
							socialEncounterRecords = [...records.socialEncounters];
							socialEncounterEventRecords = [
								...records.socialEncounterEvents,
							];
						}}
						onSocialPressurePenalty={applySocialPressurePenalty}
						onWorldStateChange={(records) => {
							worldStateRecords = [...records];
						}}
						resolveAppeal={(input) =>
							socialEncounterSession.service.resolveAppeal(input)}
						resolveAppealOutcome={(input) =>
							socialEncounterSession.appealResolutionService.resolveAppealOutcome(input)}
						selectDialogueTreeOption={(input) =>
							socialEncounterSession.dialogueTraversalService.selectOption(input)}
						startEncounter={(input) =>
							socialEncounterSession.service.startEncounter(input)}
						worldState={worldStateRecords}
					/>
				</div>
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
					createAttackInput={combatEncounterSession.createAttackInput}
					initialTarget={combatEncounterSession.initialTarget}
					onOpenInventory={() => {
						activeView = "inventory";
					}}
					consumePotionBelt={consumeCombatPotionBelt}
					resolvePersistentLoadout={resolveCombatPersistentLoadout}
					resolvePotionBelt={resolveCombatPotionBelt}
					resolveAttack={(input) =>
						combatEncounterSession.service.resolveAttack(input)}
					resolveTrainingEnemyAttack={(input) =>
						combatEncounterSession.trainingEnemyAttackService.resolveTrainingEnemyAttack(
							input,
						)}
					trainingTargets={combatEncounterSession.trainingTargets}
				/>
			{:else}
				<p class="max-w-3xl text-lg leading-8 text-bone">
					{activeItem.description}
				</p>
			{/if}
		</section>
	</div>
</main>
