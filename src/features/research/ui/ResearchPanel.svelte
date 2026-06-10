<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { ResearchService } from "$lib/entities/investigation/domain/ResearchService";
import { WorkerInvestigationRepository } from "$lib/entities/investigation/infrastructure/WorkerInvestigationRepository";
import type { InvestigationRecord } from "$lib/entities/investigation/model/investigationSchema";

interface Props {
	characters: CharacterRecord[];
}
let { characters }: Props = $props();

// Repositório e Serviço
const repository = new WorkerInvestigationRepository();
const researchService = new ResearchService(repository);

// Estados reativos do Svelte 5
let activeResearchProjects = $state<InvestigationRecord[]>([]);
let selectedCharacterId = $state("");
let hasPoliglotaSupremo = $state(false);
let spendGoldExtreme = $state(false);

// Formulário de Criação
let targetNameInput = $state("Monólito Rúnico de Ouro");
let selectedResearchType = $state<"lore" | "cryptography" | "great_enigma">(
	"lore",
);
let selectedTier = $state(1);
let selectedDc = $state(12);

// UI Alerts e Logs
let _successNotification = $state<string | null>(null);
let _errorNotification = $state<string | null>(null);
let researchLogs = $state<string[]>([]);

// Estado de Animação de Rolagem
let _isRolling = $state(false);
let _rolledD20 = $state<number | null>(null);
let rolledTotal = $state<number | null>(null);

// Alfabeto Rúnico para Criptografia Embaraçada
const RUNES_CHARACTERS = [
	"ᚠ",
	"ᚢ",
	"ᚦ",
	"ᚬ",
	"ᚱ",
	"ᚴ",
	"ᚼ",
	"ᚾ",
	"ᛁ",
	"ᛅ",
	"ᛋ",
	"ᛏ",
	"ᛒ",
	"ᛘ",
	"ᛚ",
	"ᛦ",
];

// Textos Decifrados Originais para Criptografia de Demonstração
const _CRYPTO_TEXTS: Record<string, string> = {
	lore: "O guardião do abismo tem fraqueza a dano espiritual. Suas escamas se rompem quando ele fita o olho do conjurador no momento da metamagia.",
	cryptography:
		"A chave rúnica sob as ruínas orientais abre o portal do Bastião Perdido às três badaladas da meia-noite sob a lua de éter.",
	great_enigma:
		"Os deuses antigos trancaram a fresta dos Ermos com seis chaves de ossos de Drakari. O segredo da união jaz na poeira da forja.",
};

let selectedResearcher = $derived(
	characters.find((c) => c.id === selectedCharacterId) || characters[0],
);

onMount(async () => {
	await reloadProjects();
	if (characters.length > 0) {
		selectedCharacterId = characters[0].id;
	}
});

function addLog(msg: string) {
	researchLogs = [msg, ...researchLogs].slice(0, 12);
}

function triggerSuccess(msg: string) {
	_successNotification = msg;
	setTimeout(() => {
		_successNotification = null;
	}, 3500);
}

function triggerError(msg: string) {
	_errorNotification = msg;
	setTimeout(() => {
		_errorNotification = null;
	}, 3500);
}

async function reloadProjects() {
	try {
		const res = await repository.listActive();
		if (res.success) {
			// Filtra apenas os projetos geridos pelo ResearchService
			activeResearchProjects = res.data.filter(
				(p) =>
					p.type === "lore" ||
					p.type === "cryptography" ||
					p.type === "great_enigma",
			);
		}
	} catch (e) {
		console.error("Erro ao recarregar pesquisas:", e);
	}
}

// Embaralha o texto dependendo do percentual traduzido
function _obfuscateText(originalText: string, percent: number): string {
	if (percent >= 100) return originalText;
	const words = originalText.split(" ");
	return words
		.map((word) => {
			// Semente pseudoaleatória baseada na palavra
			let hash = 0;
			for (let i = 0; i < word.length; i++) {
				hash = word.charCodeAt(i) + ((hash << 5) - hash);
			}
			const secureHash = Math.abs(hash);

			// Se o hash cair fora do percentual de tradução, o termo fica rúnico
			const isTranslated = secureHash % 100 < percent;
			if (isTranslated) {
				return word;
			}

			// Converte caracteres individuais para runas mantendo o tamanho aproximado
			return Array.from(word)
				.map((char, index) => {
					if (/[a-zA-Z]/.test(char)) {
						const runeIndex = (secureHash + index) % RUNES_CHARACTERS.length;
						return RUNES_CHARACTERS[runeIndex];
					}
					return char;
				})
				.join("");
		})
		.join(" ");
}

