<script lang="ts">
import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { CompanionRecord } from "$lib/entities/companions";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { createCharacterListView } from "../model/characterListView";

type Props = {
	ancestries?: readonly AncestryRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
	records?: readonly CharacterRecord[];
	statusEffects?: readonly CharacterStatusEffectRecord[];
	craftedItems?: readonly CharacterCraftedItemRecord[];
	onApplyStatusEffect?: (
		characterId: string,
		type: string,
	) => void | Promise<void>;
	onClearStatusEffects?: (characterId: string) => void | Promise<void>;
	companions?: readonly CompanionRecord[];
	onSummonCompanion?: (
		characterId: string,
		name: string,
		type: "aggressor" | "protector" | "scout" | "familiar",
		subModel: string,
		tier: number,
	) => void | Promise<void>;
	onShareSensory?: (
		companionId: string,
		isShare: boolean,
	) => void | Promise<void>;
	onCompanionDamage?: (
		companionId: string,
		damage: number,
	) => void | Promise<void>;
	onStabilizeMaster?: (characterId: string) => void | Promise<void>;
	onUpdateCompanionTraits?: (
		companionId: string,
		traits: string[],
	) => void | Promise<void>;
};

let {
	ancestries = [],
	backgrounds = [],
	characterClasses = [],
	records = [],
	statusEffects = [],
	craftedItems = [],
	onApplyStatusEffect,
	onClearStatusEffects,
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	companions = [],
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	onSummonCompanion,
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	onShareSensory,
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	onCompanionDamage,
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	onStabilizeMaster,
	// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
	onUpdateCompanionTraits,
}: Props = $props();

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(
	createCharacterListView(records, {
		ancestries,
		backgrounds,
		characterClasses,
		statusEffects,
		craftedItems,
	}),
);

// Controle do menu GM de simulação por personagem
let activeGmPanels = $state<Record<string, boolean>>({});

// Estados reativos locais para criação e gerenciamento de companheiros (Fase 22)
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let newCompanionName = $state<Record<string, string>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let newCompanionType = $state<
	Record<string, "aggressor" | "protector" | "scout" | "familiar">
