<script lang="ts">
import { saveGameSnapshotSchema } from "$lib/shared/rpc";
import { WorkerSaveRepository } from "../infrastructure/WorkerSaveRepository";

const repository = new WorkerSaveRepository();

let statusMessage = $state<string | null>(null);
let statusType = $state<"success" | "error" | "info" | null>(null);
let isProcessing = $state(false);

function showStatus(msg: string, type: "success" | "error" | "info") {
	statusMessage = msg;
	statusType = type;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleExport() {
	if (isProcessing) return;
	isProcessing = true;
	showStatus("Consultando tear do destino para extrair registros...", "info");

	const res = await repository.getSnapshot();
	isProcessing = false;

	if (res.success) {
		try {
			const jsonString = JSON.stringify(res.data, null, 2);
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			a.href = url;
			a.download = `pandorha-save-${timestamp}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showStatus(
				"Crônicas exportadas com sucesso! Arquivo JSON baixado.",
				"success",
			);
		} catch (error: any) {
			showStatus(`Erro ao gerar arquivo de save: ${error.message}`, "error");
		}
	} else {
		showStatus(`Erro ao exportar save: ${res.error.message}`, "error");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleImport(event: Event) {
	if (isProcessing) return;
	const input = event.target as HTMLInputElement;
	if (!input.files || input.files.length === 0) return;

	const file = input.files[0];
	if (!file) return;

	isProcessing = true;
	showStatus("Lendo pergaminho de save do arquivo local...", "info");

	const reader = new FileReader();
	reader.onload = async (e) => {
		try {
			const content = e.target?.result as string;
			const parsed = JSON.parse(content);

			// Validação do schema Zod
			const validation = saveGameSnapshotSchema.safeParse(parsed);
			if (!validation.success) {
				const errors = validation.error.issues
					.map((i) => `${i.path.join(".")}: ${i.message}`)
					.join(", ");
				showStatus(`Arquivo corrompido ou inválido: ${errors}`, "error");
				isProcessing = false;
				return;
			}

			showStatus(
				"Restaurando a realidade narrativa no SQLite local...",
				"info",
			);
			const saveRes = await repository.saveSnapshot(validation.data);
			isProcessing = false;

			if (saveRes.success) {
				showStatus(
					"O tear do destino foi reescrito com sucesso! Recarregando a página em 3 segundos para aplicar as mudanças...",
					"success",
				);
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			} else {
				showStatus(
					`Erro ao gravar save no banco: ${saveRes.error.message}`,
					"error",
				);
			}
		} catch (err: any) {
			isProcessing = false;
			showStatus(`Erro ao processar JSON: ${err.message}`, "error");
		}
	};
	reader.onerror = () => {
		isProcessing = false;
		showStatus("Falha na leitura física do arquivo.", "error");
	};
	reader.readAsText(file);
}
</script>

<div class="flex flex-col gap-6 max-w-2xl mx-auto p-6 bg-ruin border border-bronze rounded-lg shadow-2xl font-sans text-bone">
	<div class="border-b border-ether/30 pb-4">
		<h2 class="text-2xl font-bold text-ether tracking-widest uppercase flex items-center gap-2">
			<span class="text-bronze">✦</span> Soberania de Dados (Save Local)
		</h2>
		<p class="text-xs text-bone/60 mt-1 leading-relaxed">
			O Pandorha Engine opera sob o pilar <strong>local-first</strong>. Todo o progresso do seu Bastião, Fichas de Personagem, Standing Social, e Relógios de Progresso é gravado localmente no seu navegador através de um banco de dados SQLite físico no OPFS (Origin Private File System). Aqui você pode fazer cópias de segurança (backups) ou transferir seus dados de jogo.
		</p>
	</div>

	{#if statusMessage}
		<div class="p-4 rounded border text-sm leading-relaxed transition-all duration-300
			{statusType === 'success' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : ''}
			{statusType === 'error' ? 'bg-red-950/40 border-red-500/50 text-red-300' : ''}
			{statusType === 'info' ? 'bg-sky-950/40 border-sky-500/50 text-sky-300 animate-pulse' : ''}"
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

	<div class="grid md:grid-cols-2 gap-6 mt-2">
		<!-- Card de Exportação -->
		<div class="flex flex-col gap-4 p-5 bg-void rounded border border-bronze/30 hover:border-bronze/60 transition-all">
			<div class="flex items-center gap-2">
				<span class="text-lg">📥</span>
				<h3 class="font-bold text-ether uppercase tracking-wider text-sm">Exportar Campanha</h3>
			</div>
			<p class="text-xs text-bone/60 leading-relaxed flex-1">
				Extraia um snapshot completo de todo o estado do jogo contido no SQLite local. O arquivo gerado (.json) pode ser arquivado no seu computador ou importado em outro navegador/dispositivo.
			</p>
			<button
				type="button"
				onclick={handleExport}
				disabled={isProcessing}
				class="w-full bg-bronze hover:bg-ether disabled:bg-bronze/20 text-void font-bold py-2.5 px-4 rounded transition-all uppercase tracking-widest text-xs shadow-md disabled:cursor-not-allowed"
			>
				{isProcessing ? 'Processando...' : 'Baixar Snapshot JSON'}
			</button>
		</div>

		<!-- Card de Importação -->
		<div class="flex flex-col gap-4 p-5 bg-void rounded border border-bronze/30 hover:border-bronze/60 transition-all">
			<div class="flex items-center gap-2">
				<span class="text-lg">📤</span>
				<h3 class="font-bold text-ether uppercase tracking-wider text-sm">Importar Campanha</h3>
			</div>
			<p class="text-xs text-bone/60 leading-relaxed flex-1">
				Carregue um arquivo de save (.json) previamente exportado. <strong class="text-bronze">Atenção:</strong> esta ação irá deletar e substituir de forma definitiva todo o seu progresso atual no SQLite local.
			</p>
			
			<label 
				class="w-full bg-void border border-bronze hover:border-ether text-ether hover:text-void hover:bg-ether font-bold py-2.5 px-4 rounded transition-all uppercase tracking-widest text-xs text-center cursor-pointer block disabled:opacity-30 disabled:cursor-not-allowed"
				class:opacity-50={isProcessing}
			>
				{isProcessing ? 'Aguarde...' : 'Selecionar Arquivo JSON'}
				<input
					type="file"
					accept=".json"
					onchange={handleImport}
					disabled={isProcessing}
					class="hidden"
				/>
			</label>
		</div>
	</div>
</div>
