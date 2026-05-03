<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import { createCharacterListView } from "../model/characterListView";

type Props = {
	records?: readonly CharacterRecord[];
};

let { records = [] }: Props = $props();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(createCharacterListView(records));
</script>

<section aria-labelledby="character-list-title" data-testid="character-list">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Arquivo de personagens</p>
			<h2
				id="character-list-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Listagem de personagens
			</h2>
		</div>
		<p class="text-sm font-medium text-ether" data-testid="character-count">
			{view.countLabel}
		</p>
	</div>

	{#if view.emptyState}
		<div
			class="mt-6 border border-bronze bg-blood-shadow px-5 py-6"
			data-testid="character-empty-state"
		>
			<h3 class="text-lg font-semibold text-bone">{view.emptyState.title}</h3>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				{view.emptyState.description}
			</p>
		</div>
	{:else}
		<ul class="mt-6 divide-y divide-bronze border-y border-bronze">
			{#each view.items as character (character.id)}
				<li class="py-5" data-testid="character-list-item">
					<div class="flex flex-col gap-4 lg:flex-row lg:justify-between">
						<div>
							<p class="text-sm font-semibold text-ether">
								{character.levelLabel}
							</p>
							<h3 class="mt-1 text-xl font-semibold text-bone">
								{character.name}
							</h3>
							<p class="mt-2 max-w-2xl leading-7 text-bone">
								{character.concept}
							</p>
							<p class="mt-2 text-sm text-ether">{character.identityLabel}</p>
						</div>

						<div class="grid gap-3 sm:grid-cols-2 lg:min-w-96">
							<div>
								<p class="text-sm font-semibold text-ether">Eixos</p>
								<div class="mt-2 grid grid-cols-3 gap-2">
									{#each character.axes as stat}
										<div class="border border-bronze px-3 py-2 text-center">
											<p class="text-xs text-ether">{stat.label}</p>
											<p class="mt-1 text-lg font-semibold text-bone">
												{stat.value}
											</p>
										</div>
									{/each}
								</div>
							</div>

							<div>
								<p class="text-sm font-semibold text-ether">Aplicações</p>
								<div class="mt-2 grid grid-cols-3 gap-2">
									{#each character.applications as stat}
										<div class="border border-bronze px-3 py-2 text-center">
											<p class="text-xs text-ether">{stat.label}</p>
											<p class="mt-1 text-lg font-semibold text-bone">
												{stat.value}
											</p>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
