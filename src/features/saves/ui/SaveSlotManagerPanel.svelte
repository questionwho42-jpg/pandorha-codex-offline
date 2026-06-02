<script lang="ts">
import { onMount } from "svelte";
import { saveGameSnapshotSchema } from "$lib/shared/rpc";
import { WorkerSaveRepository } from "../infrastructure/WorkerSaveRepository";

const repository = new WorkerSaveRepository();

let slots = $state<
	{ fileName: string; sizeBytes: number; lastModified: string }[]
>([]);
let activeSaveFile = $state("pandorha.sqlite3");
let statusMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let statusType = $state<"success" | "error" | "info" | null>(null);
let isProcessing = $state(false);

// Inputs de formulário
let newSlotName = $state("");
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let isCreating = $state(false);
let cloneSourceName = $state<string | null>(null);
let cloneTargetName = $state("");

// Controle de Drag and Drop
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let isDragging = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let fileInput = $state<HTMLInputElement | null>(null);

function showStatus(msg: string, type: "success" | "error" | "info") {
	statusMessage = msg;
	statusType = type;
	if (type === "success" || type === "error") {
		setTimeout(() => {
			if (statusMessage === msg) {
				statusMessage = null;
				statusType = null;
			}
		}, 5000);
	}
}

async function loadSlots() {
	isProcessing = true;
	const res = await repository.listSaveSlots();
	isProcessing = false;
	if (res.success) {
		slots = res.data.sort((a, b) =>
			b.lastModified.localeCompare(a.lastModified),
		);
	} else {
		showStatus(`Erro ao listar saves: ${res.error.message}`, "error");
	}
}

