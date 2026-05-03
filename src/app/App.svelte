<script lang="ts">
import type { AppNavigationId } from "./model/navigation";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { APP_NAVIGATION_ITEMS, getAppNavigationItem } from "./model/navigation";

let activeView = $state<AppNavigationId>("home");
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeItem = $derived(getAppNavigationItem(activeView));
</script>

<main aria-labelledby="pandorha-title">
	<p>Pandorha Engine</p>
	<h1 id="pandorha-title">{activeItem.heading}</h1>

	<nav aria-label="Navegação principal">
		{#each APP_NAVIGATION_ITEMS as item}
			<button
				type="button"
				aria-current={activeView === item.id ? "page" : undefined}
				onclick={() => {
					activeView = item.id;
				}}
			>
				{item.label}
			</button>
		{/each}
	</nav>

	<section aria-live="polite">
		<p>{activeItem.description}</p>
	</section>
</main>
