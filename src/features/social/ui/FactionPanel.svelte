<script lang="ts">
import { InMemorySocialRepository } from "$lib/entities/social";
import type {
	BloodDebtRecord,
	ReputationRecord,
} from "$lib/entities/social/model/socialSchema";
import { SocialStandingService } from "$lib/features/social/domain/SocialStandingService";

interface Props {
	service?: SocialStandingService;
	characterId?: string;
	onStandingChange?: (isRestBlocked: boolean) => void;
}

let {
	service = $bindable(),
	characterId = "char-wanderer",
	onStandingChange,
}: Props = $props();

// Se o serviço não foi fornecido, inicializamos um local em memória compartilhado
if (!service) {
	const localRepo = new InMemorySocialRepository();
	service = new SocialStandingService(localRepo);
}

// Estados reativos (Svelte 5 Runes)
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let reputations = $state<ReputationRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let debts = $state<BloodDebtRecord[]>([]);
let isRestBlocked = $state(false);

// Form inputs
let debtTarget = $state("");
let debtValue = $state(10);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let feedbackMessage = $state("");

// Inicialização
$effect(() => {
	loadStanding();
});

async function loadStanding() {
	if (!service) return;
	const standing = await service.getCharacterStanding(characterId);
	reputations = [...standing.reputations];
	debts = [...standing.debts];
	isRestBlocked = await service.isRestBlocked(characterId);

	if (onStandingChange) {
		onStandingChange(isRestBlocked);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function adjustReputation(factionId: string, delta: number) {
	if (!service) return;
	const res = await service.updateReputation(characterId, factionId, delta);
	if (res.success) {
		feedbackMessage = `Fama alterada com sucesso (${delta > 0 ? "+" : ""}${delta})`;
		await loadStanding();
	} else {
		feedbackMessage = `Falha: ${res.error.message}`;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleAddDebt(e: Event) {
	e.preventDefault();
	if (!service || !debtTarget.trim() || debtValue <= 0) return;

	const res = await service.addBloodDebt(characterId, debtTarget, debtValue);
	if (res.success) {
		feedbackMessage = `Dívida de sangue com ${debtTarget} adicionada!`;
		debtTarget = "";
		debtValue = 10;
		await loadStanding();
	} else {
		feedbackMessage = `Erro: ${res.error.message}`;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const factionNames: Record<string, string> = {
	"fac-ether": "Guardiões do Ether",
	"fac-ruin": "Sectários da Ruína",
	"fac-bronze": "Sindicato de Bronze",
};

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const alignmentColors: Record<string, string> = {
	order: "text-ether border-ether/40",
	chaos: "text-bronze border-bronze/40",
	neutral: "text-bone border-bone/35",
};
</script>

<div class="flex flex-col gap-5 p-5 bg-ruin rounded-lg border border-bronze text-bone w-80 shadow-2xl relative overflow-hidden">
	<div class="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
		<span class="text-4xl text-ether">⚖</span>
	</div>

	<header class="flex justify-between items-center border-b border-bronze/30 pb-3">
		<h4 class="font-bold text-sm text-ether uppercase tracking-widest">Aliança & Standing</h4>
		<span class="text-[9px] text-bone/50 font-mono uppercase">Social Real</span>
	</header>

	<!-- Status de Bloqueio do Descanso -->
	<div class="p-3 bg-void border rounded flex flex-col gap-2 items-center text-center transition-all {isRestBlocked ? 'border-bronze animate-pulse' : 'border-ether/30'}">
		<span class="text-[9px] uppercase tracking-wider text-bone/50">Status de Sobrevivência</span>
		{#if isRestBlocked}
			<strong class="text-xs text-bronze uppercase tracking-widest">⚠️ Marcado pela Dívida ⚠️</strong>
			<span class="text-[10px] text-bone/70 italic leading-snug">Caçadores a postos. Descanso ativo bloqueado no acampamento!</span>
		{:else}
			<strong class="text-xs text-ether uppercase tracking-widest">✔ Descanso Seguro</strong>
			<span class="text-[10px] text-bone/70 italic leading-snug">Sua fama cobre suas pendências. Acampamento liberado.</span>
		{/if}
	</div>

	<!-- Fama e Facções -->
	<div class="flex flex-col gap-3">
		<h5 class="text-[10px] font-bold text-bone/45 uppercase tracking-wider">Reputação de Facção</h5>
		
		<div class="flex flex-col gap-2.5">
			<!-- Guardiões do Ether -->
			<div class="bg-void border border-bronze/20 rounded p-2.5 flex flex-col gap-2">
				<div class="flex justify-between items-center">
					<span class="font-bold text-xs text-bone">Guardiões do Ether</span>
					<span class="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border {alignmentColors['order']}">Ordem</span>
				</div>
				<div class="flex justify-between items-center text-xs">
					<span class="text-bone/60">Fama: <strong class="text-ether">{reputations.find(r => r.factionId === 'fac-ether')?.value ?? 0}</strong></span>
					<div class="flex gap-1">
						<button onclick={() => adjustReputation('fac-ether', -2)} class="px-1.5 py-0.5 bg-ruin hover:bg-bronze text-bone border border-bronze/35 rounded text-[10px] font-mono font-bold">-2</button>
						<button onclick={() => adjustReputation('fac-ether', 5)} class="px-1.5 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-ether/40 rounded text-[10px] font-mono font-bold">+5</button>
					</div>
				</div>
			</div>

			<!-- Sectários da Ruína -->
			<div class="bg-void border border-bronze/20 rounded p-2.5 flex flex-col gap-2">
				<div class="flex justify-between items-center">
					<span class="font-bold text-xs text-bone">Sectários da Ruína</span>
					<span class="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border {alignmentColors['chaos']}">Caos</span>
				</div>
				<div class="flex justify-between items-center text-xs">
					<span class="text-bone/60">Fama: <strong class="text-ether">{reputations.find(r => r.factionId === 'fac-ruin')?.value ?? 0}</strong></span>
					<div class="flex gap-1">
						<button onclick={() => adjustReputation('fac-ruin', -2)} class="px-1.5 py-0.5 bg-ruin hover:bg-bronze text-bone border border-bronze/35 rounded text-[10px] font-mono font-bold">-2</button>
						<button onclick={() => adjustReputation('fac-ruin', 5)} class="px-1.5 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-ether/40 rounded text-[10px] font-mono font-bold">+5</button>
					</div>
				</div>
			</div>

			<!-- Sindicato de Bronze -->
			<div class="bg-void border border-bronze/20 rounded p-2.5 flex flex-col gap-2">
				<div class="flex justify-between items-center">
					<span class="font-bold text-xs text-bone">Sindicato de Bronze</span>
					<span class="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border {alignmentColors['neutral']}">Pragmático</span>
				</div>
				<div class="flex justify-between items-center text-xs">
					<span class="text-bone/60">Fama: <strong class="text-ether">{reputations.find(r => r.factionId === 'fac-bronze')?.value ?? 0}</strong></span>
					<div class="flex gap-1">
						<button onclick={() => adjustReputation('fac-bronze', -2)} class="px-1.5 py-0.5 bg-ruin hover:bg-bronze text-bone border border-bronze/35 rounded text-[10px] font-mono font-bold">-2</button>
						<button onclick={() => adjustReputation('fac-bronze', 5)} class="px-1.5 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-ether/40 rounded text-[10px] font-mono font-bold">+5</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Dívidas de Sangue Ativas -->
	<div class="flex flex-col gap-2 border-t border-bronze/20 pt-3">
		<h5 class="text-[10px] font-bold text-bone/45 uppercase tracking-wider">Dívidas de Sangue Ativas</h5>
		{#if debts.filter(d => !d.isPaid).length === 0}
			<p class="text-[10px] text-bone/40 italic">Sem dívidas ativas. Honra limpa.</p>
		{:else}
			<div class="flex flex-col gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
				{#each debts.filter(d => !d.isPaid) as debt}
					<div class="text-[10px] bg-void/50 border border-bronze/30 p-2 rounded flex justify-between items-center font-mono">
						<span class="text-bone/85">{debt.targetName}</span>
						<span class="text-bronze font-bold">{debt.debtValue} PO</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Formulário para Registrar Dívida -->
	<form onsubmit={handleAddDebt} class="flex flex-col gap-2 border-t border-bronze/20 pt-3">
		<span class="text-[10px] font-bold text-bone/45 uppercase tracking-wider">Contrair Nova Dívida</span>
		<div class="flex gap-2">
			<input 
				type="text" 
				placeholder="Credor/Facção" 
				bind:value={debtTarget}
				class="flex-1 text-xs p-1.5 bg-void border border-bronze/40 rounded text-bone outline-none focus:border-ether font-sans"
				required
			/>
			<input 
				type="number" 
				bind:value={debtValue}
				min="1"
				class="w-16 text-xs p-1.5 bg-void border border-bronze/40 rounded text-center text-bone font-mono outline-none focus:border-ether"
				required
			/>
		</div>
		<button 
			type="submit"
			class="w-full py-1.5 bg-bronze hover:bg-ether hover:text-void text-bone rounded font-bold text-[10px] transition-all uppercase tracking-wider"
		>
			+ Contrair Dívida
		</button>
	</form>

	{#if feedbackMessage}
		<p class="text-[9px] font-mono text-ether text-center mt-1 animate-pulse"># {feedbackMessage}</p>
	{/if}
</div>


