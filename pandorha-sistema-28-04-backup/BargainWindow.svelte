<script lang="ts">
import type { BargainOffer, SocialAttitude } from "../model-api";

let {
	attitude,
	onOfferMade,
}: {
	attitude: SocialAttitude;
	onOfferMade: (offer: BargainOffer) => void;
} = $props();

let selectedType = $state<"gold" | "item" | "favor">("gold");
let offerAmount = $state(100);
let favorSize = $state<"minor" | "major">("minor");
let itemName = $state("");

function _handleOffer() {
	let value = offerAmount;

	if (selectedType === "favor") {
		value = favorSize === "major" ? 500 : 100;
	}

	const offer: BargainOffer = {
		id: crypto.randomUUID(),
		type: selectedType,
		valueInGold: value,
		description:
			selectedType === "gold"
				? `${value} Ouro`
				: selectedType === "item"
					? itemName
					: `Favor (${favorSize})`,
		favorType: selectedType === "favor" ? favorSize : undefined,
	};

	onOfferMade(offer);

	// Reset
	if (selectedType === "gold") offerAmount = 100;
	if (selectedType === "item") {
		offerAmount = 50;
		itemName = "";
	}
}

const _attitudeLabel = {
	friendly: "Amigável (10% Desconto)",
	neutral: "Neutro (Preço Base)",
	skeptical: "Cético (Preço Base)",
	hostile: "Hostil (20% Sobretaxa)",
	declared_enemy: "Inimigo (100% Sobretaxa)",
}[attitude];
</script>

<div class="flex flex-col gap-4 p-4 bg-ruin rounded border border-bronze text-bone">
	<div class="flex justify-between items-center border-b border-bronze pb-2">
		<h4 class="font-semibold text-lg">Mesa de Barganha</h4>
		<span class="text-sm px-2 py-1 bg-void border border-bronze/50 rounded text-ether">{attitudeLabel}</span>
	</div>

	<div class="flex flex-col gap-3">
		<label class="flex flex-col gap-1">
			<span class="text-sm text-bone/70">O que você está oferecendo?</span>
			<select bind:value={selectedType} class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether">
				<option value="gold">Ouro (Suborno/Pagamento)</option>
				<option value="item">Item (Escambo)</option>
				<option value="favor">Favor (Dívida)</option>
			</select>
		</label>

		{#if selectedType === "gold"}
			<label class="flex flex-col gap-1">
				<span class="text-sm text-bone/70">Quantidade (PO)</span>
				<input type="number" bind:value={offerAmount} min="1" class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether" />
			</label>
		{/if}

		{#if selectedType === "item"}
			<div class="flex gap-2">
				<label class="flex flex-col gap-1 flex-1">
					<span class="text-sm text-bone/70">Nome do Item</span>
					<input type="text" bind:value={itemName} placeholder="Espada Longa..." class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether" />
				</label>
				<label class="flex flex-col gap-1 w-32">
					<span class="text-sm text-bone/70">Valor (PO)</span>
					<input type="number" bind:value={offerAmount} min="1" class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether" />
				</label>
			</div>
		{/if}

		{#if selectedType === "favor"}
			<label class="flex flex-col gap-1">
				<span class="text-sm text-bone/70">Tamanho do Favor</span>
				<select bind:value={favorSize} class="bg-void border border-bronze rounded p-2 text-bone outline-none focus:border-ether">
					<option value="minor">Favor Menor (~100 PO)</option>
					<option value="major">Favor Maior (~500 PO)</option>
				</select>
			</label>
		{/if}

		<button 
			class="mt-2 bg-bronze hover:bg-ether text-void font-semibold py-2 px-4 rounded transition-colors"
			onclick={handleOffer}
		>
			Colocar na Mesa
		</button>
	</div>
</div>
