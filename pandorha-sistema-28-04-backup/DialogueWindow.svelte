<script lang="ts">
import type { SocialManeuverType } from "$lib/app/model/socialSession";
import type { SocialTarget } from "../model-api";

interface Props {
	target: SocialTarget;
	onArgument: (
		axis: string,
		margin: number,
		maneuver: SocialManeuverType,
	) => void;
}

// biome-ignore lint/correctness/noUnusedVariables: placeholder for future logic
let { target, onArgument }: Props = $props();

let _selectedAxis = $state("Social + Interacao");
let _simulatedMargin = $state(5);
let _selectedManeuver = $state<SocialManeuverType>("none");
</script>

<div class="flex flex-col gap-6 w-full max-w-xl mx-auto">
	<SocialStandings {target} />
	
	<div class="flex flex-col gap-4 p-4 bg-ruin rounded border border-bronze text-bone">
		<h4 class="font-semibold text-lg border-b border-bronze pb-2">Selecionar Abordagem</h4>
		
		<div class="flex flex-col gap-4">
			<div class="flex gap-4">
				<label class="flex flex-col gap-1 flex-1">
					<span class="text-sm text-bone/70">Eixo de Abordagem</span>
					<select bind:value={selectedAxis} class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether">
						<option value="Social + Interacao">Social + Interação</option>
						<option value="Social + Conflito">Social + Conflito (Intimidação)</option>
						<option value="Mental + Negociacao">Mental + Negociação</option>
					</select>
				</label>
				
				<label class="flex flex-col gap-1 w-32">
					<span class="text-sm text-bone/70">Margem de Dano</span>
					<input type="number" bind:value={simulatedMargin} min="1" max="20" class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether" />
				</label>
			</div>

			<label class="flex flex-col gap-1 flex-1">
				<span class="text-sm text-bone/70">Manobra Especial (Opcional)</span>
				<select bind:value={selectedManeuver} class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether">
					<option value="none">Nenhuma</option>
					<option value="group_sense">Senso de Grupo (Se Margem >= 2, gera 1 Favor Menor)</option>
					<option value="venomous_flattery">Lisonja Venenosa (+2 Bônus de Margem Oculto)</option>
					<option value="mystic_charm">Charme Místico (Força atitude Amigável)</option>
				</select>
			</label>
		</div>
		
		<button 
			class="mt-2 bg-bronze hover:bg-ether text-void font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={() => onArgument(selectedAxis, simulatedMargin, selectedManeuver)}
			disabled={target.patience.currentValue === 0}
		>
			Lançar Argumento
		</button>
	</div>
</div>