async function _handleCreateProject() {
	if (!targetNameInput.trim()) {
		triggerError("Dê um nome ou descrição ao alvo do projeto de pesquisa!");
		return;
	}

	// Valida se já existe projeto com o mesmo nome ativo
	const isDuplicated = activeResearchProjects.some(
		(p) => p.targetName === targetNameInput,
	);
	if (isDuplicated) {
		triggerError("Já existe uma pesquisa em andamento para este alvo!");
		return;
	}

	// Configuração de clocks por tipo de pesquisa
	let reqSuccesses = 3;
	let maxFailures = 2;
	if (selectedResearchType === "great_enigma") {
		reqSuccesses = 6;
		maxFailures = 3;
	}

	const res = await researchService.createProject({
		id: crypto.randomUUID(),
		targetId: `target-${selectedResearchType}-${crypto.randomUUID().slice(0, 4)}`,
		targetName: targetNameInput,
		type: selectedResearchType,
		tier: selectedTier,
		dc: selectedDc,
		successesRequired: reqSuccesses,
		failuresMax: maxFailures,
		timestamp: new Date().toISOString(),
	});

	if (res.success) {
		triggerSuccess(`Projeto de Pesquisa "${targetNameInput}" iniciado!`);
		addLog(
			`[Novo Projeto] Pesquisa de ${selectedResearchType.toUpperCase()} criada com sucesso. DC: ${selectedDc}`,
		);
		await reloadProjects();
	} else {
		triggerError(res.error.message);
	}
}

function secureRandomD20(): number {
	const arr = new Uint32Array(1);
	window.crypto.getRandomValues(arr);
	return (arr[0] % 20) + 1;
}

async function _handleRollResearch(project: InvestigationRecord) {
	if (!selectedResearcher) {
		triggerError("Selecione um Andarilho ativo para guiar a pesquisa!");
		return;
	}

	// Um Grande Enigma consome 10 PO fixos por teste como taxa de materiais arcanos
	if (project.type === "great_enigma" && selectedResearcher.gold < 10) {
		triggerError(
			`Ouro insuficiente para teste de Grande Enigma! (Requer 10 PO, possui ${selectedResearcher.gold} PO)`,
		);
		return;
	}

	// Investigação Extrema consome 25 PO adicionais
	if (
		spendGoldExtreme &&
		selectedResearcher.gold < (project.type === "great_enigma" ? 35 : 25)
	) {
		triggerError(
			"Ouro insuficiente para Investigação Arcana Extrema (25 PO adicionais)!",
		);
		return;
	}

	_isRolling = true;
	_rolledD20 = null;
	rolledTotal = null;

	// Bônus do Pesquisador: Nível + Mental + Maior Eixo (Interação ou Conflito)
	const modifier =
		selectedResearcher.level +
		selectedResearcher.mental +
		Math.max(selectedResearcher.interaction, selectedResearcher.conflict);

	let animCount = 0;
	const interval = setInterval(() => {
		_rolledD20 = secureRandomD20();
		animCount++;
		if (animCount > 6) {
			clearInterval(interval);
			executeFinalRoll();
		}
	}, 80);

	async function executeFinalRoll() {
		const d20 = secureRandomD20();
		_rolledD20 = d20;
		rolledTotal = d20 + modifier;
		_isRolling = false;

		const goldStateBefore = selectedResearcher.gold;

		const rollResult = await researchService.executeResearchTest({
			investigationId: project.id,
			rollValue: d20,
			modifier,
			hasPoliglotaSupremo,
			spendGoldExtreme,
			currentGold: goldStateBefore,
		});

		if (rollResult.success) {
			const data = rollResult.data;
			const isSuccess = data.success;
			const spent = data.goldSpent + (project.type === "great_enigma" ? 10 : 0);

			// Deduz ouro do personagem se necessário (persistência simulada no client)
			if (spent > 0) {
				selectedResearcher.gold = Math.max(0, selectedResearcher.gold - spent);
				// Salva o novo valor no repositório
				// biome-ignore lint/suspicious/noExplicitAny: repo typing fallback
				await (repository as any).sendRequest("SAVE_CHARACTER", {
					character: selectedResearcher,
				});
			}

			let logMsg = `[Pesquisa] ${selectedResearcher.name} rolou d20: ${d20} + Mod: ${modifier} = ${rolledTotal} vs DC ${project.dc}. `;
			if (data.isCritical) {
				logMsg += `CRÍTICO! Progresso duplicado. `;
				triggerSuccess("Sucesso Crítico de Pesquisa!");
			} else if (isSuccess) {
				logMsg += `SUCESSO! Progresso registrado. `;
				triggerSuccess("Sucesso de Pesquisa!");
			} else {
				logMsg += `FALHA! `;
				if (spendGoldExtreme)
					logMsg += `(Falha anulada via Investigação Arcana Extrema). `;
				triggerError("A pesquisa falhou ou ofereceu custo.");
			}

			if (spent > 0) {
				logMsg += `Gasto de ${spent} PO.`;
			}

			addLog(logMsg);
			addLog(
				`Progresso: ${data.record.successesAccumulated}/${data.record.successesRequired} sucessos, ${data.record.failuresAccumulated}/${data.record.failuresMax} falhas.`,
			);

			await reloadProjects();
		} else {
			triggerError(rollResult.error.message);
		}
	}
}
</script>

