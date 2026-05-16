<script lang="ts">
// Painel mockado em memória para demonstração da feature
const _factions = [
	{
		id: "guild_merchants",
		name: "Guilda dos Mercadores",
		attitude: "neutral",
		favorBalance: 0,
	},
	{
		id: "city_guard",
		name: "Guarda da Cidade",
		attitude: "skeptical",
		favorBalance: -1,
	},
	{
		id: "thieves_guild",
		name: "Irmandade Oculta",
		attitude: "friendly",
		favorBalance: 2,
	},
];

const _attitudeColors: Record<string, string> = {
	friendly: "text-ether",
	neutral: "text-bone",
	skeptical: "text-bronze",
	hostile: "text-blood-shadow",
};
</script>

<div class="flex flex-col gap-4 p-4 bg-ruin rounded border border-bronze text-bone w-80">
	<div class="flex justify-between items-center border-b border-bronze pb-2">
		<h4 class="font-semibold text-lg">Facções e Fama</h4>
	</div>

	<div class="flex flex-col gap-3">
		{#each factions as faction}
			<div class="bg-void border border-bronze/50 rounded p-3 flex flex-col gap-2">
				<div class="flex justify-between items-center">
					<span class="font-medium text-sm">{faction.name}</span>
					<span class="text-xs uppercase px-2 py-0.5 rounded border border-bronze/30 {attitudeColors[faction.attitude]}">
						{faction.attitude}
					</span>
				</div>
				<div class="text-xs text-bone/70 flex justify-between">
					<span>Balanço de Favores:</span>
					<span class={faction.favorBalance >= 0 ? "text-ether" : "text-blood-shadow"}>
						{faction.favorBalance > 0 ? '+' : ''}{faction.favorBalance}
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
