import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRecord } from "../../character/model/characterSchema";
import type { CompanionRecord } from "../model/companionSchema";
import type {
	CompanionRepository,
	CompanionRepositoryFailure,
} from "./CompanionRepository";

// Stub/Interface mínima de Repositório de Personagem para fins de domínio
interface CharacterRepositoryStub {
	findById(
		id: string,
	): Promise<Result<CharacterRecord, { code: string; message: string }>>;
	save(
		record: CharacterRecord,
	): Promise<Result<CharacterRecord, { code: string; message: string }>>;
}

/**
 * ============================================================================
 * 🧅 EXPLICAÇÃO DIDÁTICA: POR QUE A HERANÇA FALHARIA AQUI? (EXPLOSÃO DE CLASSES)
 * ============================================================================
 * Se utilizássemos herança clássica para adicionar comportamentos flutuantes em
 * companheiros (por exemplo: "Com Sentidos Partilhados", "Sob efeito de Fúria",
 * "Invisível", "Canalizador Rúnico"), seríamos forçados a criar uma classe para
 * cada combinação possível:
 *   - Familiar
 *   - FamiliarComPartilhaDeSentidos
 *   - FamiliarComPartilhaEInvisivel
 *   - FamiliarComPartilhaEInvisivelEFuria...
 * Isto gera uma "explosão combinatória de classes" insustentável. Com o padrão
 * DECORATOR, nós preferimos a COMPOSIÇÃO: criamos decoradores modulares pequenos
 * (cebolas) que envolvem o objeto base e se acumulam dinamicamente em tempo de
 * execução para adicionar os bônus e penalidades reativas necessárias.
 */

/**
 * 🧅 INTERFACE / COMPONENTE ABSTRATO
 * Contrato comum para qualquer representação numérica ou mecânica do Companheiro.
 */
export interface ICompanionStats {
	readonly id: string;
	readonly characterId: string;
	readonly name: string;
	readonly type: string;
	readonly subModel: string;
	readonly tier: number;
	readonly hpMax: number;
	readonly hpCurrent: number;
	readonly isShareSensory: boolean;
	readonly isDissipated: boolean;
	readonly selectedTraits: readonly string[];
}

/**
 * 🧅 COMPONENTE CONCRETO
 * Implementação base e limpa das estatísticas do companheiro persistidas.
 */
export class BaseCompanionStats implements ICompanionStats {
	public constructor(
		private readonly record: CompanionRecord,
		private readonly masterMental: number,
	) {}

	public get id(): string {
		return this.record.id;
	}

	public get characterId(): string {
		return this.record.characterId;
	}

	public get name(): string {
		return this.record.name;
	}

	public get type(): string {
		return this.record.type;
	}

	public get subModel(): string {
		return this.record.subModel;
	}

	public get tier(): number {
		return this.record.tier;
	}

	// Regra de RPG: PV do familiar = (Matriz Mental × 5) × Tier do companheiro
	public get hpMax(): number {
		return this.masterMental * 5 * this.tier;
	}

	public get hpCurrent(): number {
		return this.record.hpCurrent;
	}

	public get isShareSensory(): boolean {
		return this.record.isShareSensory;
	}

	public get isDissipated(): boolean {
		return this.record.isDissipated;
	}

	public get selectedTraits(): readonly string[] {
		try {
			return JSON.parse(this.record.selectedTraitsJson);
		} catch {
			return [];
		}
	}
}

/**
 * 🧅 DECORADOR BASE
 * Repassa de forma recursiva todas as chamadas para o objeto interno (wrapped).
 */
export abstract class CompanionStatsDecorator implements ICompanionStats {
	public constructor(protected readonly wrapped: ICompanionStats) {}

	public get id(): string {
		return this.wrapped.id;
	}

	public get characterId(): string {
		return this.wrapped.characterId;
	}

	public get name(): string {
		return this.wrapped.name;
	}

	public get type(): string {
		return this.wrapped.type;
	}

	public get subModel(): string {
		return this.wrapped.subModel;
	}

	public get tier(): number {
		return this.wrapped.tier;
	}

	public get hpMax(): number {
		return this.wrapped.hpMax;
	}

	public get hpCurrent(): number {
		return this.wrapped.hpCurrent;
	}

	public get isShareSensory(): boolean {
		return this.wrapped.isShareSensory;
	}

	public get isDissipated(): boolean {
		return this.wrapped.isDissipated;
	}

