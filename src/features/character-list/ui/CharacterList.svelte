<script lang="ts">
import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { createCharacterListView } from "../model/characterListView";

type Props = {
	ancestries?: readonly AncestryRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
	records?: readonly CharacterRecord[];
	statusEffects?: readonly CharacterStatusEffectRecord[];
	onApplyStatusEffect?: (
		characterId: string,
		type: string,
	) => void | Promise<void>;
	onClearStatusEffects?: (characterId: string) => void | Promise<void>;
};

let {
	ancestries = [],
	backgrounds = [],
	characterClasses = [],
	records = [],
	statusEffects = [],
	onApplyStatusEffect,
	onClearStatusEffects,
}: Props = $props();

let _view = $derived(
	createCharacterListView(records, {
		ancestries,
		backgrounds,
		characterClasses,
		statusEffects,
	}),
);

// Controle do menu GM de simulação por personagem
let activeGmPanels = $state<Record<string, boolean>>({});

function _toggleGmPanel(characterId: string) {
	activeGmPanels[characterId] = !activeGmPanels[characterId];
}

async function _handleApply(characterId: string, type: string) {
	if (onApplyStatusEffect) {
		await onApplyStatusEffect(characterId, type);
	}
}

async function _handleClear(characterId: string) {
	if (onClearStatusEffects) {
		await onClearStatusEffects(characterId);
	}
}
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
						<div class="flex-1">
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

							<!-- BADGES DE STATUS EFFECTS (ENFERMIDADES) -->
							{#if character.statusEffects && character.statusEffects.length > 0}
								<div class="mt-3 flex flex-wrap gap-2">
									{#each character.statusEffects as effect}
										<span 
											class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border transition-all duration-300 rounded-sm"
											class:border-red-500={effect.type === 'eter_fever'}
											class:bg-red-950={effect.type === 'eter_fever'}
											class:text-red-300={effect.type === 'eter_fever'}
											class:border-emerald-500={effect.type === 'wound_infection'}
											class:bg-emerald-950={effect.type === 'wound_infection'}
											class:text-emerald-300={effect.type === 'wound_infection'}
											class:border-amber-500={effect.type === 'viper_poison'}
											class:bg-amber-950={effect.type === 'viper_poison'}
											class:text-amber-300={effect.type === 'viper_poison'}
										>
											<span 
												class="h-1.5 w-1.5 rounded-full animate-pulse"
												class:bg-red-400={effect.type === 'eter_fever'}
												class:bg-emerald-400={effect.type === 'wound_infection'}
												class:bg-amber-400={effect.type === 'viper_poison'}
											></span>
											{effect.label} (Gravidade {effect.severity})
											{#if effect.isAggravated}
												<span class="text-[9px] uppercase font-bold text-red-400 ml-1">AGRAVADO</span>
											{/if}
										</span>
									{/each}
								</div>
							{/if}

							<!-- AVISO DE CURA NATURAL IMPEDIDA -->
							{#if !character.allowsNaturalRecovery}
								<div class="mt-2 text-xs font-bold text-amber-500 flex items-center gap-1">
									⚠️ Cura natural impedida por infecção física!
								</div>
							{/if}

							<!-- CONTROLES DO GM PARA SIMULAÇÃO -->
							<div class="mt-4 flex flex-col gap-2">
								<button
									type="button"
									onclick={() => toggleGmPanel(character.id)}
									class="inline-flex max-w-max items-center gap-1 border border-bronze bg-void px-2 py-1 text-xs font-medium text-ether transition-colors hover:bg-ruin"
								>
									⚙️ GM: Simular Enfermidades
								</button>

								{#if activeGmPanels[character.id]}
									<div class="mt-1 flex flex-wrap gap-2 border border-bronze bg-void/50 p-2 rounded-sm max-w-md">
										<button
											type="button"
											onclick={() => handleApply(character.id, 'eter_fever')}
											class="border border-red-800 bg-red-950/60 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-900 transition-colors"
										>
											🌡️ Febre de Éter
										</button>
										<button
											type="button"
											onclick={() => handleApply(character.id, 'wound_infection')}
											class="border border-emerald-800 bg-emerald-950/60 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900 transition-colors"
										>
											🩹 Infecção de Ferida
										</button>
										<button
											type="button"
											onclick={() => handleApply(character.id, 'viper_poison')}
											class="border border-amber-800 bg-amber-950/60 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-900 transition-colors"
										>
											🐍 Veneno de Víbora
										</button>
										<button
											type="button"
											onclick={() => handleClear(character.id)}
											class="border border-bronze/60 bg-ruin/40 px-2 py-1 text-[11px] font-semibold text-bone hover:bg-ruin/90 transition-colors"
										>
											✨ Limpar Status
										</button>
									</div>
								{/if}
							</div>
						</div>

						<div class="grid gap-3 sm:grid-cols-2 lg:min-w-96">
							<div>
								<p class="text-sm font-semibold text-ether">Eixos</p>
								<div class="mt-2 grid grid-cols-3 gap-2">
									{#each character.axes as stat}
										<div class="border border-bronze bg-void px-3 py-2 text-center flex flex-col justify-between">
											<p class="text-xs text-ether">{stat.label}</p>
											<p 
												class="mt-1 text-lg font-semibold"
												class:text-red-400={stat.baseValue !== undefined}
												class:text-bone={stat.baseValue === undefined}
											>
												{stat.value}
												{#if stat.baseValue !== undefined}
													<span class="text-[10px] text-ether/60 line-through font-normal block">({stat.baseValue} base)</span>
												{/if}
											</p>
										</div>
									{/each}
								</div>
							</div>

							<div>
								<p class="text-sm font-semibold text-ether">Aplicações</p>
								<div class="mt-2 grid grid-cols-3 gap-2">
									{#each character.applications as stat}
										<div class="border border-bronze bg-void px-3 py-2 text-center flex flex-col justify-between">
											<p class="text-xs text-ether">{stat.label}</p>
											<p 
												class="mt-1 text-lg font-semibold"
												class:text-red-400={stat.baseValue !== undefined}
												class:text-bone={stat.baseValue === undefined}
											>
												{stat.value}
												{#if stat.baseValue !== undefined}
													<span class="text-[10px] text-ether/60 line-through font-normal block">({stat.baseValue} base)</span>
												{/if}
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

