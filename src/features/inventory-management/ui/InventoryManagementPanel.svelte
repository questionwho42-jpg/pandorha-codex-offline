<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import type {
	ConsumableRecord,
	EquipmentRecord,
} from "$lib/entities/equipment";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import type { Result } from "$lib/shared/lib/result";
import type { InventoryManagementService } from "../domain/InventoryManagementService";
import type {
	InventoryManagementFailure,
	InventoryManagementMutationResult,
	InventoryManagementSnapshot,
} from "../model/inventoryManagementTypes";
import { createInventoryManagementView } from "../model/inventoryManagementView";

type InventoryMutation = () => Promise<
	Result<InventoryManagementMutationResult, InventoryManagementFailure>
>;

type Props = {
	characters?: readonly CharacterRecord[];
	consumables?: readonly ConsumableRecord[];
	equipment?: readonly EquipmentRecord[];
	inventoryEvents?: readonly InventoryEventRecord[];
	onEventsChange: (records: readonly InventoryEventRecord[]) => void;
	onOpenCharacters: () => void;
	service: InventoryManagementService;
};

let {
	characters = [],
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	consumables = [],
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	equipment = [],
	inventoryEvents = [],
	onEventsChange,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	onOpenCharacters,
	service,
}: Props = $props();

let selectedCharacterId = $state<string | null>(null);
let snapshot = $state<InventoryManagementSnapshot | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let errorMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let busyAction = $state<string | null>(null);
let refreshSequence = 0;

