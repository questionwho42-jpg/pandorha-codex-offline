import { describe, expect, it } from "vitest";
import { InMemoryDialogueRepository } from "$lib/entities/dialogue/infrastructure/InMemoryDialogueRepository";
import type {
	DialogueStateData,
	NewDialogueStateData,
} from "$lib/entities/dialogue/model/dialogueSchema";
import { fail, type Result } from "$lib/shared/lib/result";
import {
	type NegotiationFailure,
	type NegotiationRoundInput,
	type NegotiationRoundResult,
	NegotiationService,
} from "../NegotiationService";
import { SocialCombatEngine } from "../SocialCombatEngine";

// Subclasse fake do repositório para injetar falhas sob demanda
class FailingDialogueRepository extends InMemoryDialogueRepository {
	public shouldFailFind = false;
	public shouldFailSave = false;

	public override async findByCharacterAndNpc(
		characterId: string,
		npcId: string,
	): Promise<
		Result<DialogueStateData | null, { code: string; message: string }>
	> {
		if (this.shouldFailFind) {
			return fail({ code: "FIND_ERROR", message: "Erro de busca simulado" });
		}
		return super.findByCharacterAndNpc(characterId, npcId);
	}

	public override async save(
		state: NewDialogueStateData,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		if (this.shouldFailSave) {
			return fail({
				code: "SAVE_ERROR",
				message: "Erro de salvamento simulado",
			});
		}
		return super.save(state);
	}
}

// Subclasse fake do NegotiationService para injetar falhas
class FailingNegotiationService extends NegotiationService {
	public shouldFail = false;

	public override resolveRound(
		input: NegotiationRoundInput,
	): Result<NegotiationRoundResult, NegotiationFailure> {
		if (this.shouldFail) {
			return fail({
				code: "NEGOTIATION_ERROR",
				message: "Erro de negociação simulado",
			});
		}
		return super.resolveRound(input);
	}
}