onMount(() => {
	if (typeof window !== "undefined") {
		activeSaveFile =
			window.localStorage.getItem("pandorha_active_save_file") ||
			"pandorha.sqlite3";
	}
	void loadSlots();
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleCreateSlot() {
	if (!newSlotName.trim()) return;
	const sanitized = newSlotName.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
	const fileName = `${sanitized}.sqlite3`;

	if (slots.some((s) => s.fileName.toLowerCase() === fileName.toLowerCase())) {
		showStatus("Um arquivo com esse nome já existe.", "error");
		return;
	}

	isProcessing = true;
	showStatus(`Forjando novo slot de save [${fileName}]...`, "info");
	const res = await repository.createSaveSlot(fileName);
	isProcessing = false;

	if (res.success) {
		newSlotName = "";
		isCreating = false;
		showStatus(`Slot ${fileName} criado com sucesso!`, "success");
		void loadSlots();
	} else {
		showStatus(`Erro ao criar slot: ${res.error.message}`, "error");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleCloneSlot() {
	if (!cloneSourceName || !cloneTargetName.trim()) return;
	const sanitized = cloneTargetName.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
	const fileName = `${sanitized}.sqlite3`;

	if (slots.some((s) => s.fileName.toLowerCase() === fileName.toLowerCase())) {
		showStatus("Um arquivo de destino com esse nome já existe.", "error");
		return;
	}

	isProcessing = true;
	showStatus(
		`Clonando registros de ${cloneSourceName} para ${fileName}...`,
		"info",
	);
	const res = await repository.cloneSaveSlot(cloneSourceName, fileName);
	isProcessing = false;

	if (res.success) {
		cloneTargetName = "";
		cloneSourceName = null;
		showStatus("Cópia de campanha realizada com sucesso!", "success");
		void loadSlots();
	} else {
		showStatus(`Erro ao duplicar save: ${res.error.message}`, "error");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleLoadSlot(fileName: string) {
	if (isProcessing) return;
	isProcessing = true;
	showStatus(`Sintonizando realidade com o save [${fileName}]...`, "info");

	if (typeof window !== "undefined") {
		window.localStorage.setItem("pandorha_active_save_file", fileName);
		showStatus("Fenda temporal estabelecida! Recarregando app...", "success");
		setTimeout(() => {
			window.location.reload();
		}, 1500);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleDeleteSlot(fileName: string) {
	if (fileName === activeSaveFile || fileName === "pandorha.sqlite3") {
		showStatus(
			"Não é permitido deletar o save ativo ou o arquivo inicial.",
			"error",
		);
		return;
	}

	if (
		!confirm(
			`Tem certeza de que deseja expurgar permanentemente o save [${fileName}]?`,
		)
	) {
		return;
	}

	isProcessing = true;
	showStatus(`Eliminando arquivo físico [${fileName}] do OPFS...`, "info");
	const res = await repository.deleteSaveSlot(fileName);
	isProcessing = false;

	if (res.success) {
		showStatus(`Arquivo ${fileName} removido com sucesso.`, "success");
		void loadSlots();
	} else {
		showStatus(`Erro ao excluir: ${res.error.message}`, "error");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleExport() {
	if (isProcessing) return;
	isProcessing = true;
	showStatus("Consultando registros do save ativo para exportar...", "info");

	const res = await repository.getSnapshot();
	isProcessing = false;

	if (res.success) {
		try {
			const jsonString = JSON.stringify(res.data, null, 2);
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			const cleanName = activeSaveFile.replace(".sqlite3", "");
			a.href = url;
			a.download = `pandorha-save-${cleanName}-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showStatus(
				"Crônicas exportadas com sucesso! Backup JSON baixado.",
				"success",
			);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			showStatus(`Erro ao gerar JSON de backup: ${errMsg}`, "error");
		}
	} else {
		showStatus(`Erro ao exportar save ativo: ${res.error.message}`, "error");
	}
}

async function processFile(file: File) {
	isProcessing = true;
	showStatus("Lendo pergaminho de save local...", "info");

	const reader = new FileReader();
	reader.onload = async (e) => {
		try {
			const content = e.target?.result as string;
			const parsed = JSON.parse(content);

			const validation = saveGameSnapshotSchema.safeParse(parsed);
			if (!validation.success) {
				const errors = validation.error.issues
					.map((i) => `${i.path.join(".")}: ${i.message}`)
					.join(", ");
				showStatus(`Arquivo inválido ou corrompido: ${errors}`, "error");
				isProcessing = false;
				return;
			}

			showStatus(
				"Reescrevendo a realidade narrativa no SQLite ativo...",
				"info",
			);
			const saveRes = await repository.saveSnapshot(validation.data);
			isProcessing = false;

			if (saveRes.success) {
				showStatus("Realidade reescrita! Recarregando a página...", "success");
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else {
				showStatus(
					`Erro ao salvar no banco: ${saveRes.error.message}`,
					"error",
				);
			}
		} catch (err: unknown) {
			isProcessing = false;
			const errMsg = err instanceof Error ? err.message : String(err);
			showStatus(`Erro ao processar JSON: ${errMsg}`, "error");
		}
	};
	reader.onerror = () => {
		isProcessing = false;
		showStatus("Falha na leitura física do arquivo.", "error");
	};
	reader.readAsText(file);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function handleFileInput(event: Event) {
	if (isProcessing) return;
	const input = event.target as HTMLInputElement;
	if (input.files?.[0]) {
		void processFile(input.files[0]);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function handleDragOver(event: DragEvent) {
	event.preventDefault();
	if (isProcessing) return;
	isDragging = true;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function handleDragLeave() {
	isDragging = false;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function handleDrop(event: DragEvent) {
	event.preventDefault();
	isDragging = false;
	if (isProcessing) return;
	if (event.dataTransfer?.files?.[0]) {
		void processFile(event.dataTransfer.files[0]);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function formatDate(isoStr: string): string {
	try {
		return new Date(isoStr).toLocaleString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return isoStr;
	}
}
</script>

<div class="flex flex-col gap-6 max-w-4xl mx-auto p-6 bg-ruin border border-bronze rounded-lg shadow-2xl font-sans text-bone">
	<!-- Header -->
	<div class="border-b border-ether/30 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
		<div>
			<h2 class="text-2xl font-bold text-ether tracking-widest uppercase flex items-center gap-2">
				<span class="text-bronze">✦</span> Biblioteca de Linhas Temporais (Saves)
			</h2>
			<p class="text-xs text-bone/60 mt-1 leading-relaxed">
				Gerencie múltiplos arquivos de campanha locais persistidos no OPFS (SQLite local-first) ou importe/exporte snapshots JSON físicos.
			</p>
		</div>
		
		<div class="flex gap-2">
			{#if !isCreating && !cloneSourceName}
				<button
					type="button"
					onclick={() => { isCreating = true; }}
					disabled={isProcessing}
					class="bg-bronze hover:bg-ether text-void font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-all disabled:opacity-40"
				>
					+ Novo Save
				</button>
			{/if}
			<button
				type="button"
				onclick={loadSlots}
				disabled={isProcessing}
				class="bg-void border border-bronze/50 hover:border-bronze hover:text-ether text-bone font-bold py-2 px-3 rounded text-xs transition-all flex items-center gap-1"
			>
				⏳ {isProcessing ? 'Carregando...' : 'Atualizar'}
			</button>
		</div>
	</div>

	<!-- Status Message Feedback -->
	{#if statusMessage}
		<div class="p-4 rounded border text-sm leading-relaxed transition-all duration-300
			{statusType === 'success' ? 'bg-emerald-poison/10 border-emerald-poison/30 text-emerald-poison' : ''}
			{statusType === 'error' ? 'bg-blood-shadow/40 border-blood/50 text-bone' : ''}
			{statusType === 'info' ? 'bg-sky-runic/10 border-sky-runic/30 text-sky-runic animate-pulse' : ''}"
		>
			<div class="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-1">
				{#if statusType === 'success'}
					<span>✓ Sucesso</span>
				{:else if statusType === 'error'}
					<span>✗ Falha</span>
				{:else}
					<span>⏳ Processando</span>
				{/if}
			</div>
			{statusMessage}
		</div>
	{/if}

	<!-- Formulário Novo Save -->
	{#if isCreating}
		<form 
			onsubmit={(e) => { e.preventDefault(); void handleCreateSlot(); }}
			class="p-4 bg-void/50 border border-bronze/40 rounded flex flex-col md:flex-row gap-3 items-end"
		>
			<div class="flex-1 flex flex-col gap-1.5 w-full">
				<label for="newSaveName" class="text-xs uppercase font-bold text-ether tracking-wider">Nome da Campanha (Sem espaços ou caracteres especiais)</label>
				<input
					id="newSaveName"
					type="text"
					bind:value={newSlotName}
					placeholder="ex: campanha_bastiao_sombra"
					required
					class="w-full bg-ruin border border-bronze/30 focus:border-ether p-2 rounded text-sm text-bone focus:outline-none placeholder-bone/35"
				/>
			</div>
			<div class="flex gap-2 w-full md:w-auto">
				<button
					type="submit"
					disabled={isProcessing || !newSlotName.trim()}
					class="flex-1 md:flex-initial bg-bronze hover:bg-ether text-void font-bold py-2.5 px-5 rounded text-xs uppercase tracking-wider transition-all disabled:opacity-40"
				>
					Criar
				</button>
				<button
					type="button"
					onclick={() => { isCreating = false; newSlotName = ""; }}
					class="flex-1 md:flex-initial bg-void border border-bone/20 hover:border-bone/50 text-bone py-2.5 px-4 rounded text-xs uppercase tracking-wider transition-all"
				>
					Cancelar
				</button>
			</div>
		</form>
	{/if}

	<!-- Formulário Clonar Save -->
	{#if cloneSourceName}
		<form 
			onsubmit={(e) => { e.preventDefault(); void handleCloneSlot(); }}
			class="p-4 bg-void/50 border border-bronze/40 rounded flex flex-col md:flex-row gap-3 items-end"
		>
			<div class="flex-1 flex flex-col gap-1.5 w-full">
				<label for="cloneTargetName" class="text-xs uppercase font-bold text-ether tracking-wider">Nome do Clone (Duplicar {cloneSourceName})</label>
				<input
					id="cloneTargetName"
					type="text"
					bind:value={cloneTargetName}
					placeholder="ex: backup_campanha_fim"
					required
					class="w-full bg-ruin border border-bronze/30 focus:border-ether p-2 rounded text-sm text-bone focus:outline-none placeholder-bone/35"
				/>
			</div>
			<div class="flex gap-2 w-full md:w-auto">
				<button
					type="submit"
					disabled={isProcessing || !cloneTargetName.trim()}
					class="flex-1 md:flex-initial bg-bronze hover:bg-ether text-void font-bold py-2.5 px-5 rounded text-xs uppercase tracking-wider transition-all disabled:opacity-40"
				>
					Duplicar
				</button>
				<button
					type="button"
					onclick={() => { cloneSourceName = null; cloneTargetName = ""; }}
					class="flex-1 md:flex-initial bg-void border border-bone/20 hover:border-bone/50 text-bone py-2.5 px-4 rounded text-xs uppercase tracking-wider transition-all"
				>
					Cancelar
				</button>
			</div>
		</form>
	{/if}

	<!-- Listagem de Saves -->
	<div class="flex flex-col gap-3">
		<h3 class="text-sm font-bold text-ether uppercase tracking-wider border-b border-ether/10 pb-1.5">Arquivos SQLite Locais (OPFS)</h3>
		
		{#if slots.length === 0}
			<div class="p-8 text-center bg-void/35 border border-bronze/20 rounded text-sm text-bone/50">
				Nenhum slot encontrado. Clique em Novo Save para começar uma nova crônica.
			</div>
		{:else}
			<div class="flex flex-col gap-2.5">
				{#each slots as slot (slot.fileName)}
					{@const isActive = slot.fileName === activeSaveFile}
					<div 
						class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded border transition-all duration-300
							{isActive ? 'bg-bronze/5 border-bronze shadow-lg' : 'bg-void/40 border-bronze/20 hover:border-bronze/45 hover:bg-void/65'}"
					>
						<div class="flex flex-col gap-1 flex-1">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-mono text-sm font-bold tracking-wide {isActive ? 'text-ether' : 'text-bone'}">{slot.fileName}</span>
								{#if isActive}
									<span class="bg-bronze/25 border border-bronze text-bronze text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">⚔ Ativo</span>
								{/if}
								{#if slot.fileName === 'pandorha.sqlite3'}
									<span class="bg-bone/10 border border-bone/20 text-bone/70 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Inicial</span>
								{/if}
							</div>
							<div class="flex gap-4 text-xs text-bone/50">
								<span>Modificado: {formatDate(slot.lastModified)}</span>
								<span>Tamanho: {formatBytes(slot.sizeBytes)}</span>
							</div>
						</div>

						<div class="flex gap-2.5 mt-3 md:mt-0 w-full md:w-auto justify-end flex-wrap">
							{#if !isActive}
								<button
									type="button"
									onclick={() => handleLoadSlot(slot.fileName)}
									disabled={isProcessing}
									class="bg-void border border-bronze/60 text-bronze hover:bg-bronze hover:text-void font-bold py-1.5 px-3 rounded text-[11px] uppercase tracking-wider transition-all disabled:opacity-40"
								>
									Carregar
								</button>
							{/if}
							
							<button
								type="button"
								onclick={() => { cloneSourceName = slot.fileName; cloneTargetName = ""; }}
								disabled={isProcessing}
								class="bg-void border border-bone/30 text-bone/80 hover:border-ether hover:text-ether font-bold py-1.5 px-3 rounded text-[11px] uppercase tracking-wider transition-all disabled:opacity-40"
							>
								Clonar
							</button>

							{#if !isActive && slot.fileName !== 'pandorha.sqlite3'}
								<button
									type="button"
									onclick={() => handleDeleteSlot(slot.fileName)}
									disabled={isProcessing}
									class="bg-void border border-blood/60 text-blood hover:bg-blood hover:text-bone font-bold py-1.5 px-3 rounded text-[11px] uppercase tracking-wider transition-all disabled:opacity-40"
								>
									Excluir
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Backup e Interoperabilidade Físicos -->
	<div class="grid md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-ether/20">
		<!-- Exportação JSON -->
		<div class="flex flex-col gap-4 p-5 bg-void/50 rounded border border-bronze/30 hover:border-bronze/60 transition-all">
			<div class="flex items-center gap-2">
				<span class="text-lg">📥</span>
				<h3 class="font-bold text-ether uppercase tracking-wider text-xs">Exportar Backup Físico</h3>
			</div>
			<p class="text-[11px] text-bone/60 leading-relaxed flex-1">
				Compila os registros da campanha ativa atual (<strong>{activeSaveFile}</strong>) em um arquivo JSON. Excelente para transferir para outros navegadores ou guardar histórico de progresso fora do browser.
			</p>
			<button
				type="button"
				onclick={handleExport}
				disabled={isProcessing}
				class="w-full bg-bronze hover:bg-ether disabled:bg-bronze/20 text-void font-bold py-2 px-4 rounded transition-all uppercase tracking-widest text-[11px] shadow-md disabled:cursor-not-allowed"
			>
				{isProcessing ? 'Processando...' : 'Baixar Backup JSON'}
			</button>
		</div>

		<!-- Importação JSON (Drag & Drop) -->
		<div class="flex flex-col gap-4 p-5 bg-void/50 rounded border border-bronze/30 hover:border-bronze/60 transition-all">
			<div class="flex items-center gap-2">
				<span class="text-lg">📤</span>
				<h3 class="font-bold text-ether uppercase tracking-wider text-xs">Importar Backup Físico</h3>
			</div>
			<p class="text-[11px] text-bone/60 leading-relaxed">
				Restaura os dados a partir de um JSON. <strong class="text-bronze">Aviso:</strong> Substitui definitivamente o progresso do slot atualmente ativo (<strong>{activeSaveFile}</strong>).
			</p>
			
			<div 
				class="border border-dashed rounded p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[90px]
					{isDragging ? 'border-ether bg-ether/10 scale-[1.02]' : 'border-bronze/30 bg-void/35 hover:border-bronze/60'}"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				onclick={() => fileInput?.click()}
			>
				<span class="text-base mb-1">📂</span>
				<span class="text-[11px] text-bone/70 uppercase font-bold tracking-wider">
					{isDragging ? 'Solte o arquivo JSON aqui!' : 'Arraste ou clique para carregar JSON'}
				</span>
				
				<input
					type="file"
					accept=".json"
					onchange={handleFileInput}
					disabled={isProcessing}
					bind:this={fileInput}
					class="hidden"
				/>
			</div>
		</div>
	</div>
</div>