let _inventorySignature = $derived(
	inventoryEvents
		.map((event) => `${event.id}:${event.sequence}:${event.quantity}`)
		.join("|"),
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let selectedCharacter = $derived(
	characters.find((character) => character.id === selectedCharacterId) ?? null,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(snapshot ? createInventoryManagementView(snapshot) : null);

$effect(() => {
	_inventorySignature;
	const nextCharacterId = characters.some(
		(character) => character.id === selectedCharacterId,
	)
		? selectedCharacterId
		: (characters[0]?.id ?? null);
	selectedCharacterId = nextCharacterId;
	if (nextCharacterId) {
		void refreshInventory(nextCharacterId);
		return;
	}
	snapshot = null;
	errorMessage = null;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectCharacter(event: Event): void {
	selectedCharacterId = (event.currentTarget as HTMLSelectElement).value;
}

async function refreshInventory(characterId: string): Promise<void> {
	const sequence = refreshSequence + 1;
	refreshSequence = sequence;
	const result = await service.getInventory({ characterId });
	if (sequence !== refreshSequence) {
		return;
	}
	if (!result.success) {
		snapshot = null;
		errorMessage =
			"Não foi possível reconstruir o inventário deste personagem.";
		return;
	}
	snapshot = result.data;
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function addEquipment(catalogItemId: string): Promise<void> {
	if (!selectedCharacterId) {
		return;
	}
	await runMutation(`equipment:${catalogItemId}`, () =>
		service.addEquipment({
			characterId: selectedCharacterId,
			catalogItemId,
		}),
	);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function addConsumable(catalogItemId: string): Promise<void> {
	if (!selectedCharacterId) {
		return;
	}
	await runMutation(`consumable:${catalogItemId}`, () =>
		service.addConsumable({
			characterId: selectedCharacterId,
			catalogItemId,
			quantity: 1,
		}),
	);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function consumeConsumable(entryId: string): Promise<void> {
	if (!selectedCharacterId) {
		return;
	}
	await runMutation(`consume:${entryId}`, () =>
		service.consumeConsumable({
			characterId: selectedCharacterId,
			entryId,
			quantity: 1,
		}),
	);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function removeEntry(entryId: string): Promise<void> {
	if (!selectedCharacterId) {
		return;
	}
	await runMutation(`remove:${entryId}`, () =>
		service.removeEntry({
			characterId: selectedCharacterId,
			entryId,
		}),
	);
}

async function runMutation(
	actionId: string,
	mutate: InventoryMutation,
): Promise<void> {
	busyAction = actionId;
	const result = await mutate();
	busyAction = null;
	if (!result.success) {
		errorMessage = "A alteração do inventário não pôde ser concluída.";
		return;
	}
	snapshot = result.data.inventory;
	onEventsChange([...inventoryEvents, ...result.data.appendedEvents]);
	errorMessage = null;
}
</script>

<section aria-labelledby="inventory-management-title" data-testid="inventory-panel">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Inventário</p>
			<h2
				id="inventory-management-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Carga por personagem
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Carregue itens do catálogo e acompanhe a capacidade derivada.
			</p>
		</div>

		{#if characters.length > 0}
			<label class="block min-w-64">
				<span class="text-sm font-semibold text-ether">Personagem</span>
				<select
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					data-testid="inventory-character-select"
					onchange={selectCharacter}
					value={selectedCharacterId ?? ""}
				>
					{#each characters as character (character.id)}
						<option value={character.id}>{character.name}</option>
					{/each}
				</select>
			</label>
		{/if}
	</div>

	{#if characters.length === 0}
		<div
			class="mt-6 border border-bronze bg-blood-shadow px-5 py-6"
			data-testid="inventory-character-empty-state"
		>
			<h3 class="text-lg font-semibold text-bone">Nenhum personagem disponível</h3>
			<p class="mt-3 leading-7 text-bone">
				Crie um personagem antes de organizar itens carregados.
			</p>
			<button
				type="button"
				class="mt-5 border border-ether bg-ether px-4 py-2 font-semibold text-void hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
				data-testid="inventory-open-characters"
				onclick={onOpenCharacters}
			>
				Abrir Personagens
			</button>
		</div>
	{:else}
		{#if errorMessage}
			<p
				class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
				data-testid="inventory-error"
			>
				{errorMessage}
			</p>
		{/if}

		{#if view && selectedCharacter}
			<div class="mt-6 grid gap-3 md:grid-cols-3">
				<div class="border border-bronze bg-blood-shadow px-4 py-3">
					<p class="text-sm font-semibold text-ether">Slots</p>
					<p class="mt-1 text-lg font-semibold text-bone" data-testid="inventory-slot-usage">
						{view.slotUsageLabel}
					</p>
				</div>
				<div class="border border-bronze bg-blood-shadow px-4 py-3">
					<p class="text-sm font-semibold text-ether">Estado</p>
					<p class="mt-1 text-lg font-semibold text-bone" data-testid="inventory-state">
						{view.stateLabel}
					</p>
				</div>
				<div class="border border-bronze bg-blood-shadow px-4 py-3">
					<p class="text-sm font-semibold text-ether">Movimento</p>
					<p class="mt-1 text-lg font-semibold text-bone" data-testid="inventory-movement">
						{view.movementLabel}
					</p>
				</div>
			</div>

			<p class="mt-4 leading-7 text-bone" data-testid="inventory-state-description">
				{view.stateDescription}
			</p>

			<div class="mt-7 grid gap-7 xl:grid-cols-2">
				<section aria-labelledby="inventory-catalog-title">
					<div class="flex items-end justify-between gap-3">
						<h3 id="inventory-catalog-title" class="text-lg font-semibold text-bone">
							Catálogo disponível
						</h3>
						<p class="text-sm font-semibold text-ether">
							{equipment.length + consumables.length} itens
						</p>
					</div>
					<ul class="mt-4 divide-y divide-bronze border-y border-bronze" data-testid="inventory-catalog-list">
						{#each equipment as item (item.id)}
							<li class="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
								<div>
									<p class="font-semibold text-bone">{item.label}</p>
									<p class="mt-1 text-sm text-ether">Equipamento · {item.slotCost} slots</p>
								</div>
								<button
									type="button"
									class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone hover:border-ether hover:text-ether disabled:cursor-wait disabled:opacity-60"
									data-testid="inventory-add-equipment"
									disabled={busyAction !== null}
									onclick={() => void addEquipment(item.id)}
								>
									Carregar
								</button>
							</li>
						{/each}
						{#each consumables as item (item.id)}
							<li class="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
								<div>
									<p class="font-semibold text-bone">{item.label}</p>
									<p class="mt-1 text-sm text-ether">Consumível · pilha até {item.maxQuantityPerStack}</p>
								</div>
								<button
									type="button"
									class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone hover:border-ether hover:text-ether disabled:cursor-wait disabled:opacity-60"
									data-testid="inventory-add-consumable"
									disabled={busyAction !== null}
									onclick={() => void addConsumable(item.id)}
								>
									Carregar 1
								</button>
							</li>
						{/each}
					</ul>
				</section>

				<section aria-labelledby="inventory-carried-title">
					<div class="flex items-end justify-between gap-3">
						<h3 id="inventory-carried-title" class="text-lg font-semibold text-bone">
							Itens carregados
						</h3>
						<p class="text-sm font-semibold text-ether" data-testid="inventory-count">
							{view.itemCountLabel}
						</p>
					</div>
					{#if view.entries.length === 0}
						<div class="mt-4 border border-bronze bg-blood-shadow px-5 py-6" data-testid="inventory-item-empty-state">
							<p class="leading-7 text-bone">Este personagem ainda não carrega itens.</p>
						</div>
					{:else}
						<ul class="mt-4 divide-y divide-bronze border-y border-bronze" data-testid="inventory-item-list">
							{#each view.entries as entry (entry.entryId)}
								<li class="py-4" data-testid="inventory-item">
									<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div>
											<p class="font-semibold text-bone">{entry.label}</p>
											<p class="mt-1 text-sm text-ether">
												{entry.categoryLabel} · {entry.quantityLabel} · {entry.slotCost} slots
											</p>
										</div>
										<div class="flex flex-wrap gap-2">
											{#if entry.catalogKind === "consumable"}
												<button
													type="button"
													class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone hover:border-ether hover:text-ether disabled:cursor-wait disabled:opacity-60"
													data-testid="inventory-increment-consumable"
													disabled={busyAction !== null}
													onclick={() => void addConsumable(entry.catalogItemId)}
												>
													+1
												</button>
												<button
													type="button"
													class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone hover:border-ether hover:text-ether disabled:cursor-wait disabled:opacity-60"
													data-testid="inventory-consume-consumable"
													disabled={busyAction !== null}
													onclick={() => void consumeConsumable(entry.entryId)}
												>
													Consumir 1
												</button>
											{/if}
											<button
												type="button"
												class="border border-bronze bg-ruin px-3 py-2 text-sm font-semibold text-bone hover:border-ether hover:text-ether disabled:cursor-wait disabled:opacity-60"
												data-testid="inventory-remove-entry"
												disabled={busyAction !== null}
												onclick={() => void removeEntry(entry.entryId)}
											>
												Remover
											</button>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		{/if}
	{/if}
</section>