>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let newCompanionSub = $state<Record<string, string>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let newCompanionTier = $state<Record<string, number>>({});

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let companionDamageInput = $state<Record<string, number>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let activeTraitEditor = $state<Record<string, boolean>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let selectedTraitsTemp = $state<Record<string, string[]>>({});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function toggleGmPanel(characterId: string) {
	activeGmPanels[characterId] = !activeGmPanels[characterId];
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleApply(characterId: string, type: string) {
	if (onApplyStatusEffect) {
		await onApplyStatusEffect(characterId, type);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleClear(characterId: string) {
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

							<!-- EE DO TECELÃO SE FOR TECELÃO -->
							{#if records.find(r => r.id === character.id)?.classId === 'weaver'}
								{@const originalChar = records.find(r => r.id === character.id)}
								{#if originalChar}
									{@const baseEe = originalChar.level + originalChar.mental}
									{@const hasActiveFamiliar = companions.some(c => c.characterId === character.id && c.type === 'familiar' && !c.isDissipated)}
									{@const finalEe = hasActiveFamiliar ? Math.max(0, baseEe - 1) : baseEe}
									<p class="mt-2 text-sm font-semibold text-purple-runic flex items-center gap-1">
										<span>🔮 Energia Estelar:</span>
										<span class="font-bold text-bone">{finalEe}</span>
										<span class="text-ether/60">/ {baseEe} Máx</span>
										{#if hasActiveFamiliar}
											<span class="text-[10px] text-blood bg-blood-shadow/20 border border-blood/30 px-1 py-0.5 ml-1 rounded-[2px] animate-pulse">(-1 Familiar Ativo)</span>
										{/if}
									</p>
								{/if}
							{/if}

							<!-- BADGES DE STATUS EFFECTS (ENFERMIDADES) -->
							{#if character.statusEffects && character.statusEffects.length > 0}
								<div class="mt-3 flex flex-wrap gap-2">
									{#each character.statusEffects as effect}
										<span 
											class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border transition-all duration-300 rounded-sm {effect.type === 'eter_fever' ? 'border-purple-runic bg-purple-runic/10 text-purple-runic' : ''} {effect.type === 'wound_infection' ? 'border-blood bg-blood-shadow/20 text-blood' : ''} {effect.type === 'viper_poison' ? 'border-emerald-poison bg-emerald-poison/15 text-emerald-poison' : ''} {effect.type === 'hungry' ? 'border-orange-hungry bg-orange-hungry/15 text-orange-hungry' : ''}"
										>
											<span 
												class="h-1.5 w-1.5 rounded-full animate-pulse {effect.type === 'eter_fever' ? 'bg-purple-runic' : ''} {effect.type === 'wound_infection' ? 'bg-blood' : ''} {effect.type === 'viper_poison' ? 'bg-emerald-poison' : ''} {effect.type === 'hungry' ? 'bg-orange-hungry' : ''}"
											></span>
											{effect.label} (Gravidade {effect.severity})
											{#if effect.isAggravated}
												<span class="text-[9px] uppercase font-bold text-blood ml-1 px-1 py-0.5 bg-blood-shadow/50 border border-blood/30 animate-pulse rounded-[2px]">💀 AGRAVADO</span>
											{/if}
										</span>
									{/each}
								</div>
							{/if}

							<!-- AVISO DE CURA NATURAL IMPEDIDA -->
							{#if !character.allowsNaturalRecovery}
								<div class="mt-2 text-xs font-bold text-blood flex items-center gap-1">
									⚠️ Cura natural impedida por infecção física ou fome!
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
											class="border border-purple-runic/30 bg-purple-runic/10 px-2 py-1 text-[11px] font-semibold text-purple-runic hover:bg-purple-runic/30 transition-colors"
										>
											🌡️ Febre de Éter
										</button>
										<button
											type="button"
											onclick={() => handleApply(character.id, 'wound_infection')}
											class="border border-blood/30 bg-blood-shadow/40 px-2 py-1 text-[11px] font-semibold text-blood hover:bg-blood/20 transition-colors"
										>
											🩹 Infecção de Ferida
										</button>
										<button
											type="button"
											onclick={() => handleApply(character.id, 'viper_poison')}
											class="border border-emerald-poison/30 bg-emerald-poison/10 px-2 py-1 text-[11px] font-semibold text-emerald-poison hover:bg-emerald-poison/25 transition-colors"
										>
											🐍 Veneno de Víbora
										</button>
										<button
											type="button"
											onclick={() => handleApply(character.id, 'hungry')}
											class="border border-orange-hungry/30 bg-orange-hungry/10 px-2 py-1 text-[11px] font-semibold text-orange-hungry hover:bg-orange-hungry/25 transition-colors"
										>
											🍗 Faminto
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

						<div class="grid gap-3 sm:grid-cols-3 lg:min-w-[480px]">
							<div>
								<p class="text-sm font-semibold text-ether">Eixos</p>
								<div class="mt-2 grid grid-cols-3 gap-2">
									{#each character.axes as stat}
										<div class="border border-bronze bg-void px-3 py-2 text-center flex flex-col justify-between">
											<p class="text-xs text-ether">{stat.label}</p>
											<p 
												class="mt-1 text-lg font-semibold animate-transition duration-200"
												class:text-blood={stat.baseValue !== undefined}
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
												class="mt-1 text-lg font-semibold animate-transition duration-200"
												class:text-blood={stat.baseValue !== undefined}
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
								<p class="text-sm font-semibold text-ether">Combate</p>
								<div class="mt-2 grid grid-cols-2 gap-2">
									<div class="border border-bronze bg-void px-3 py-2 text-center flex flex-col justify-between">
										<p class="text-xs text-ether">Defesa (CA)</p>
										<p class="mt-1 text-lg font-semibold text-bone">{character.armorClass}</p>
									</div>
									<div class="border border-bronze bg-void px-3 py-2 text-center flex flex-col justify-between">
										<p class="text-xs text-ether">Velocidade</p>
										<p class="mt-1 text-lg font-semibold text-bone">{character.movementSpeed}m</p>
									</div>
								</div>
								{#if character.stealthPenalty < 0}
									<p class="text-[10px] text-blood bg-blood-shadow/20 border border-blood/30 px-1 py-0.5 mt-1 rounded-[2px] text-center font-semibold animate-pulse">
										🔇 Ruído: {character.stealthPenalty} Furtividade
									</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- SEÇÃO DE COMPANHEIROS E FAMILIARES (FASE 22) -->
					<div class="mt-4 border-t border-bronze/40 pt-4" data-testid="companion-section">
						<h4 class="text-sm font-semibold text-ether flex items-center gap-1.5">
							🐾 Elo de Companheiro & Familiar Místico
						</h4>
						
						{#if companions.filter(c => c.characterId === character.id && !c.isDissipated).length > 0}
							{@const charCompanions = companions.filter(c => c.characterId === character.id && !c.isDissipated)}
							<div class="mt-3 grid gap-3 sm:grid-cols-2">
								{#each charCompanions as companion (companion.id)}
									{@const maxTraits = companion.tier + 1}
									{@const currentTraits = JSON.parse(companion.selectedTraitsJson || "[]")}
									<div class="border border-bronze bg-ruin/25 p-3 rounded-sm relative">
										<div class="flex justify-between items-start">
											<div>
												<h5 class="text-sm font-bold text-bone flex items-center gap-1">
													{companion.name} 
													<span class="text-[10px] px-1.5 py-0.5 border border-ether/40 text-ether font-normal rounded-sm">
														{companion.type === 'familiar' ? '🔮 Familiar' : 
														 companion.type === 'aggressor' ? '⚔️ Agressor' : 
														 companion.type === 'protector' ? '🛡️ Protetor' : '🦅 Batedor'}
													</span>
												</h5>
												<p class="text-[11px] text-ether/80">{companion.subModel} · Tier {companion.tier}</p>
											</div>
											<span class="text-xs font-bold text-bone">
												PV: {companion.hpCurrent} / {companion.hpMax}
											</span>
										</div>

										<!-- Barra de HP do Companheiro -->
										<div class="mt-2 h-2 w-full bg-void border border-bronze/50 rounded-sm overflow-hidden">
											<div class="h-full bg-gradient-to-r from-blood to-emerald-poison transition-all duration-300" style="width: {Math.min(100, Math.max(0, (companion.hpCurrent / companion.hpMax) * 100))}%"></div>
										</div>

										<!-- Informações de Transe e Traços -->
										<div class="mt-3 flex flex-wrap gap-2 text-xs">
											{#if companion.isShareSensory}
												<span class="px-2 py-0.5 bg-emerald-poison/15 border border-emerald-poison/40 text-emerald-poison rounded-sm animate-pulse flex items-center gap-1">
													👁️ Transe Ativo (50% Dano Mental no Caster)
												</span>
											{:else}
												<span class="px-2 py-0.5 bg-void border border-bronze/40 text-ether rounded-sm">
													Sentidos Normais
												</span>
											{/if}

											{#if currentTraits.length > 0}
												{#each currentTraits as trait}
													<span class="px-2 py-0.5 bg-purple-runic/15 border border-purple-runic/40 text-purple-runic rounded-sm">
														✨ {trait}
													</span>
												{/each}
											{:else}
												<span class="px-2 py-0.5 bg-void border border-bronze/30 text-ether/60 italic rounded-sm">
													Nenhum traço ativado
												</span>
											{/if}
										</div>

										<!-- Ações Rápidas -->
										<div class="mt-3 pt-3 border-t border-bronze/20 flex flex-wrap gap-2">
											<!-- Toggle Transe -->
											<button
												type="button"
												onclick={() => onShareSensory?.(companion.id, !companion.isShareSensory)}
												class="px-2.5 py-1 text-[11px] font-bold border transition-colors {companion.isShareSensory ? 'border-orange-hungry bg-orange-hungry/10 text-orange-hungry hover:bg-orange-hungry/20' : 'border-bronze bg-void text-bone hover:bg-ruin'}"
											>
												{companion.isShareSensory ? 'Desativar Transe' : 'Ativar Transe'}
											</button>

											<!-- Estabilizar Mestre (Sacrifício) -->
											<button
												type="button"
												onclick={() => onStabilizeMaster?.(character.id)}
												class="px-2.5 py-1 text-[11px] font-bold border border-blood bg-blood-shadow/20 text-blood hover:bg-blood/20 transition-colors"
												title="Consome a essência da criatura para curar/estabilizar o mestre caído"
											>
												💀 Sacrifício Salvador
											</button>

											<!-- Editar Traços -->
											<button
												type="button"
												onclick={() => {
													activeTraitEditor[companion.id] = !activeTraitEditor[companion.id];
													if (activeTraitEditor[companion.id]) {
														selectedTraitsTemp[companion.id] = [...currentTraits];
													}
												}}
												class="px-2.5 py-1 text-[11px] font-bold border border-purple-runic bg-purple-runic/10 text-purple-runic hover:bg-purple-runic/20 transition-colors"
											>
												⚙️ Traços ({currentTraits.length}/{maxTraits})
											</button>
										</div>

										<!-- Editor de Traços Expansível -->
										{#if activeTraitEditor[companion.id]}
											<div class="mt-3 p-2 bg-void border border-purple-runic/40 rounded-sm text-xs">
												<p class="font-bold text-purple-runic mb-2">Selecione até {maxTraits} Traços/Truques:</p>
												<div class="grid grid-cols-2 gap-2">
													{#each ["Vigília Rúnica", "Ataque Coordenado", "Sentidos Aguçados", "Esquiva Sobrenatural", "Investida Feroz", "Canalização Arcana"] as traitOption}
														<label class="flex items-center gap-1.5 text-bone cursor-pointer font-semibold">
															<input
																type="checkbox"
																checked={selectedTraitsTemp[companion.id]?.includes(traitOption)}
																onchange={(e) => {
																	const checked = e.currentTarget.checked;
																	const current = selectedTraitsTemp[companion.id] || [];
																	if (checked) {
																		if (current.length < maxTraits) {
																			selectedTraitsTemp[companion.id] = [...current, traitOption];
																		} else {
																			e.currentTarget.checked = false;
																			alert(`Limite de traços atingido (${maxTraits})`);
																		}
																	} else {
																		selectedTraitsTemp[companion.id] = current.filter(t => t !== traitOption);
																	}
																}}
																class="rounded border-bronze text-purple-runic bg-void focus:ring-0 mr-1"
															/>
															{traitOption}
														</label>
													{/each}
												</div>
												<div class="mt-3 flex justify-end gap-2">
													<button
														type="button"
														onclick={() => activeTraitEditor[companion.id] = false}
														class="px-2 py-0.5 border border-bronze bg-void text-bone hover:bg-ruin"
													>
														Cancelar
													</button>
													<button
														type="button"
														onclick={async () => {
															await onUpdateCompanionTraits?.(companion.id, selectedTraitsTemp[companion.id] || []);
															activeTraitEditor[companion.id] = false;
														}}
														class="px-2 py-0.5 bg-purple-runic/20 border border-purple-runic text-purple-runic hover:bg-purple-runic/40"
													>
														Salvar
													</button>
												</div>
											</div>
										{/if}

										<!-- Painel de Dano GM do Companheiro -->
										<div class="mt-3 flex items-center gap-2">
											<label class="flex items-center gap-1.5 text-xs text-ether font-bold">
												GM Dano:
												<input
													type="number"
													placeholder="Dano"
													min="1"
													bind:value={companionDamageInput[companion.id]}
													class="w-16 border border-bronze bg-void px-2 py-1 text-xs text-bone focus:outline-none focus:border-blood"
												/>
											</label>
											<button
												type="button"
												onclick={() => {
													const dmg = companionDamageInput[companion.id] || 0;
													if (dmg > 0) {
														onCompanionDamage?.(companion.id, dmg);
														companionDamageInput[companion.id] = 0;
													}
												}}
												class="px-2.5 py-1 text-[11px] font-bold border border-blood bg-blood-shadow/20 text-blood hover:bg-blood/40 transition-colors"
											>
												💥 Aplicar
											</button>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<!-- Form Invocação / Vinculação de Companheiro -->
							<div class="mt-3 p-3 border border-bronze/40 bg-void/50 rounded-sm max-w-lg">
								<p class="text-xs text-ether italic">Nenhum elo sintonizado ativo. Invocar uma criatura de éter:</p>
								<div class="mt-2 grid grid-cols-2 gap-2 text-xs">
									<div>
										<label class="block text-ether text-[10px] mb-1 uppercase font-bold">
											Nome do Companheiro
											<input
												type="text"
												placeholder="Ex: Garra-Fria"
												bind:value={newCompanionName[character.id]}
												class="w-full border border-bronze bg-void px-2 py-1 text-bone focus:outline-none focus:border-ether mt-1"
											/>
										</label>
									</div>
									<div>
										<label class="block text-ether text-[10px] mb-1 uppercase font-bold">
											Matriz (Submodelo)
											<input
												type="text"
												placeholder="Ex: Lobo de Éter"
												bind:value={newCompanionSub[character.id]}
												class="w-full border border-bronze bg-void px-2 py-1 text-bone focus:outline-none focus:border-ether mt-1"
											/>
										</label>
									</div>
									<div>
										<label class="block text-ether text-[10px] mb-1 uppercase font-bold">
											Tipo de Companheiro
											<select
												bind:value={newCompanionType[character.id]}
												class="w-full border border-bronze bg-void px-2 py-1 text-bone focus:outline-none focus:border-ether mt-1"
											>
												<option value="aggressor">⚔️ Agressor (Foco Ofensivo)</option>
												<option value="protector">🛡️ Protetor (Foco Defensivo)</option>
												<option value="scout">🦅 Batedor (Foco Utilitário)</option>
												<option value="familiar">🔮 Familiar Místico (-1 EE Máximo)</option>
											</select>
										</label>
									</div>
									<div>
										<label class="block text-ether text-[10px] mb-1 uppercase font-bold">
											Tier de Poder
											<select
												bind:value={newCompanionTier[character.id]}
												class="w-full border border-bronze bg-void px-2 py-1 text-bone focus:outline-none focus:border-ether mt-1"
											>
												<option value={1}>Tier I (Estatísticas Padrão)</option>
												<option value={2}>Tier II (+1 Traço)</option>
												<option value={3}>Tier III (+2 Traços)</option>
												<option value={4}>Tier IV (+3 Traços)</option>
											</select>
										</label>
									</div>
								</div>
								<button
									type="button"
									onclick={async () => {
										const name = newCompanionName[character.id];
										const subModel = newCompanionSub[character.id];
										const type = newCompanionType[character.id] || "aggressor";
										const tier = Number(newCompanionTier[character.id]) || 1;
										if (name && subModel) {
											await onSummonCompanion?.(character.id, name, type, subModel, tier);
											newCompanionName[character.id] = "";
											newCompanionSub[character.id] = "";
										} else {
											alert("Preencha o nome e a matriz do companheiro!");
										}
									}}
									class="mt-3 px-3 py-1.5 text-xs font-bold border border-bronze bg-ruin/60 text-bone hover:bg-ruin transition-colors w-full"
								>
									✨ Sintonizar Elo e Invocar Criatura
								</button>
							</div>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
