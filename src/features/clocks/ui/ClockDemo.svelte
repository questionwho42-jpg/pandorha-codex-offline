<script lang="ts">
import { onMount } from "svelte";
import { WorkerClockRepository } from "$lib/entities/clocks/infrastructure/WorkerClockRepository";
import type { ClockData } from "$lib/entities/clocks/model-api";
import { ClockService } from "../domain/ClockService";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import ClockWidget from "./ClockWidget.svelte";

let { service = new ClockService(new WorkerClockRepository()) } = $props();

let clocks = $state<ClockData[]>([]);
let logs = $state<string[]>([]);
let newClockName = $state("Relógio de Teste");
let newClockSegments = $state(4);

function addLog(msg: string) {
	logs = [...logs, msg];
}

onMount(async () => {
	const res = await service.list();
	if (res.success) {
		clocks = res.data;
	} else {
		addLog(`Erro ao carregar relógios: ${res.error.message}`);
	}
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleCreate() {
	const result = await service.create(
		newClockName,
		newClockSegments,
		"EVENTO_GENERICO",
	);
	if (result.success) {
		clocks = [...clocks, result.data];
		addLog(
			`Criou relógio '${result.data.name}' com ${result.data.totalSegments} segmentos.`,
		);
		// Reset inputs
		newClockName = "Relógio de Teste";
		newClockSegments = 4;
	} else {
		addLog(`Erro ao criar: ${result.error.message}`);
		console.error("Falha na criação do relógio:", result.error);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleAdvance(id: string) {
	const result = await service.advance(id, 1);

	if (result.success) {
		const clockIndex = clocks.findIndex((c) => c.id === id);
		if (clockIndex >= 0) {
			clocks[clockIndex] = result.data.clock;
		}
		addLog(
			`Avançou '${result.data.clock.name}'. Progresso: ${result.data.clock.filledSegments}/${result.data.clock.totalSegments}`,
		);

		if (result.data.eventTriggered) {
			addLog(
				`⚡ EVENTO DISPARADO: ${result.data.eventTriggered} (Origem: ${result.data.clock.name})`,
			);
		}
	} else {
		addLog(`Erro ao avançar: ${result.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleReduce(id: string) {
	const result = await service.reduce(id, 1);

	if (result.success) {
		const clockIndex = clocks.findIndex((c) => c.id === id);
		if (clockIndex >= 0) {
			clocks[clockIndex] = result.data;
		}
		addLog(
			`Reduziu '${result.data.name}'. Progresso: ${result.data.filledSegments}/${result.data.totalSegments}`,
		);
	} else {
		addLog(`Erro ao reduzir: ${result.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleRemove(id: string) {
	const result = await service.delete(id);
	if (result.success) {
		clocks = clocks.filter((c) => c.id !== id);
		addLog(`Removeu relógio com sucesso.`);
	} else {
		addLog(`Erro ao remover: ${result.error.message}`);
	}
}
</script>

<div class="flex gap-8 items-start w-full p-6 font-sans text-bone">
	<div class="flex-1 flex flex-col gap-6">
		<div class="bg-ruin border border-bronze p-6 rounded-lg flex flex-col gap-4 shadow-2xl">
			<h2 class="text-xl font-bold text-ether tracking-widest uppercase flex items-center gap-2">
                <span class="text-bronze">✦</span> Criar Relógio de Destino
            </h2>
			
			<div class="flex gap-4 items-end bg-void p-4 rounded border border-bronze/30">
				<div class="flex flex-col gap-1 flex-1">
					<label for="c-name" class="text-xs text-ether font-bold uppercase opacity-70">Nome do Evento</label>
					<input 
                        id="c-name" 
                        type="text" 
                        bind:value={newClockName} 
                        class="bg-ruin border border-bronze/50 p-2 text-bone rounded outline-none focus:border-ether transition-all" 
                    />
				</div>
				<div class="flex flex-col gap-1 w-24">
					<label for="c-seg" class="text-xs text-ether font-bold uppercase opacity-70">Segmentos</label>
					<input 
                        id="c-seg" 
                        type="number" 
                        min="2" 
                        max="12" 
                        bind:value={newClockSegments} 
                        class="bg-ruin border border-bronze/50 p-2 text-bone rounded text-center outline-none focus:border-ether" 
                    />
				</div>
				<button 
                    onclick={handleCreate} 
                    class="bg-bronze hover:bg-ether text-void font-bold px-8 py-2 rounded transition-all uppercase tracking-widest text-sm shadow-md"
                >
					Forjar
				</button>
			</div>
		</div>

		<div class="flex flex-wrap gap-6 items-start">
			{#each clocks as clock (clock.id)}
				<div class="flex flex-col gap-3 items-center group">
					<ClockWidget {clock} />
					<div class="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
						<button 
							onclick={() => handleReduce(clock.id)}
							disabled={clock.filledSegments === 0}
							class="w-10 h-10 flex items-center justify-center bg-void border border-bronze rounded-full hover:bg-ruin hover:border-ether hover:text-ether disabled:opacity-30 disabled:cursor-not-allowed transition-all"
							title="Reduzir Progresso"
						>
							-
						</button>
						<button 
							onclick={() => handleAdvance(clock.id)}
							disabled={clock.isCompleted}
							class="w-10 h-10 flex items-center justify-center bg-void border border-ether text-ether rounded-full hover:bg-ether hover:text-void disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
							title="Avançar Progresso"
						>
							+
						</button>
						<button 
							onclick={() => handleRemove(clock.id)}
							class="w-10 h-10 flex items-center justify-center text-bone/30 hover:text-blood-shadow transition-colors"
							title="Remover Relógio"
						>
							×
						</button>
					</div>
				</div>
			{/each}
			{#if clocks.length === 0}
				<div class="w-full text-center py-12 border-2 border-dashed border-bronze/20 rounded-lg">
                    <p class="text-ether/40 italic font-serif">O tear do destino aguarda a criação de novos fios...</p>
                </div>
			{/if}
		</div>
	</div>

	<div class="w-80 bg-ruin border border-bronze rounded-lg p-5 flex flex-col h-[600px] shadow-2xl">
		<div class="flex justify-between items-center border-b border-ether/30 pb-3 mb-4">
            <h3 class="font-bold text-bone uppercase tracking-widest text-sm">Crônicas</h3>
            <span class="text-[10px] text-ether opacity-50">LOG DE SISTEMA</span>
        </div>
		<div class="flex flex-col gap-2 overflow-y-auto flex-1 pr-2">
			{#each logs as log}
				<div class="text-xs p-3 bg-void rounded border border-bronze/20 leading-relaxed">
					{#if log.includes("⚡ EVENTO DISPARADO")}
						<span class="text-ether font-bold animate-pulse">{log}</span>
					{:else if log.includes("Erro")}
						<span class="text-blood-shadow font-semibold">{log}</span>
					{:else}
						<span class="text-bone/60 font-mono"><span class="text-bronze opacity-50">></span> {log}</span>
					{/if}
				</div>
			{/each}
			{#if logs.length === 0}
				<p class="text-[11px] text-bone/20 italic text-center mt-10">O silêncio das eras prevalece...</p>
			{/if}
		</div>
	</div>
</div>


