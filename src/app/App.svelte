<script lang="ts">
import { onMount } from "svelte";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type {
	CharacterCreateInput,
	CharacterRecord,
} from "$lib/entities/character";
import type { ClockRecord } from "$lib/entities/clock";
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
import { InventoryReadOnlyPanel } from "$lib/features/inventory-readonly";
import {
	// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
	SaveLoadControls,
	type SaveLoadUiState,
} from "$lib/features/save-load";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { SpellCastPanel } from "$lib/features/spell-cast";
import { createCampSession } from "./model/campSession";
import { createCharacterSession } from "./model/characterSession";
import { createCombatEncounterSession } from "./model/combatEncounterSession";
import { createCompendiumSession } from "./model/compendiumSession";
import { createHexcrawlSession } from "./model/hexcrawlSession";
import { createInventorySession } from "./model/inventorySession";
import type { AppNavigationId } from "./model/navigation";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { APP_NAVIGATION_ITEMS, getAppNavigationItem } from "./model/navigation";
import { createSaveLoadSession } from "./model/saveLoadSession";
import { createSpellCastSession } from "./model/spellCastSession";

const characterSession = createCharacterSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const campSession = createCampSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const combatEncounterSession = createCombatEncounterSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const compendiumSession = createCompendiumSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const hexcrawlSession = createHexcrawlSession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const inventorySession = createInventorySession();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const spellCastSession = createSpellCastSession();
const saveLoadSession = createSaveLoadSession();

let activeView = $state<AppNavigationId>("home");
let campAssignmentRecords = $state<CampAssignmentRecord[]>([]);
let campSessionRecords = $state<CampSessionRecord[]>([]);
let characterRecords = $state<CharacterRecord[]>([]);
let clockRecords = $state<ClockRecord[]>([]);
let worldStateRecords = $state<WorldStateFlagView[]>([]);
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

async function initializeSaveLoad(): Promise<void> {
	const initialized = await saveLoadSession.initializeDatabase();
	saveLoadState = initialized.success
		? { kind: "ready" }
		: { kind: "error", message: "Não foi possível preparar o save local." };
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function saveSession(): Promise<void> {
	saveLoadState = { kind: "saving" };
	const result = await saveLoadSession.service.saveSession({
		characters: characterRecords,
		worldState: worldStateRecords,
		clocks: clockRecords,
		campSessions: campSessionRecords,
		campAssignments: campAssignmentRecords,
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

	characterRecords = [...restored.data];
	worldStateRecords = [...result.data.worldState];
	clockRecords = [...result.data.clocks];
	campSessionRecords = [...result.data.campSessions];
	campAssignmentRecords = [...result.data.campAssignments];
	saveLoadState = { kind: "loaded" };
}

onMount(() => {
	void initializeSaveLoad();
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
			<p class="text-sm font-semibold text-ether">Pandorha Engine</p>
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
							backgrounds={characterSession.backgrounds}
							characterClasses={characterSession.characterClasses}
							records={characterRecords}
						/>
					</div>
				</div>
			{:else if activeView === "compendium"}
				<CompendiumBrowser
					searchEntries={(input) =>
						compendiumSession.searchService.searchEntries(input)}
				/>
			{:else if activeView === "inventory"}
				<InventoryReadOnlyPanel
					capacity={inventorySession.capacity}
					items={inventorySession.items}
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
					resolveAttack={(input) =>
						combatEncounterSession.service.resolveAttack(input)}
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
