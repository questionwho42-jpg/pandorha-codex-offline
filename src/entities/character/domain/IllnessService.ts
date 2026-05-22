import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	CharacterStatusEffectRecord,
	NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type {
	CharacterClock,
	CharacterFailure,
	CharacterIdProvider,
} from "../model/characterTypes";
import type { CharacterRepository } from "./CharacterRepository";
import {
	EterFeverDecorator,
	type ICharacterStats,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "./StatusEffectDecorator";

/**
 * 🧅 SERVIÇO DE ENFERMIDADES & TOXINAS (IllnessService)
 *
 * Este serviço gerencia o ciclo de vida das patologias de Pandorha. Ele é o responsável por:
 * 1. Adicionar enfermidades e venenos ao banco de dados local-first (Contágio).
 * 2. Remover enfermidades após cura espontânea ou tratamento alquímico (Cura).
 * 3. Envolver reativamente a ficha base de atributos na "cebola" de Decoradores (Decorator cebola).
 * 4. Processar testes mecânicos de Vigor/Resistência contra a DC (Dificuldade) das doenças.
 */
export class IllnessService {
	public constructor(
		private readonly repository: CharacterRepository,
		private readonly idProvider: CharacterIdProvider,
		private readonly clock: CharacterClock,
	) {}

	/**
	 * 🧅 APLICAÇÃO DA CEBOLA DE DECORADORES
	 * Pega a ficha base saudável de estatísticas (ICharacterStats) e a envolve sequencialmente
	 * com cada decorador correspondente às enfermidades e venenos ativos do personagem.
	 */
	public applyStatusDecorators(
		baseStats: ICharacterStats,
		activeEffects: readonly CharacterStatusEffectRecord[],
	): ICharacterStats {
		let decoratedStats = baseStats;

		for (const effect of activeEffects) {
			switch (effect.type) {
				case "eter_fever":
					decoratedStats = new EterFeverDecorator(decoratedStats);
					break;
				case "wound_infection":
					decoratedStats = new WoundInfectionDecorator(decoratedStats);
					break;
				case "viper_poison":
					decoratedStats = new ViperPoisonDecorator(decoratedStats);
					break;
				default:
					// Efeito desconhecido ou não-decorável ignorado silenciosamente
					break;
			}
		}

		return decoratedStats;
	}

	/**
	 * 🦠 INFECTAR / CONTAMINAR PERSONAGEM
	 * Adiciona um novo registro de enfermidade ou toxina ativa ao banco SQLite local.
	 */
	public async infectCharacter(
		characterId: string,
		diseaseType: "eter_fever" | "wound_infection" | "viper_poison",
	): Promise<Result<CharacterStatusEffectRecord, CharacterFailure>> {
		// Validar se o personagem já está sofrendo desse efeito para evitar duplicidade
		const existingResult =
			await this.repository.findStatusEffectsByCharacterId(characterId);
		if (!existingResult.success) {
			return fail({
				code: "FETCH_STATUS_EFFECTS_FAILED",
				message:
					"Não foi possível verificar os efeitos de status do personagem.",
			});
		}

		const alreadyInfected = existingResult.data.some(
			(e) => e.type === diseaseType,
		);
		if (alreadyInfected) {
			return fail({
				code: "ALREADY_INFECTED",
				message: `O personagem já está sob o efeito de ${diseaseType}.`,
			});
		}

		const timestamp = this.clock.now();
		const effectRecord: NewCharacterStatusEffectRecord = {
			id: this.idProvider.generate(),
			characterId,
			type: diseaseType,
			severity: 2,
			severityMax: 4,
			isAggravated: false,
			createdAt: timestamp,
		};

		const savedResult = await this.repository.saveStatusEffect(effectRecord);
		if (!savedResult.success) {
			return fail({
				code: "PERSIST_STATUS_EFFECT_FAILED",
				message: savedResult.error.message,
			});
		}

		return ok(savedResult.data);
	}

	/**
	 * 🧪 CURAR ENFERMIDADE
	 * Remove o registro do efeito de status correspondente do banco SQLite local.
	 */
	public async cureCharacter(
		characterId: string,
		diseaseType: "eter_fever" | "wound_infection" | "viper_poison",
	): Promise<Result<void, CharacterFailure>> {
		const existingResult =
			await this.repository.findStatusEffectsByCharacterId(characterId);
		if (!existingResult.success) {
			return fail({
				code: "FETCH_STATUS_EFFECTS_FAILED",
				message: "Não foi possível buscar os efeitos para remoção.",
			});
		}

		const targetEffect = existingResult.data.find(
			(e) => e.type === diseaseType,
		);
		if (!targetEffect) {
			return fail({
				code: "EFFECT_NOT_FOUND",
				message: "O personagem não possui este efeito de status ativo.",
			});
		}

		const deletedResult = await this.repository.deleteStatusEffect(
			targetEffect.id,
		);
		if (!deletedResult.success) {
			return fail({
				code: "DELETE_STATUS_EFFECT_FAILED",
				message: deletedResult.error.message,
			});
		}

		return ok(undefined);
	}

	/**
	 * 🎲 TESTE DE RESISTÊNCIA DE VIGOR (D20 + Nível + Físico + Resistência)
	 * Realiza e valida a mecânica matemática de rolagem contra a DC (Dificuldade) da Doença.
	 */
	public rollResistanceTest(
		characterStats: ICharacterStats,
		dc: number,
		d20Roll: number,
	): {
		roll: number;
		modifier: number;
		total: number;
		success: boolean;
	} {
		// Regra de Pandorha: Modificador de Resistência = Nível + Físico + Resistência
		const modifier =
			characterStats.level +
			characterStats.physical +
			characterStats.resistance;
		const total = d20Roll + modifier;
		const success = total >= dc;

		return {
			roll: d20Roll,
			modifier,
			total,
			success,
		};
	}
}