describe("SocialCombatEngine", () => {
	const dummyDialogueState = (): DialogueStateData => ({
		id: "dialogue-state-1",
		characterId: "character-1",
		npcId: "npc-merchant",
		currentConversationNodeId: "root",
		dialogueTreeId: "tree-merchant-bargain",
		historyJson: JSON.stringify(["root"]),
		unlockedCluesJson: JSON.stringify([]),
		updatedAt: new Date().toISOString(),
		patienceMax: 0,
		patienceCurrent: 0,
		persuasionMax: 0,
		persuasionCurrent: 0,
		attitude: "neutral",
		fatigueCountersJson: "{}",
	});

	it("getInitialNpcStats calcula corretamente paciencia com base na formula e perfil", () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const merchantStats = engine.getInitialNpcStats("npc-merchant");
		// Merchant: mentalStat (10) + resistanceStat (10) + tier (2) + modifier (neutral = 0) = 22
		expect(merchantStats.patienceMax).toBe(22);
		expect(merchantStats.persuasionMax).toBe(6);
		expect(merchantStats.attitude).toBe("neutral");

		const alchemistStats = engine.getInitialNpcStats("npc-alchemist");
		// Alchemist: mentalStat (12) + resistanceStat (12) + tier (3) + modifier (skeptical = -2) = 25
		expect(alchemistStats.patienceMax).toBe(25);
		expect(alchemistStats.persuasionMax).toBe(8);
		expect(alchemistStats.attitude).toBe("skeptical");
	});

	it("getInitialNpcStats retorna DEFAULT_NPC_PROFILE para NPC desconhecido", () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);
		const stats = engine.getInitialNpcStats("npc-desconhecido-aleatorio");
		expect(stats.label).toBe("npc-desconhecido-aleatorio");
		expect(stats.patienceMax).toBe(22); // Calculado: base 10 + mental 10 + resistance 10 + tier 2 = 22
		expect(stats.persuasionMax).toBe(6);
		expect(stats.attitude).toBe("neutral");
	});

	it("construtor aceita e usa instancia existente de NegotiationService", () => {
		const repository = new InMemoryDialogueRepository();
		const customNegotiation = new NegotiationService();
		const engine = new SocialCombatEngine(repository, customNegotiation);
		const stats = engine.getInitialNpcStats("npc-merchant");
		expect(stats.patienceMax).toBe(22);
	});

	it("resolveSocialRound inicializa e salva o estado se for a primeira interacao", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15, // Margin = 0 -> Standard Success (advances 1 segment)
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(1);
			expect(result.data.target.patience.currentValue).toBe(22); // Sem dano
		}

		// Verifica que o estado foi salvo no repositorio de fato
		const saved = await repository.findByCharacterAndNpc(
			"character-1",
			"npc-merchant",
		);
		expect(saved.success).toBe(true);
		if (saved.success && saved.data) {
			expect(saved.data.persuasionCurrent).toBe(1);
			expect(saved.data.patienceCurrent).toBe(22);
			expect(saved.data.patienceMax).toBe(22);
			expect(saved.data.attitude).toBe("neutral");
		}
	});

	it("resolveSocialRound aplica bonus de suborno (barganha) no calculo da rolagem final", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		// Roll = 10, DC = 15, sem barganha -> Margin = -5 (reduz paciência em 5)
		// Com offerGold = 500 (+5) e offerFavors = 1 (+2) -> Roll efetivo = 17 -> Margin = 2 (Sucesso, avança 1 segmento)
		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 10,
			dc: 15,
			maneuver: "none",
			offerGold: 500,
			offerFavors: 1,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(1);
			expect(result.data.target.patience.currentValue).toBe(20); // Sucesso convence o NPC reduzindo sua paciência de debate pela margem de 2
		}
	});

	it("resolveSocialRound aplica fadiga social e registra o contador acumulado de fadiga", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		// 1ª tentativa no eixo "social"
		const firstRound = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(firstRound.success).toBe(true);
		const firstEvents = firstRound.success ? firstRound.data.events : [];

		// 2ª tentativa no eixo "social" - Deve registrar fadiga acumulada em fatigueCounters
		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15, // Pelo fatigueCounters = {"social": 1}, a margem recebe -2. Margin final = -2 -> Falha!
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
			events: firstEvents,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.patience.currentValue).toBe(20); // 22 - 2 (patience damage por falha)
			expect(result.data.target.persuasion.completedSegments).toBe(1); // Não aumentou
			expect(result.data.target.fatigueCounters.social).toBe(2); // Registrou +1 tentativa
		}
	});

	it("resolveSocialRound propaga erro quando findByCharacterAndNpc falha", async () => {
		const repository = new FailingDialogueRepository();
		repository.shouldFailFind = true;
		const engine = new SocialCombatEngine(repository);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("FIND_ERROR");
		}
	});

	it("resolveSocialRound retorna erro se o salvamento do novo estado inicial falhar", async () => {
		const repository = new FailingDialogueRepository();
		repository.shouldFailSave = true;
		const engine = new SocialCombatEngine(repository);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("SAVE_ERROR");
		}
	});

	it("resolveSocialRound migra estado com patienceMax === 0 e salva com sucesso", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const legacyState = dummyDialogueState();
		legacyState.patienceMax = 0;
		await repository.save(legacyState);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(true);

		const saved = await repository.findByCharacterAndNpc(
			"character-1",
			"npc-merchant",
		);
		expect(saved.success).toBe(true);
		if (saved.success && saved.data) {
			expect(saved.data.patienceMax).toBe(22);
			expect(saved.data.patienceCurrent).toBe(22);
		}
	});

	it("resolveSocialRound retorna erro se a gravacao da migracao falhar", async () => {
		const repository = new FailingDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const legacyState = dummyDialogueState();
		legacyState.patienceMax = 0;
		await repository.save(legacyState);

		repository.shouldFailSave = true;

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("SAVE_ERROR");
		}
	});

	it("resolveSocialRound tolera fatigueCountersJson malformado iniciando contador vazio", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const legacyState = dummyDialogueState();
		legacyState.patienceMax = 22;
		legacyState.patienceCurrent = 22;
		legacyState.fatigueCountersJson = "invalid-json-string";
		await repository.save(legacyState);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(true);
	});

	it("resolveSocialRound retorna erro se o NegotiationService falhar", async () => {
		const repository = new InMemoryDialogueRepository();
		const failingService = new FailingNegotiationService();
		failingService.shouldFail = true;
		const engine = new SocialCombatEngine(repository, failingService);

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("NEGOTIATION_ROUND_FAILED");
		}
	});

	it("resolveSocialRound retorna DATABASE_SAVE_FAILED se falhar ao persistir o estado final do round", async () => {
		const repository = new FailingDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const state = dummyDialogueState();
		state.patienceMax = 22;
		state.patienceCurrent = 22;
		await repository.save(state);

		repository.shouldFailSave = true;

		const result = await engine.resolveSocialRound({
			characterId: "character-1",
			npcId: "npc-merchant",
			treeId: "tree-merchant-bargain",
			oratorId: "character-1",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			offerGold: 0,
			offerFavors: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("DATABASE_SAVE_FAILED");
		}
	});

	it("resetSocialStats redefine paciencia, persuasao, atitude e fadiga aos valores de fabrica", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		// Salva um estado degradado previamente
		const state = dummyDialogueState();
		state.patienceCurrent = 5;
		state.patienceMax = 22;
		state.persuasionCurrent = 4;
		state.persuasionMax = 6;
		state.attitude = "friendly";
		state.fatigueCountersJson = JSON.stringify({ social: 3 });
		await repository.save(state);

		const resetResult = await engine.resetSocialStats(
			"character-1",
			"npc-merchant",
			"tree-merchant-bargain",
		);
		expect(resetResult.success).toBe(true);
		if (resetResult.success) {
			expect(resetResult.data.patienceCurrent).toBe(22);
			expect(resetResult.data.persuasionCurrent).toBe(0);
			expect(resetResult.data.attitude).toBe("neutral");
			expect(resetResult.data.fatigueCountersJson).toBe("{}");
		}
	});

	it("resetSocialStats retorna erro se findByCharacterAndNpc falhar", async () => {
		const repository = new FailingDialogueRepository();
		repository.shouldFailFind = true;
		const engine = new SocialCombatEngine(repository);

		const result = await engine.resetSocialStats(
			"character-1",
			"npc-merchant",
			"tree-merchant-bargain",
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("FIND_ERROR");
		}
	});

	it("resetSocialStats cria e salva um novo estado se nao houver nenhum no banco", async () => {
		const repository = new InMemoryDialogueRepository();
		const engine = new SocialCombatEngine(repository);

		const result = await engine.resetSocialStats(
			"character-1",
			"npc-merchant",
			"tree-merchant-bargain",
		);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.patienceCurrent).toBe(22);
			expect(result.data.persuasionCurrent).toBe(0);
			expect(result.data.attitude).toBe("neutral");
		}
	});
});
