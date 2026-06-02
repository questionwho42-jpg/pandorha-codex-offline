<script lang="ts">
import {
	createSaveLoadView,
	type SaveLoadUiState,
} from "../model/saveLoadView";

interface SaveLoadControlsProps {
	readonly state: SaveLoadUiState;
	readonly onLoad: () => Promise<void>;
	readonly onSave: () => Promise<void>;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const { state, onLoad, onSave }: SaveLoadControlsProps = $props();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const view = $derived(createSaveLoadView(state));
</script>

<section
	aria-labelledby="save-load-title"
	class="rounded-lg border border-bronze bg-blood-shadow/40 p-4"
>
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-2">
			<h2 id="save-load-title" class="text-lg font-semibold text-bone">
				Save local
			</h2>
			<p class="max-w-2xl text-sm leading-6 text-bone/80">
				Este é o primeiro save local do navegador. Ele usa um único slot e ainda não
				tem múltiplas versões.
			</p>
			<p aria-live="polite" class="text-sm font-medium text-ether">
				{view.statusLabel}
			</p>
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="rounded-lg border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!view.canSave}
				onclick={() => void onSave()}
			>
				Salvar sessão
			</button>
			<button
				type="button"
				class="rounded-lg border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!view.canLoad}
				onclick={() => void onLoad()}
			>
				Carregar save
			</button>
		</div>
	</div>
</section>
