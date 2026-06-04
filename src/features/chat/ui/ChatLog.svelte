<script lang="ts">
import { onMount, tick } from "svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { type ChatMessage, chatState } from "../model/chatState.svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import RollModifiersDrawer from "./RollModifiersDrawer.svelte";

interface Props {
	isMasterMode?: boolean;
}

let { isMasterMode = false }: Props = $props();

let chatContainer: HTMLDivElement | null = $state(null);
let inputMessage = $state("");

let filteredMessages = $derived(
	chatState.messages.filter((msg) => {
		if (msg.isGmOnly && !isMasterMode) {
			return false;
		}
		return true;
	}),
);

// Sempre que a lista de mensagens mudar, rola para o final
$effect(() => {
	if (filteredMessages.length && chatContainer) {
		tick().then(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		});
	}
});

function sendMessage() {
	if (!inputMessage.trim()) return;

	chatState.addMessage({
		type: "narrative",
		sender: "Mestre",
		content: inputMessage.trim(),
	});

	inputMessage = "";
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleKeyDown(event: KeyboardEvent) {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault();
		sendMessage();
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function clearChat() {
	chatState.clearMessages();
}

onMount(() => {
	// Adiciona mensagem inicial de boas-vindas do sistema
	if (chatState.messages.length === 0) {
		chatState.addMessage({
			type: "system",
			content:
				"✨ **Pandorha Engine Cockpit** carregado. Clique nos atributos dos personagens ou eixos para rolar d20 automaticamente.",
		});
	}

	// Scroll inicial
	if (chatContainer) {
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}
});
</script>

<div class="flex flex-col h-full border border-bronze/40 bg-void/70 rounded-lg overflow-hidden glass-runic shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
	<!-- Cabeçalho do Chat -->
	<div class="flex items-center justify-between px-4 py-2 border-b border-bronze/35 bg-ruin/40">
		<h3 class="text-xs font-extrabold uppercase tracking-wider text-ether flex items-center gap-1.5">
			<span>📜</span> Diário do Cockpit & Rolagens
		</h3>
		<button
			type="button"
			class="text-[10px] font-bold text-blood hover:text-blood/80 bg-void/50 px-2 py-0.5 border border-blood/30 hover:border-blood transition-colors rounded-sm"
			onclick={clearChat}
			title="Limpar logs"
		>
			Limpar
		</button>
	</div>

	<!-- Container de Mensagens -->
	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-bronze/30 scrollbar-track-void/20"
		style="max-height: 420px; min-height: 250px;"
	>
		{#each filteredMessages as msg (msg.id)}
			<div class="flex flex-col text-xs leading-normal">
				<!-- Cabeçalho da Mensagem -->
				<div class="flex items-baseline justify-between text-[9px] text-ether/60 mb-0.5 font-medium">
					{#if msg.sender}
						<span class="font-bold uppercase text-ether tracking-wider">{msg.sender}</span>
					{:else}
						<span class="font-semibold italic text-purple-runic">Sistema</span>
					{/if}
					<span>{msg.timestamp}</span>
				</div>

				<!-- Corpo da Mensagem -->
				<div class="rounded px-2.5 py-1.5 break-words border-l-2
					{msg.type === 'roll' ? 'bg-purple-runic/5 border-purple-runic text-bone' : ''}
					{msg.type === 'system' ? 'bg-ruin/20 border-ether/40 text-ether/90 italic' : ''}
					{msg.type === 'combat' ? 'bg-blood-shadow/10 border-blood text-bone' : ''}
					{msg.type === 'camp' ? 'bg-orange-hungry/5 border-orange-hungry text-bone' : ''}
					{msg.type === 'narrative' ? 'bg-ruin/40 border-bronze text-bone' : ''}"
				>
					{@html msg.content
						.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
						.replace(/\*(.*?)\*/g, '<em>$1</em>')
						.replace(/\n/g, '<br/>')}
				</div>
			</div>
		{:else}
			<div class="text-xs italic text-ether/40 p-4 text-center">Nenhum log registrado.</div>
		{/each}
	</div>

	<!-- Drawer de Modificadores Globais -->
	<div class="p-2 border-t border-bronze/25 bg-ruin/20">
		<RollModifiersDrawer />
	</div>

	<!-- Input de Envio -->
	<div class="p-2 border-t border-bronze/30 bg-void/90 flex gap-2">
		<textarea
			bind:value={inputMessage}
			onkeydown={handleKeyDown}
			placeholder="Mensagem rápida ou nota narrativa..."
			class="flex-1 bg-ruin/45 border border-bronze/40 hover:border-bronze/70 focus:border-ether text-xs text-bone px-3 py-1.5 rounded focus:outline-none resize-none overflow-y-auto"
			rows="1"
		></textarea>
		<button
			type="button"
			class="px-4 bg-ether border border-ether text-void hover:bg-void hover:text-ether transition-all duration-300 font-bold uppercase tracking-wider text-xs rounded shadow-[0_0_8px_rgba(0,240,255,0.15)] focus:outline-none"
			onclick={sendMessage}
		>
			Enviar
		</button>
	</div>
</div>


