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

/**
 * ⚔️ SERVIÇO DE TALENTOS DE CLASSE (ClassTalentService)
 *
 * Gerencia a ativação e dedução de recursos (EE/PV) para habilidades táticas.
 * Retorna Result monádico para garantir tratamento robusto de erros sem throw.
 */
export class ClassTalentService {
	public constructor(
		private readonly repository: CharacterRepository,
		private readonly idProvider: CharacterIdProvider,
		private readonly clock: CharacterClock,
	) {}

	/**
	 * 🛡️ ATIVAR FÔLEGO EXTRA (Vanguarda)
	 * Consome 2 Pontos de Vigor (PV) e aplica o status 'extra_breath' por 3 turnos.
	 */
	public async activateExtraBreath(
		characterId: string,
		currentPv: number,
	): Promise<
		Result<
			{ effect: CharacterStatusEffectRecord; costPv: number },
			CharacterFailure
		>
	> {
		if (currentPv < 2) {
			return fail({
				code: "INVALID_CHARACTER_INPUT",
				message: "Pontos de Vigor (PV) insuficientes para ativar Fôlego Extra.",
			});
		}

		const charRes = await this.repository.findById(characterId);
		if (!charRes.success) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: charRes.error.message,
			});
		}

		if (charRes.data.classId !== "vanguard") {
			return fail({
				code: "INVALID_CHARACTER_INPUT",
				message:
					"Apenas personagens da classe Vanguarda podem ativar Fôlego Extra.",
			});
		}

		const existingResult =
			await this.repository.findStatusEffectsByCharacterId(characterId);
		if (!existingResult.success) {
			return fail({
				code: "FETCH_STATUS_EFFECTS_FAILED",
				message:
					"Não foi possível verificar os efeitos de status do personagem.",
			});
		}

		const alreadyActive = existingResult.data.some(
			(e) => e.type === "extra_breath",
		);
		if (alreadyActive) {
			return fail({
				code: "ALREADY_INFECTED",
				message: "O personagem já está sob o efeito de Fôlego Extra.",
			});
		}

		const timestamp = this.clock.now();
		const effectRecord: NewCharacterStatusEffectRecord = {
			id: this.idProvider.generate(),
			characterId,
			type: "extra_breath",
			severity: 1,
			severityMax: 1,
			isAggravated: false,
			durationTurns: 3,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const savedResult = await this.repository.saveStatusEffect(effectRecord);
		if (!savedResult.success) {
			return fail({
				code: "PERSIST_STATUS_EFFECT_FAILED",
				message: savedResult.error.message,
			});
		}

		return ok({ effect: savedResult.data, costPv: 2 });
	}

	/**
	 * ⏳ ATIVAR DOBRAR TEMPO (Tecelão)
	 * Consome 2 Energia Etérica (EE) e aplica o status 'double_time' por 3 turnos.
	 */
	public async activateDoubleTime(
		characterId: string,
		currentEe: number,
	): Promise<
		Result<
			{ effect: CharacterStatusEffectRecord; costEe: number },
			CharacterFailure
		>
	> {
		if (currentEe < 2) {
			return fail({
				code: "INVALID_CHARACTER_INPUT",
				message: "Energia Etérica (EE) insuficiente para ativar Dobrar Tempo.",
			});
		}

		const charRes = await this.repository.findById(characterId);
		if (!charRes.success) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: charRes.error.message,
			});
		}

		if (charRes.data.classId !== "weaver") {
			return fail({
				code: "INVALID_CHARACTER_INPUT",
				message:
					"Apenas personagens da classe Tecelão podem ativar Dobrar Tempo.",
			});
		}

		const existingResult =
			await this.repository.findStatusEffectsByCharacterId(characterId);
		if (!existingResult.success) {
			return fail({
				code: "FETCH_STATUS_EFFECTS_FAILED",
				message:
					"Não foi possível verificar os efeitos de status do personagem.",
			});
		}

		const alreadyActive = existingResult.data.some(
			(e) => e.type === "double_time",
		);
		if (alreadyActive) {
			return fail({
				code: "ALREADY_INFECTED",
				message: "O personagem já está sob o efeito de Dobrar Tempo.",
			});
		}

		const timestamp = this.clock.now();
		const effectRecord: NewCharacterStatusEffectRecord = {
			id: this.idProvider.generate(),
			characterId,
			type: "double_time",
			severity: 1,
			severityMax: 1,
			isAggravated: false,
			durationTurns: 3,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const savedResult = await this.repository.saveStatusEffect(effectRecord);
		if (!savedResult.success) {
			return fail({
				code: "PERSIST_STATUS_EFFECT_FAILED",
				message: savedResult.error.message,
			});
		}

		return ok({ effect: savedResult.data, costEe: 2 });
	}
}
