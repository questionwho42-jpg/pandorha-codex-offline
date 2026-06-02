<script lang="ts">
import type {
	AncestryRecord,
	AncestryTraitRecord,
} from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterCreateInput } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import {
	changeCharacterDraftAncestry,
	createDefaultCharacterCreateDraft,
	toCharacterCreateInput,
	toggleCharacterDraftTrait,
} from "../model/characterCreateView";

type TraitsByAncestryId = Readonly<
	Record<string, readonly AncestryTraitRecord[]>
>;

type Props = {
	ancestries: readonly AncestryRecord[];
	backgrounds: readonly BackgroundRecord[];
	characterClasses: readonly CharacterClassRecord[];
	errorMessage?: string | null;
	isSubmitting?: boolean;
	onCreate: (
		input: CharacterCreateInput,
		ancestryTraitIds: readonly string[],
	) => boolean | Promise<boolean>;
	successMessage?: string | null;
	traitsByAncestryId: TraitsByAncestryId;
};

let {
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	ancestries,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	backgrounds,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	characterClasses,
	errorMessage: _errorMessage = null,
	isSubmitting: _isSubmitting = false,
	onCreate,
	successMessage: _successMessage = null,
	traitsByAncestryId,
}: Props = $props();

let draft = $state(createDefaultCharacterCreateDraft());
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let availableAncestryTraits = $derived(
	traitsByAncestryId[draft.ancestryId] ?? [],
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let selectedTraitCount = $derived(draft.ancestryTraitIds.length);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function submitCharacter(event: SubmitEvent): Promise<void> {
	event.preventDefault();
	const created = await onCreate(
		toCharacterCreateInput(draft),
		draft.ancestryTraitIds,
	);

	if (created) {
		draft = createDefaultCharacterCreateDraft();
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectAncestry(event: Event): void {
	const ancestryId = (event.currentTarget as HTMLSelectElement).value;
	const traitIds = (traitsByAncestryId[ancestryId] ?? []).map(
		(trait) => trait.id,
	);
	draft = changeCharacterDraftAncestry(draft, ancestryId, traitIds);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function toggleAncestryTrait(event: Event, traitId: string): void {
	const checked = (event.currentTarget as HTMLInputElement).checked;
	draft = toggleCharacterDraftTrait(draft, traitId, checked);
}
</script>

<section aria-labelledby="character-create-title" data-testid="character-create">
	<div>
		<p class="text-sm font-semibold text-ether">Novo personagem</p>
		<h2
			id="character-create-title"
			class="mt-2 text-2xl font-semibold text-bone"
		>
			Criar personagem
		</h2>
		<p class="mt-3 leading-7 text-bone">
			Distribua 6 pontos entre os Eixos e 6 pontos entre as Aplicações.
		</p>
	</div>

	<form class="mt-6 space-y-5" data-testid="character-create-form" onsubmit={submitCharacter}>
		<div class="grid gap-4 md:grid-cols-2">
			<label class="block">
				<span class="text-sm font-semibold text-ether">Nome</span>
				<input
					type="text"
					bind:value={draft.name}
					data-testid="character-name-input"
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					autocomplete="off"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-semibold text-ether">Conceito</span>
				<input
					type="text"
					bind:value={draft.concept}
					data-testid="character-concept-input"
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					autocomplete="off"
				/>
			</label>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<label class="block">
				<span class="text-sm font-semibold text-ether">Ancestralidade</span>
				<select
					value={draft.ancestryId}
					onchange={selectAncestry}
					data-testid="character-ancestry-select"
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
				>
					{#each ancestries as ancestry}
						<option value={ancestry.id}>{ancestry.label}</option>
					{/each}
				</select>
			</label>

			<label class="block">
				<span class="text-sm font-semibold text-ether">Classe</span>
				<select
					bind:value={draft.classId}
					data-testid="character-class-select"
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
				>
					{#each characterClasses as characterClass}
						<option value={characterClass.id}>{characterClass.label}</option>
					{/each}
				</select>
			</label>

			<label class="block">
				<span class="text-sm font-semibold text-ether">Antecedente</span>
				<select
					bind:value={draft.backgroundId}
					data-testid="character-background-select"
					class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
				>
					{#each backgrounds as background}
						<option value={background.id}>{background.label}</option>
					{/each}
				</select>
			</label>
		</div>

		<fieldset class="border border-bronze p-4">
			<legend class="px-2 text-sm font-semibold text-ether">
				Traços de ancestralidade
			</legend>
			<p class="text-sm leading-6 text-bone" data-testid="character-trait-count">
				Escolha exatamente 3. Selecionados: {selectedTraitCount}/3.
			</p>
			<div class="mt-4 grid gap-3 lg:grid-cols-2">
				{#each availableAncestryTraits as trait}
					<label class="border border-bronze bg-blood-shadow p-3">
						<span class="flex items-start gap-3">
							<input
								type="checkbox"
								checked={draft.ancestryTraitIds.includes(trait.id)}
								onchange={(event) => toggleAncestryTrait(event, trait.id)}
								data-testid={`character-trait-${trait.id}`}
								class="mt-1 h-4 w-4 accent-ether"
							/>
							<span>
								<span class="block text-sm font-semibold text-ether">
									{trait.label}
								</span>
								<span class="mt-1 block text-sm leading-6 text-bone">
									{trait.description}
								</span>
							</span>
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<label class="block max-w-40">
			<span class="text-sm font-semibold text-ether">Nível</span>
			<input
				type="number"
				min="1"
				max="20"
				bind:value={draft.level}
				data-testid="character-level-input"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			/>
		</label>

		<fieldset class="border border-bronze p-4">
			<legend class="px-2 text-sm font-semibold text-ether">Eixos</legend>
			<div class="grid gap-3 sm:grid-cols-3">
				<label class="block">
					<span class="text-sm text-bone">Físico</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.physical}
						data-testid="character-physical-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
				<label class="block">
					<span class="text-sm text-bone">Mental</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.mental}
						data-testid="character-mental-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
				<label class="block">
					<span class="text-sm text-bone">Social</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.social}
						data-testid="character-social-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
			</div>
		</fieldset>

		<fieldset class="border border-bronze p-4">
			<legend class="px-2 text-sm font-semibold text-ether">Aplicações</legend>
			<div class="grid gap-3 sm:grid-cols-3">
				<label class="block">
					<span class="text-sm text-bone">Conflito</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.conflict}
						data-testid="character-conflict-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
				<label class="block">
					<span class="text-sm text-bone">Interação</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.interaction}
						data-testid="character-interaction-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
				<label class="block">
					<span class="text-sm text-bone">Resistência</span>
					<input
						type="number"
						min="1"
						max="6"
						bind:value={draft.resistance}
						data-testid="character-resistance-input"
						class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
					/>
				</label>
			</div>
		</fieldset>

		{#if _errorMessage}
			<p class="border border-bronze bg-blood-shadow px-4 py-3 text-bone" data-testid="character-create-error">
				{_errorMessage}
			</p>
		{/if}

		{#if _successMessage}
			<p class="border border-ether bg-blood-shadow px-4 py-3 text-bone" data-testid="character-create-success">
				{_successMessage}
			</p>
		{/if}

		<button
			type="submit"
			disabled={_isSubmitting}
			data-testid="character-create-submit"
			class="border border-ether bg-ether px-4 py-2 font-semibold text-void transition-colors hover:bg-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:cursor-not-allowed disabled:border-bronze disabled:bg-ruin disabled:text-bone"
		>
			{_isSubmitting ? "Criando..." : "Criar personagem"}
		</button>
	</form>
</section>
