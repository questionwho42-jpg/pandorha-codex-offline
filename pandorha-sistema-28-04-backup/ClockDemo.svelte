<script lang="ts">
import type { ClockData } from "../../../entities/clocks/model-api";
import { ClockService } from "../domain/ClockService";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import ClockWidget from "./ClockWidget.svelte";

let clocks = $state<ClockData[]>([]);
let logs = $state<string[]>([]);
let newClockName = $state("Relógio de Teste");
let newClockSegments = $state(4);

function addLog(msg: string) {
	logs = [...logs, msg];
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleCreate() {
	const result = ClockService.createClock(
		newClockName,
		newClockSegments,
		"EVENTO_GENERICO",
	);
	if (result.success) {
		clocks = [...clocks, result.data];
		addLog(
			`Criou relógio '${result.data.name}' com ${result.data.totalSegments} segmentos.`,
		);
	} else {
		addLog(`Erro: ${result.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleAdvance(id: string) {
	const clockIndex = clocks.findIndex((c) => c.id === id);
	if (clockIndex < 0) return;

	const clock = clocks[clockIndex];
	const result = ClockService.advanceClock(clock, 1);

	if (result.success) {
		clocks[clockIndex] = result.data.clock;
		addLog(
			`Avançou '${clock.name}'. Progresso: ${result.data.clock.filledSegments}/${clock.totalSegments}`,
		);

		if (result.data.eventTriggered) {
			addLog(
				`⚡ EVENTO DISPARADO: ${result.data.eventTriggered} (Origem: ${clock.name})`,
			);
		}
	} else {
		addLog(`Erro ao avançar: ${result.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleReduce(id: string) {
	const clockIndex = clocks.findIndex((c) => c.id === id);
	if (clockIndex < 0) return;

	const clock = clocks[clockIndex];
	const result = ClockService.reduceClock(clock, 1);

	if (result.success) {
		clocks[clockIndex] = result.data;
		addLog(
			`Reduziu '${clock.name}'. Progresso: ${result.data.filledSegments}/${clock.totalSegments}`,
		);
	} else {
		addLog(`Erro ao reduzir: ${result.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleRemove(id: string) {
	clocks = clocks.filter((c) => c.id !== id);
}
</script>

<div class="flex gap-8 items-start w-full p-4 font-sans text-bone">
	<div class="flex-1 flex flex-col gap-6">
		<div class="bg-void border border-bronze p-4 rounded-lg flex flex-col gap-4">
			<h2 class="text-xl font-bold text-bronze-light">Criar Relógio</h2>
			
			<div class="flex gap-4 items-end">
				<div class="flex flex-col gap-1 flex-1">
					<label for="c-name" class="text-xs text-ether">Nome do Relógio</label>
					<input id="c-name" type="text" bind:value={newClockName} class="bg-ruin border border-bronze p-2 text-bone rounded" />
				</div>
				<div class="flex flex-col gap-1 w-24">
					<label for="c-seg" class="text-xs text-ether">Segmentos</label>
					<input id="c-seg" type="number" min="2" max="12" bind:value={newClockSegments} class="bg-ruin border border-bronze p-2 text-bone rounded" />
				</div>
				<button onclick={handleCreate} class="bg-bronze-light text-void font-bold px-4 py-2 rounded hover:bg-bronze transition-colors">
					Gerar
				</button>
			</div>
		</div>

		<div class="flex flex-wrap gap-4">
			{#each clocks as clock (clock.id)}
				<div class="flex flex-col gap-2 items-center">
					<ClockWidget {clock} />
					<div class="flex gap-2">
						<button 
							onclick={() => handleReduce(clock.id)}
							disabled={clock.filledSegments === 0}
							class="text-xs px-2 py-1 bg-void border border-bronze rounded hover:bg-ruin disabled:opacity-50"
						>
							-1
						</button>
						<button 
							onclick={() => handleAdvance(clock.id)}
							disabled={clock.isCompleted}
							class="text-xs px-2 py-1 bg-void border border-bronze rounded hover:bg-ruin disabled:opacity-50"
						>
							+1
						</button>
						<button 
							onclick={() => handleRemove(clock.id)}
							class="text-xs px-2 py-1 text-blood-shadow hover:text-blood-light"
						>
							Remover
						</button>
					</div>
				</div>
			{/each}
			{#if clocks.length === 0}
				<div class="text-ether italic p-4">Nenhum relógio ativo no momento.</div>
			{/if}
		</div>
	</div>

	<div class="w-80 bg-ruin border border-bronze rounded-lg p-4 flex flex-col h-[600px]">
		<h3 class="font-semibold text-bone border-b border-ether pb-2 mb-4">Registro de Eventos</h3>
		<div class="flex flex-col gap-2 overflow-y-auto flex-1 pr-2">
			{#each logs as log}
				<div class="text-sm p-2 bg-void rounded border border-bronze/30">
					{#if log.includes("⚡ EVENTO DISPARADO")}
						<span class="text-blood-light font-bold">{log}</span>
					{:else if log.includes("Erro")}
						<span class="text-blood-shadow">{log}</span>
					{:else}
						<span class="text-bone/80">{log}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
