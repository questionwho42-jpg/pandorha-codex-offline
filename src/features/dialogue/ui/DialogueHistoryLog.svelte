<script lang="ts">
import type { IDialogueLogFormatter } from "./DialogueLogFormatter";

interface Props {
	logs: string[];
	formatter: IDialogueLogFormatter;
	onClear: () => void;
}

let props: Props = $props();
let _logs = $derived(props.logs);
let _formatter = $derived(props.formatter);
let _onClear = $derived(props.onClear);
</script>

<div class="p-4 bg-ruin/75 border border-bronze/45 rounded-lg shadow-xl flex-1 flex flex-col gap-3 max-h-[350px]">
	<h3 class="font-bold text-xs uppercase text-bronze tracking-wider border-b border-bronze/20 pb-2 flex justify-between items-center">
		<span>📜 Crônicas do Diálogo</span>
		{#if logs.length > 0}
			<button
				type="button"
				onclick={onClear}
				class="text-[9px] text-bone/40 hover:text-bone transition-all uppercase focus:outline-none"
			>
				Limpar
			</button>
		{/if}
	</h3>
	<div class="flex flex-col gap-2 overflow-y-auto flex-1 text-xs pr-1">
		{#each logs as log}
			<div class="p-2 bg-void/50 border border-bronze/10 rounded leading-relaxed animate-fade-in">
				{@html formatter.format(log)}
			</div>
		{:else}
			<p class="text-xs text-bone/40 italic py-4 text-center my-auto">Histórico de ações limpo.</p>
		{/each}
	</div>
</div>