	public get selectedTraits(): readonly string[] {
		return this.wrapped.selectedTraits;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Partilha de Sentidos (SensorySharingStatsDecorator)
 * Adiciona a flag de partilha ativa de sentidos em transe, reduzindo a defesa em troca.
 */
export class SensorySharingStatsDecorator extends CompanionStatsDecorator {
	public override get isShareSensory(): boolean {
		return true;
	}
}

/**
 * ============================================================================
 * 🧅 EXPLICAÇÃO DIDÁTICA: O EFEITO CEBOLA E A CHAMADA RECURSIVA
 * ============================================================================
 * Quando executamos um método em um objeto embrulhado com decoradores, a chamada
 * atravessa as camadas de fora para dentro (como descascar uma cebola). Cada camada
 * (Decorador Concreto) pode interceptar a chamada, adicionar um comportamento,
 * e passar a chamada adiante até chegar no Componente Concreto central. Isso permite
 * recalcular atributos em tempo real de forma totalmente flexível e reativa!
 */

export class CompanionService {
	public constructor(
		private readonly repository: CompanionRepository,
		private readonly characterRepository: CharacterRepositoryStub,
	) {}

	public async summonCompanion(
		characterId: string,
		name: string,
		type: "aggressor" | "protector" | "scout" | "familiar",
		subModel: string,
		tier: number,
		timestamp: string,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		// Carrega mestre do banco para extrair Matriz Mental
		const masterResult = await this.characterRepository.findById(characterId);
		if (!masterResult.success) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: `Personagem mestre com ID '${characterId}' não encontrado.`,
			});
		}

		const master = masterResult.data;
		// HP Max = (Mental * 5) * Tier
		const hpMax = master.mental * 5 * tier;

		const newCompanion: CompanionRecord = {
			id: crypto.randomUUID(),
			characterId,
			name,
			type,
			subModel,
			tier,
			hpCurrent: hpMax,
			hpMax,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		return this.repository.saveCompanion(newCompanion);
	}

	public async shareSensory(
		companionId: string,
		isShareSensory: boolean,
		timestamp: string,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		const compResult = await this.repository.getCompanion(companionId);
		if (!compResult.success) {
			return fail(compResult.error);
		}

		if (!compResult.data) {
			return fail({
				code: "COMPANION_NOT_FOUND",
				message: `Companheiro com ID '${companionId}' não encontrado.`,
			});
		}

		const updatedCompanion: CompanionRecord = {
			...compResult.data,
			isShareSensory,
			updatedAt: timestamp,
		};

		return this.repository.saveCompanion(updatedCompanion);
	}

	public async applyDamageToCompanion(
		companionId: string,
		damage: number,
		timestamp: string,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		const compResult = await this.repository.getCompanion(companionId);
		if (!compResult.success) {
			return fail(compResult.error);
		}

		if (!compResult.data) {
			return fail({
				code: "COMPANION_NOT_FOUND",
				message: `Companheiro com ID '${companionId}' não encontrado.`,
			});
		}

		const companion = compResult.data;
		const newHp = Math.max(0, companion.hpCurrent - damage);
		const isDissipated = newHp === 0;

		// Regra de RPG: Dano mental partilhado se estiver em transe (50%)
		if (companion.isShareSensory && damage > 0) {
			const mentalDamage = Math.floor(damage / 2);
			const masterResult = await this.characterRepository.findById(
				companion.characterId,
			);
			if (masterResult.success && masterResult.data) {
				const master = masterResult.data;
				master.mental = Math.max(0, master.mental - mentalDamage);
				await this.characterRepository.save(master);
			}
		}

		const updatedCompanion: CompanionRecord = {
			...companion,
			hpCurrent: newHp,
			isDissipated,
			updatedAt: timestamp,
		};

		return this.repository.saveCompanion(updatedCompanion);
	}

	public async stabilizeMaster(
		characterId: string,
		timestamp: string,
	): Promise<Result<boolean, CompanionRepositoryFailure>> {
		const companionsResult =
			await this.repository.findCompanionsByCharacter(characterId);
		if (!companionsResult.success) {
			return fail(companionsResult.error);
		}

		const activeCompanions = companionsResult.data.filter(
			(c) => !c.isDissipated,
		);
		if (activeCompanions.length === 0) {
			return ok(false);
		}

		// Se sacrifica dissipando a criatura
		for (const comp of activeCompanions) {
			const dissipated: CompanionRecord = {
				...comp,
				hpCurrent: 0,
				isDissipated: true,
				updatedAt: timestamp,
			};
			await this.repository.saveCompanion(dissipated);
		}

		return ok(true);
	}

	public async updateSelectedTraits(
		companionId: string,
		traits: string[],
		timestamp: string,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		const compResult = await this.repository.getCompanion(companionId);
		if (!compResult.success) {
			return fail(compResult.error);
		}

		if (!compResult.data) {
			return fail({
				code: "COMPANION_NOT_FOUND",
				message: `Companheiro com ID '${companionId}' não encontrado.`,
			});
		}

		const companion = compResult.data;

		// Limite de traços/truques: Tier + 1
		const limit = companion.tier + 1;
		if (traits.length > limit) {
			return fail({
				code: "EXCEEDS_TIER_LIMIT",
				message: `Quantidade de traços excede o limite do Tier ${companion.tier} (máx: ${limit}).`,
			});
		}

		const updatedCompanion: CompanionRecord = {
			...companion,
			selectedTraitsJson: JSON.stringify(traits),
			updatedAt: timestamp,
		};

		return this.repository.saveCompanion(updatedCompanion);
	}
}
