<script lang="ts">
import { CampService } from "../domain/CampService";
import type { CampSession } from "../domain/types";

interface Props {
	isRestBlocked?: boolean;
	isInfectionBlocked?: boolean;
	characterName?: string;
}
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
let {
	isRestBlocked = false,
	isInfectionBlocked = false,
	characterName = "Andarilho",
}: Props = $props();

// Instância do serviço
const campService = new CampService();

// Estado reativo (Svelte 5 Runes)
let totalHours = $state(12);
let session = $state<CampSession | null>(null);
let dangerRoll = $state<number | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
let message = $state("Prepare seu acampamento...");

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function startCamp() {
	if (isRestBlocked) {
		message =
			"⚠️ O acampamento falhou! Os cobradores de sangue estão no seu encalço.";
		return;
	}
	session = campService.createSession({ totalTime: totalHours });
	message = "Acampamento iniciado. Aloque suas tarefas.";
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function passHour() {
	if (!session) return;
	if (session.availableActions <= 0) {
		message = "Todas as ações de vigília foram consumidas.";
		return;
	}

	session.availableActions--;
	session.dangerCounter++;
	session = { ...session };
	message = `Uma hora se passou. O perigo aumenta (Atual: ${session.dangerCounter}).`;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function checkEncounter() {
	if (!session) return;

	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	dangerRoll = (array[0] % 20) + 1;

	if (dangerRoll <= session.dangerCounter) {
		message =
			"⚠️ UM ENCONTRO OCORREU! Caçadores e perigos das ruínas cercaram vocês. O perigo voltou a 0.";
		session.dangerCounter = 0;
		session = { ...session };
	} else {
		message = "A noite nas ruínas biomecânicas continua tranquila...";
	}
}
</script>

<div class="max-w-[650px] my-8 mx-auto p-6 bg-ruin text-bone rounded-lg border border-bronze shadow-2xl relative overflow-hidden">
    <div class="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <span class="text-5xl text-bronze">🔥</span>
    </div>

    <header class="flex justify-between items-center mb-6 border-b border-bronze/30 pb-4 z-10">
        <h2 class="text-xl font-bold text-ether tracking-wide">🔥 Códex de Acampamento</h2>
        <span class="text-[10px] text-ether font-mono tracking-widest uppercase opacity-65">Descanso Ativo</span>
    </header>

    {#if isInfectionBlocked}
        <!-- Alerta de bloqueio imersivo: Infecção de Ferida -->
        <div class="p-5 bg-void border border-emerald-500 rounded-lg flex flex-col gap-3 text-center my-4 z-10 animate-pulse">
            <h3 class="text-lg font-bold text-emerald-500 uppercase tracking-widest">⚠️ INFECÇÃO BIOMECÂNICA ATIVA ⚠️</h3>
            <p class="text-xs text-bone/70 leading-relaxed">
                Atenção! Os sobreviventes <span class="text-emerald-400 font-bold">{characterName}</span> estão com **Infecções Físicas Graves** ativas em seus corpos sintéticos. O repouso nas ruínas não curará seus ferimentos e a cura natural foi bloqueada.
            </p>
            <div class="px-3 py-2 bg-emerald-950/40 rounded border border-emerald-800/40 text-xs text-emerald-300 font-mono">
                DESCANSO COMPROMETIDO: Trate as infecções com medicamentos ou alquimia antes do acampamento.
            </div>
        </div>
    {:else if isRestBlocked}
        <!-- Alerta de bloqueio imersivo: Marcado pela Dívida -->
        <div class="p-5 bg-void border border-bronze rounded-lg flex flex-col gap-3 text-center my-4 z-10 animate-pulse">
            <h3 class="text-lg font-bold text-bronze uppercase tracking-widest">⚠️ MARCA DA DÍVIDA ATIVA ⚠️</h3>
            <p class="text-xs text-bone/70 leading-relaxed">
                Atenção, <span class="text-ether font-bold">{characterName}</span>! Suas pendências e **Dívidas de Sangue** acumuladas com as facções superam drasticamente sua fama. Caçadores implacáveis e cobradores de dízimo biomecânicos cercam as proximidades.
            </p>
            <div class="px-3 py-2 bg-ruin/50 rounded border border-bronze/30 text-xs text-bronze font-mono">
                DESCANSO BLOQUEADO: Pague suas dívidas para poder repousar em segurança.
            </div>
        </div>
    {:else if !session}
        <div class="setup-view flex flex-col gap-4 items-center py-6 z-10">
            <p class="text-sm italic text-bone/80">Quantas horas o grupo de {characterName} pretende descansar?</p>
            <div class="flex items-center gap-4">
                <input 
                    type="number" 
                    bind:value={totalHours} 
                    min="8" 
                    max="24"
                    class="w-20 p-2 bg-void border border-bronze rounded text-center text-bone font-mono outline-none focus:border-ether"
                />
                <button 
                    onclick={startCamp}
                    class="px-6 py-2 bg-bronze hover:bg-ether hover:text-void text-bone rounded font-bold transition-all shadow-md uppercase tracking-wider text-xs"
                >
                    Montar Acampamento
                </button>
            </div>
        </div>
    {:else}
        <div class="session-view grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
            <div class="stats-panel bg-void border border-bronze/50 p-4 rounded flex flex-col gap-4">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-ether border-b border-bronze/20 pb-2">Status do Grupo</h3>
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-bone/70">Tempo Total:</span>
                        <span class="font-mono text-ether">{session.totalTime}h</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-bone/70">Ações Disponíveis:</span>
                        <span class="font-mono text-ether">{session.availableActions}</span>
                    </div>
                    <div class="flex flex-col items-center mt-4 p-4 bg-ruin rounded border border-bronze/30">
                        <span class="text-[10px] uppercase tracking-wider text-bone/50 mb-1">Contador de Perigo</span>
                        <span class="text-4xl font-bold text-ether">{session.dangerCounter}</span>
                    </div>
                </div>
            </div>

            <div class="actions-panel flex flex-col gap-3 justify-center">
                <button 
                    onclick={passHour}
                    disabled={session.availableActions <= 0}
                    class="w-full py-3 bg-void border border-ether text-ether hover:bg-ether hover:text-void disabled:opacity-40 disabled:border-bronze disabled:text-bone rounded font-bold transition-all uppercase tracking-widest text-xs"
                >
                    ⌛ Passar 1 Hora (Vigília)
                </button>
                
                <button 
                    onclick={checkEncounter}
                    class="w-full py-3 bg-void border border-bronze text-bone hover:bg-bronze hover:text-void rounded font-bold transition-all uppercase tracking-widest text-xs"
                >
                    🎲 Testar Encontro (d20)
                </button>

                {#if dangerRoll !== null}
                    <div class="roll-result text-center mt-2 p-3 bg-void rounded border border-ether animate-pulse">
                        <span class="text-[10px] text-bone/50 uppercase block mb-1">Resultado do Destino</span>
                        <span class="font-bold text-2xl text-ether">{dangerRoll}</span>
                    </div>
                {/if}
            </div>
        </div>

        <div class="log-view mt-6 p-4 bg-void rounded border border-bronze/30 min-h-20 z-10">
            <p class="text-xs font-mono text-bone/70 leading-relaxed italic">
                <span class="text-ether font-bold">#</span> {message}
            </p>
        </div>

        <div class="mt-6 flex justify-center z-10">
            <button 
                onclick={() => { session = null; dangerRoll = null; }}
                class="text-[10px] text-bone/35 hover:text-ether transition-colors uppercase tracking-widest underline"
            >
                Abandonar Acampamento
            </button>
        </div>
    {/if}
</div>