<div class="research-wrapper animate-fade">
	<!-- Alertas Premium -->
	{#if successNotification}
		<div class="alert-premium success-runic" transition:fade>
			<span>✨ {successNotification}</span>
		</div>
	{/if}
	{#if errorNotification}
		<div class="alert-premium error-runic" transition:fade>
			<span>ᛟ {errorNotification}</span>
		</div>
	{/if}

	<div class="grid-runic">
		<!-- Coluna Esquerda: Pesquisas e Clocks -->
		<div class="runic-left">
			<div class="panel-runic glass-runic">
				<h2 class="title-runic">⚒️ Códices e Manuscritos sob Análise</h2>
				<p class="subtitle-runic">Traduzindo inscrições perdidas e decifrando enigmas antigos dos Ermos.</p>

				{#if activeResearchProjects.length === 0}
					<div class="empty-runic">
						<p>Nenhum rolo de escrita ou monolito rúnico sob decifração.</p>
						<p class="hint">Adicione um projeto na coluna lateral para iniciar os testes.</p>
					</div>
				{:else}
					{#each activeResearchProjects as p (p.id)}
						<div class="card-project border-runic">
							<div class="card-project-header">
								<h3 class="text-ether font-bold tracking-wide">{p.targetName}</h3>
								<span class="badge-runic {p.type}">
									{#if p.type === 'lore'}
										📚 Lore Histórico
									{:else}
										🔐 Criptografia
									{/if}
								</span>
							</div>

							<!-- Display da Criptografia Rúnica Dinâmica -->
							<div class="crypto-box">
								<p class="text-xs text-ether/60 uppercase tracking-widest font-mono">Inscrições Decifradas ({p.translatedPercent}%):</p>
								<div class="crypto-text">
									{obfuscateText(CRYPTO_TEXTS[p.type] || "Misteriosas escritas esculpidas em pedra antiga.", p.translatedPercent)}
								</div>
								{#if p.status === 'completed_perfect' || p.status === 'completed_standard' || p.status === 'completed_poor'}
									<div class="reveal-box mt-2 border-t border-ether/20 pt-2 text-xs text-bronze">
										<strong>Segredo Revelado:</strong> {p.discoveredSecrets || "Nenhum segredo íntimo adicional desvelado."}
									</div>
								{/if}
							</div>

							<!-- Clocks de Sucesso e Falha -->
							<div class="progress-section mt-4">
								<div class="progress-row">
									<span class="text-xs text-bone/70">Segmentos de Sucesso:</span>
									<span class="text-xs font-bold text-ether">{p.successesAccumulated} / {p.successesRequired}</span>
								</div>
								<div class="runic-bar-bg">
									<div class="runic-bar-fill success-fill-runic" style="width: {(p.successesAccumulated / p.successesRequired) * 100}%"></div>
								</div>

								<div class="progress-row mt-2">
									<span class="text-xs text-bone/70">Falhas / Tolerância:</span>
									<span class="text-xs font-bold text-blood">{p.failuresAccumulated} / {p.failuresMax}</span>
								</div>
								<div class="runic-bar-bg">
									<div class="runic-bar-fill failure-fill-runic" style="width: {(p.failuresAccumulated / p.failuresMax) * 100}%"></div>
								</div>
							</div>

							<!-- Seção de Ação e Rolo de Dados -->
							{#if p.status === 'active'}
								<div class="roll-area border-t border-ether/10 mt-4 pt-3">
									<div class="grid grid-cols-2 gap-2">
										<div class="flex flex-col">
											<label class="text-[10px] text-ether uppercase font-bold" for="char-select">Pesquisador:</label>
											<select id="char-select" class="runic-select" bind:value={selectedCharacterId}>
												{#each characters as char}
													<option value={char.id}>
														{char.name} (Mod: +{char.level + char.mental + Math.max(char.interaction, char.conflict)})
													</option>
												{/each}
											</select>
										</div>
										<div class="flex flex-col justify-end">
											<div class="text-[10px] text-ether uppercase font-bold mb-1">Modificadores Especiais:</div>
											<div class="flex flex-col gap-1">
												<label class="flex items-center gap-1.5 cursor-pointer text-[10px] text-bone/80">
													<input type="checkbox" bind:checked={hasPoliglotaSupremo} />
													Poliglota Supremo (Auto)
												</label>
												<label class="flex items-center gap-1.5 cursor-pointer text-[10px] text-bone/80">
													<input type="checkbox" bind:checked={spendGoldExtreme} />
													Extrema (Gasta 25 PO)
												</label>
											</div>
										</div>
									</div>

									<button class="btn-runic w-full mt-3" onclick={() => handleRollResearch(p)} disabled={isRolling}>
										{#if isRolling}
											⚔️ Sintonizando Éter...
										{:else}
											🎲 Rolar Teste (DC {p.dc})
										{/if}
									</button>

									{#if rolledD20 !== null}
										<div class="runic-dice mt-3">
											<div class="d20-glass" class:rolling={isRolling}>
												<span>{rolledD20}</span>
											</div>
											<div class="runic-dice-meta">
												<span class="text-[10px] text-bone/50 block">Modificador +{rolledTotal !== null ? rolledTotal - rolledD20 : 0}</span>
												<span class="text-lg font-bold text-ether">{rolledTotal}</span>
											</div>
										</div>
									{/if}
								</div>
							{:else}
								<div class="completion-banner mt-3 text-center text-xs p-2 rounded border border-bronze/35 bg-bronze/5">
									{#if p.status === 'failed'}
										<span class="text-blood font-bold">⚠️ PROJETO COLAPSOU (LIMITE DE FALHAS EXCEDIDO)</span>
									{:else}
										<span class="text-bronze font-bold">✨ DECIFRAÇÃO CONCLUÍDA ({p.status.toUpperCase().replace("_", " ")})</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Coluna Direita: Criar Projetos e Logs -->
		<div class="runic-right">
			<!-- Iniciar Novas Pesquisas -->
			<div class="panel-runic glass-runic">
				<h2 class="title-runic">🏛️ Iniciar Pesquisa Rúnica</h2>
				<p class="subtitle-runic">Identifique relíquias, tábuas de argila ou grandes enigmas do deserto.</p>

				<div class="form-runic mt-4">
					<div class="field-runic">
						<label for="target-name">Nome do Objeto / Local:</label>
						<input type="text" id="target-name" class="runic-input" bind:value={targetNameInput} />
					</div>

					<div class="field-runic mt-3">
						<label for="research-type">Tipo de Estudo:</label>
						<select id="research-type" class="runic-select" bind:value={selectedResearchType}>
							<option value="lore">📚 Lore Histórico (DC 12 - 3 sucessos)</option>
							<option value="cryptography">🔐 Criptografia Rúnica (DC 15 - 3 sucessos)</option>
							<option value="great_enigma">🧩 O Grande Enigma (DC 20 - 6 sucessos)</option>
						</select>
					</div>

					<div class="grid grid-cols-2 gap-2 mt-3">
						<div class="field-runic">
							<label for="tier-select">Tier de Perigo:</label>
							<select id="tier-select" class="runic-select" bind:value={selectedTier}>
								<option value={1}>Tier 1 (Comum)</option>
								<option value={2}>Tier 2 (Raro)</option>
								<option value={3}>Tier 3 (Relíquia)</option>
								<option value={4}>Tier 4 (Divino)</option>
							</select>
						</div>
						<div class="field-runic">
							<label for="dc-select">DC do Encontro:</label>
							<select id="dc-select" class="runic-select" bind:value={selectedDc}>
								<option value={12}>Fácil (DC 12)</option>
								<option value={15}>Mundana (DC 15)</option>
								<option value={20}>Secreta (DC 20)</option>
								<option value={25}>Hermética (DC 25)</option>
								<option value={30}>Ancil (DC 30)</option>
							</select>
						</div>
					</div>

					<button class="btn-runic w-full mt-4" onclick={handleCreateProject}>
						Iniciar Estudo Rúnico
					</button>
				</div>
			</div>

			<!-- Histórico / Registro Científico -->
			<div class="panel-runic glass-runic mt-4">
				<h2 class="title-runic">📜 Registro de Decifração</h2>
				<div class="logs-runic mt-2">
					{#each researchLogs as logMsg}
						<div class="log-runic-entry">{logMsg}</div>
					{/each}
					{#if researchLogs.length === 0}
						<p class="empty-runic text-center text-xs">Nenhum evento registrado nesta expedição.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
