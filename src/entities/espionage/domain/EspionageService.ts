import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../../character/domain/CharacterRepository";
import type { CompanionRepository } from "../../companions/domain/CompanionRepository";
import type { FactionRepository } from "../../social/domain/FactionRepository";
import type { WorldStateRepository } from "../../world-state";
import type {
	EspionageCellRecord,
	NewEspionageCellRecord,
	SpecializedAxis,
} from "../model/espionageSchema";
import type { EspionageRepository } from "./EspionageRepository";

export interface EspionageServiceFailure {
	readonly code:
		| "ESPIONAGE_SERVICE_FAILED"
		| "EXCEEDS_FAME_CELL_LIMIT"
		| "COMPANION_NOT_FOUND"
		| "COMPANION_DISSIPATED"
		| "TENENTE_ALREADY_ASSIGNED"
		| "FAVOR_POINTS_INSUFFICIENT"
		| "GOLD_INSUFFICIENT"
		| "CELL_NOT_FOUND"
		| "CELL_IN_LOCKDOWN"
		| "LEDGER_NOT_FOUND"
		| "CHARACTER_NOT_FOUND"
		| "GOLD_INSUFFICIENT_FOR_BRIBERY"
		| "ESPIONAGE_REPOSITORY_FAILED";
	readonly message: string;
	readonly details?: unknown;
}

export interface OperationResult {
	readonly success: boolean;
	readonly status:
		| "critical_success"
		| "success"
		| "golden_rule_success"
		| "failure"
		| "critical_failure";
	readonly totalRoll: number;
	readonly effectiveDc: number;
	readonly goldSpent: number;
	readonly infamyGained: number;
	readonly heatGained: number;
	readonly cellDestroyed: boolean;
	readonly cellLockedDown: boolean;
	readonly message: string;
	readonly triumphBenefit?: string;
}

export class EspionageService {
	public constructor(
		private readonly espionageRepository: EspionageRepository,
		private readonly factionRepository: FactionRepository,
		private readonly companionRepository: CompanionRepository,
		private readonly characterRepository: CharacterRepository,
		private readonly worldStateRepository?: WorldStateRepository,
	) {}

	public async establishCell(input: {
		campaignId: string;
		characterId: string;
		factionId: string;
		regionId: string;
		tenenteCompanionId: string;
		specializedAxis: SpecializedAxis;
		tier: number;
		availableGold: number;
		timestamp: string;
	}): Promise<
		Result<
			{ cell: EspionageCellRecord; goldSpent: number },
			EspionageServiceFailure
		>
	> {
		// 1. Validar se o personagem existe
		const charRes = await this.characterRepository.findById(input.characterId);
		if (!charRes.success) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: `Personagem com ID '${input.characterId}' não encontrado.`,
			});
		}

		// 2. Validar se o ledger social da campanha existe
		const ledgerRes = await this.factionRepository.getLedger(input.campaignId);
		if (!ledgerRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao ler o ledger de reputação.",
				details: ledgerRes.error,
			});
		}
		if (!ledgerRes.data) {
			return fail({
				code: "LEDGER_NOT_FOUND",
				message: `Ledger social de campanha '${input.campaignId}' não encontrado.`,
			});
		}
		const ledger = ledgerRes.data;

		// 3. Limite de células ativas com base no Fama Level (0 a 4)
		const listRes = await this.espionageRepository.listByCampaign(
			input.campaignId,
		);
		if (!listRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao listar células de espionagem existentes.",
				details: listRes.error,
			});
		}
		const activeCells = listRes.data;
		if (activeCells.length >= ledger.fameLevel) {
			return fail({
				code: "EXCEEDS_FAME_CELL_LIMIT",
				message: `Nível de Fama insuficiente (${ledger.fameLevel}) para manter mais células ativas (Máx: ${ledger.fameLevel}).`,
			});
		}

		// 4. Validar tenente (companion)
		const compRes = await this.companionRepository.getCompanion(
			input.tenenteCompanionId,
		);
		if (!compRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao carregar o companheiro/tenente.",
				details: compRes.error,
			});
		}
		const companion = compRes.data;
		if (!companion || companion.characterId !== input.characterId) {
			return fail({
				code: "COMPANION_NOT_FOUND",
				message: `Tenente companheiro com ID '${input.tenenteCompanionId}' não encontrado para o mestre.`,
			});
		}
		if (companion.isDissipated) {
			return fail({
				code: "COMPANION_DISSIPATED",
				message: "O tenente selecionado está dissipado e indisponível.",
			});
		}

		// 5. Validar se o tenente já está associado a outra célula de espionagem ativa
		const isAssigned = activeCells.some(
			(cell) => cell.tenenteCompanionId === input.tenenteCompanionId,
		);
		if (isAssigned) {
			return fail({
				code: "TENENTE_ALREADY_ASSIGNED",
				message:
					"Este tenente já está liderando outra célula de espionagem ativa.",
			});
		}

		// 6. Validar pontos de favor da campanha (exige 3)
		if (ledger.favorPoints < 3) {
			return fail({
				code: "FAVOR_POINTS_INSUFFICIENT",
				message: `Pontos de favor insuficientes com facções locais. Necessário: 3, Disponível: ${ledger.favorPoints}.`,
			});
		}

		// 7. Validar ouro (100 PO * Tier)
		const goldCost = 100 * input.tier;
		if (input.availableGold < goldCost) {
			return fail({
				code: "GOLD_INSUFFICIENT",
				message: `Ouro insuficiente para fundar a célula. Necessário: ${goldCost} PO, Disponível: ${input.availableGold} PO.`,
			});
		}

		// 8. Deduzir recursos e salvar ledger
		ledger.favorPoints -= 3;
		ledger.updatedAt = input.timestamp;
		const saveLedgerRes = await this.factionRepository.saveLedger(ledger);
		if (!saveLedgerRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao deduzir pontos de favor do ledger.",
				details: saveLedgerRes.error,
			});
		}

		// 9. Persistir célula
		const newCell: NewEspionageCellRecord = {
			id: crypto.randomUUID(),
			campaignId: input.campaignId,
			factionId: input.factionId,
			regionId: input.regionId,
			tenenteCompanionId: input.tenenteCompanionId,
			specializedAxis: input.specializedAxis,
			tier: input.tier,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: input.timestamp,
			updatedAt: input.timestamp,
		};

		const saveCellRes = await this.espionageRepository.save(newCell);
		if (!saveCellRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao salvar nova célula de espionagem no banco.",
				details: saveCellRes.error,
			});
		}

		return ok({
			cell: saveCellRes.data,
			goldSpent: goldCost,
		});
	}

	public async runAutonomousOperation(input: {
		cellId: string;
		targetDc: number;
		roll: number;
		timestamp: string;
		goldenRuleResolution: "infamy" | "heat";
		axisModifier?: number;
		equipmentBonus?: number;
		usePreventionBribery?: boolean;
		availableGold?: number;
	}): Promise<Result<OperationResult, EspionageServiceFailure>> {
		// 1. Buscar célula
		const cellRes = await this.espionageRepository.findById(input.cellId);
		if (!cellRes.success) {
			return fail({
				code: "CELL_NOT_FOUND",
				message: `Célula com ID '${input.cellId}' não encontrada.`,
			});
		}
		const cell = cellRes.data;

		if (cell.isLockdown) {
			return fail({
				code: "CELL_IN_LOCKDOWN",
				message: `Célula de espionagem está inativa sob Lockdown (Falta ${cell.lockdownWeeksRemaining} semanas).`,
			});
		}

		// 2. Buscar tenente para obter nível/tier
		const compRes = await this.companionRepository.getCompanion(
			cell.tenenteCompanionId,
		);
		if (!compRes.success || !compRes.data) {
			return fail({
				code: "COMPANION_NOT_FOUND",
				message: "Tenente associado à célula não pôde ser carregado.",
			});
		}
		const lieutenant = compRes.data;

		// 3. Calcular dificuldade (Vigilância Heat afeta DC)
		let heatDcIncrease = 0;
		if (cell.vigilanceHeat === 1) heatDcIncrease = 2;
		else if (cell.vigilanceHeat === 2) heatDcIncrease = 4;
		else if (cell.vigilanceHeat === 3) heatDcIncrease = 5;

		const effectiveDc = input.targetDc + heatDcIncrease;

		// 4. Validar suborno preventivo
		let goldSpent = 0;
		if (input.usePreventionBribery) {
			const briberyCost = 50 * cell.tier;
			if ((input.availableGold ?? 0) < briberyCost) {
				return fail({
					code: "GOLD_INSUFFICIENT_FOR_BRIBERY",
					message: `Ouro insuficiente para pagar suborno preventivo. Necessário: ${briberyCost} PO, Disponível: ${input.availableGold} PO.`,
				});
			}
			goldSpent = briberyCost;
		}

		// 5. Rolar e comparar
		const totalRoll =
			input.roll +
			lieutenant.tier +
			(input.axisModifier ?? 0) +
			(input.equipmentBonus ?? 0);

		// Falha Crítica
		if (input.roll === 1) {
			if (input.usePreventionBribery) {
				// Com suborno preventivo, vira falha normal
				cell.isLockdown = true;
				cell.lockdownWeeksRemaining = 1;
				cell.updatedAt = input.timestamp;
				await this.espionageRepository.save(cell);

				return ok({
					success: false,
					status: "failure",
					totalRoll,
					effectiveDc,
					goldSpent,
					infamyGained: 0,
					heatGained: 0,
					cellDestroyed: false,
					cellLockedDown: true,
					message:
						"Falha Crítica prevenida por suborno. Célula em lockdown por 1 semana.",
				});
			}

			// Sem suborno, dissipa o tenente e destrói a célula, gerando 20 Infâmia
			lieutenant.hpCurrent = 0;
			lieutenant.isDissipated = true;
			lieutenant.updatedAt = input.timestamp;
			await this.companionRepository.saveCompanion(lieutenant);

			await this.espionageRepository.deleteCell(cell.id);
			return ok({
				success: false,
				status: "critical_failure",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 20,
				heatGained: 0,
				cellDestroyed: true,
				cellLockedDown: false,
				message:
					"Falha Crítica! Tenente capturado e célula desmantelada permanentemente. +20 XP de Infâmia.",
			});
		}

		// Sucesso Crítico (superou por 10+)
		if (totalRoll >= effectiveDc + 10 || input.roll === 20) {
			let triumphBenefit = "";
			if (cell.specializedAxis === "physical") {
				triumphBenefit =
					"Saque de Oportunidade: Item consumível de Tier equivalente adicionado.";
			} else if (cell.specializedAxis === "mental") {
				triumphBenefit = "Análise Profunda: +1 Dossiê Extra obtido.";
			} else if (cell.specializedAxis === "social") {
				triumphBenefit =
					"Eficiência Logística: Custo de manutenção reduzido a zero pelas próximas 2 semanas.";
			}

			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "critical_success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 0,
				heatGained: 0,
				cellDestroyed: false,
				cellLockedDown: false,
				triumphBenefit,
				message: `Sucesso Crítico na missão! Objetivo cumprido com benefício de triunfo: ${triumphBenefit}`,
			});
		}

		// Sucesso Normal
		if (totalRoll >= effectiveDc) {
			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 0,
				heatGained: 0,
				cellDestroyed: false,
				cellLockedDown: false,
				message: "Sucesso! Objetivo cumprido.",
			});
		}

		// Regra de Ouro (Sucesso com Custo): DC - 1 a DC - 4. Desativada sob Heat 3.
		if (totalRoll >= effectiveDc - 4 && cell.vigilanceHeat < 3) {
			let heatGained = 0;
			let infamyGained = 0;

			if (input.goldenRuleResolution === "heat") {
				heatGained = 1;
				cell.vigilanceHeat = Math.min(3, cell.vigilanceHeat + 1);
			} else {
				infamyGained = 10;
			}

			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "golden_rule_success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained,
				heatGained,
				cellDestroyed: false,
				cellLockedDown: false,
				message: `Regra de Ouro ativada! Sucesso com custo aplicado: ${
					heatGained > 0 ? "+1 Heat na região" : "+10 XP de Infâmia"
				}.`,
			});
		}

		// Falha Normal
		if (cell.vigilanceHeat === 3) {
			// Tolerância zero sob Heat 3: qualquer falha destrói a célula imediatamente
			await this.espionageRepository.deleteCell(cell.id);
			return ok({
				success: false,
				status: "failure",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 5,
				heatGained: 0,
				cellDestroyed: true,
				cellLockedDown: false,
				message:
					"Falha de missão sob Vigilância 3 (Caçada) destrói a célula imediatamente! +5 XP de Infâmia.",
			});
		}

		// Falha padrão
		cell.isLockdown = true;
		cell.lockdownWeeksRemaining = 1;
		cell.updatedAt = input.timestamp;
		await this.espionageRepository.save(cell);

		return ok({
			success: false,
			status: "failure",
			totalRoll,
			effectiveDc,
			goldSpent,
			infamyGained: 5,
			heatGained: 0,
			cellDestroyed: false,
			cellLockedDown: true,
			message:
				"A operação falhou. Célula em lockdown por 1 semana. +5 XP de Infâmia.",
		});
	}

	public async runCoordinatedOperation(input: {
		cellId: string;
		heroLevel: number;
		heroModifier: number;
		fameLevel: number;
		targetDc: number;
		roll: number;
		timestamp: string;
		goldenRuleResolution: "infamy" | "heat";
		equipmentBonus?: number;
		usePreventionBribery?: boolean;
		availableGold?: number;
	}): Promise<Result<OperationResult, EspionageServiceFailure>> {
		// 1. Buscar célula
		const cellRes = await this.espionageRepository.findById(input.cellId);
		if (!cellRes.success) {
			return fail({
				code: "CELL_NOT_FOUND",
				message: `Célula com ID '${input.cellId}' não encontrada.`,
			});
		}
		const cell = cellRes.data;

		if (cell.isLockdown) {
			return fail({
				code: "CELL_IN_LOCKDOWN",
				message: `Célula sob Lockdown (Falta ${cell.lockdownWeeksRemaining} semanas).`,
			});
		}

		// 2. Calcular dificuldade (Vigilância Heat afeta DC)
		let heatDcIncrease = 0;
		if (cell.vigilanceHeat === 1) heatDcIncrease = 2;
		else if (cell.vigilanceHeat === 2) heatDcIncrease = 4;
		else if (cell.vigilanceHeat === 3) heatDcIncrease = 5;

		const effectiveDc = input.targetDc + heatDcIncrease;

		// 3. Validar suborno
		let goldSpent = 0;
		if (input.usePreventionBribery) {
			const briberyCost = 50 * cell.tier;
			if ((input.availableGold ?? 0) < briberyCost) {
				return fail({
					code: "GOLD_INSUFFICIENT_FOR_BRIBERY",
					message: `Ouro insuficiente para pagar suborno preventivo. Necessário: ${briberyCost} PO, Disponível: ${input.availableGold} PO.`,
				});
			}
			goldSpent = briberyCost;
		}

		// 4. Rolar teste coordenado
		// Fórmula: 1d20 + Nível do Herói + Modificador do Eixo (Mental ou Social) + Bônus + Fama
		const totalRoll =
			input.roll +
			input.heroLevel +
			input.heroModifier +
			(input.equipmentBonus ?? 0) +
			input.fameLevel;

		// Falha Crítica
		if (input.roll === 1) {
			if (input.usePreventionBribery) {
				cell.isLockdown = true;
				cell.lockdownWeeksRemaining = 1;
				cell.updatedAt = input.timestamp;
				await this.espionageRepository.save(cell);

				return ok({
					success: false,
					status: "failure",
					totalRoll,
					effectiveDc,
					goldSpent,
					infamyGained: 0,
					heatGained: 0,
					cellDestroyed: false,
					cellLockedDown: true,
					message:
						"Falha Crítica prevenida por suborno. Célula em lockdown por 1 semana.",
				});
			}

			// Sem suborno, dissipa o tenente e destrói a célula, gerando 20 Infâmia
			const compRes = await this.companionRepository.getCompanion(
				cell.tenenteCompanionId,
			);
			if (compRes.success && compRes.data) {
				const lieutenant = compRes.data;
				lieutenant.hpCurrent = 0;
				lieutenant.isDissipated = true;
				lieutenant.updatedAt = input.timestamp;
				await this.companionRepository.saveCompanion(lieutenant);
			}

			await this.espionageRepository.deleteCell(cell.id);
			return ok({
				success: false,
				status: "critical_failure",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 20,
				heatGained: 0,
				cellDestroyed: true,
				cellLockedDown: false,
				message:
					"Falha Crítica! Célula de espionagem desmantelada permanentemente. +20 XP de Infâmia.",
			});
		}

		// Sucesso Crítico (superou por 10+)
		if (totalRoll >= effectiveDc + 10 || input.roll === 20) {
			let triumphBenefit = "";
			if (cell.specializedAxis === "physical") {
				triumphBenefit =
					"Saque de Oportunidade: Item consumível de Tier equivalente adicionado.";
			} else if (cell.specializedAxis === "mental") {
				triumphBenefit = "Análise Profunda: +1 Dossiê Extra obtido.";
			} else if (cell.specializedAxis === "social") {
				triumphBenefit =
					"Eficiência Logística: Custo de manutenção reduzido a zero pelas próximas 2 semanas.";
			}

			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "critical_success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 0,
				heatGained: 0,
				cellDestroyed: false,
				cellLockedDown: false,
				triumphBenefit,
				message: `Sucesso Crítico! Missão coordenada concluída: ${triumphBenefit}`,
			});
		}

		// Sucesso Normal
		if (totalRoll >= effectiveDc) {
			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 0,
				heatGained: 0,
				cellDestroyed: false,
				cellLockedDown: false,
				message: "Sucesso! Operação coordenada concluída com êxito.",
			});
		}

		// Regra de Ouro (Sucesso com Custo): DC - 1 a DC - 4. Desativada sob Heat 3.
		if (totalRoll >= effectiveDc - 4 && cell.vigilanceHeat < 3) {
			let heatGained = 0;
			let infamyGained = 0;

			if (input.goldenRuleResolution === "heat") {
				heatGained = 1;
				cell.vigilanceHeat = Math.min(3, cell.vigilanceHeat + 1);
			} else {
				infamyGained = 10;
			}

			cell.updatedAt = input.timestamp;
			await this.espionageRepository.save(cell);

			return ok({
				success: true,
				status: "golden_rule_success",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained,
				heatGained,
				cellDestroyed: false,
				cellLockedDown: false,
				message: `Sucesso com custo! Regra de Ouro aplicada: ${
					heatGained > 0 ? "+1 Heat na região" : "+10 XP de Infâmia"
				}.`,
			});
		}

		// Falha Normal
		if (cell.vigilanceHeat === 3) {
			await this.espionageRepository.deleteCell(cell.id);
			return ok({
				success: false,
				status: "failure",
				totalRoll,
				effectiveDc,
				goldSpent,
				infamyGained: 5,
				heatGained: 0,
				cellDestroyed: true,
				cellLockedDown: false,
				message:
					"Falha de missão coordenada sob Vigilância 3 destrói a célula imediatamente! +5 XP de Infâmia.",
			});
		}

		cell.isLockdown = true;
		cell.lockdownWeeksRemaining = 1;
		cell.updatedAt = input.timestamp;
		await this.espionageRepository.save(cell);

		return ok({
			success: false,
			status: "failure",
			totalRoll,
			effectiveDc,
			goldSpent,
			infamyGained: 5,
			heatGained: 0,
			cellDestroyed: false,
			cellLockedDown: true,
			message:
				"A operação coordenada falhou. Célula em lockdown por 1 semana. +5 XP de Infâmia.",
		});
	}

	public async processWeeklyMaintenance(input: {
		campaignId: string;
		availableGold: number;
		timestamp: string;
	}): Promise<
		Result<
			{ cells: readonly EspionageCellRecord[]; goldSpent: number },
			EspionageServiceFailure
		>
	> {
		const listRes = await this.espionageRepository.listByCampaign(
			input.campaignId,
		);
		if (!listRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao listar as células para recesso semanal.",
				details: listRes.error,
			});
		}

		const cells = listRes.data;
		let remainingGold = input.availableGold;
		let goldSpent = 0;

		const updatedCells: EspionageCellRecord[] = [];

		for (const cell of cells) {
			if (cell.isLockdown) {
				// Células em lockdown não pagam manutenção, mas reduzem tempo restante
				const nextWeeks = cell.lockdownWeeksRemaining - 1;
				const updatedCell = {
					...cell,
					lockdownWeeksRemaining: Math.max(0, nextWeeks),
					isLockdown: nextWeeks > 0,
					updatedAt: input.timestamp,
				};
				const saveRes = await this.espionageRepository.save(updatedCell);
				if (saveRes.success) {
					updatedCells.push(saveRes.data);
				}
				continue;
			}

			// Calcular manutenção
			// Tier 1 = 10, Tier 2 = 25, Tier 3 = 50, Tier 4 = 100
			let cost = 10;
			if (cell.tier === 2) cost = 25;
			else if (cell.tier === 3) cost = 50;
			else if (cell.tier === 4) cost = 100;

			if (remainingGold >= cost) {
				remainingGold -= cost;
				goldSpent += cost;
				updatedCells.push(cell);
			} else {
				// Sem saldo: entra em lockdown
				const updatedCell = {
					...cell,
					isLockdown: true,
					lockdownWeeksRemaining: 1,
					updatedAt: input.timestamp,
				};
				const saveRes = await this.espionageRepository.save(updatedCell);
				if (saveRes.success) {
					updatedCells.push(saveRes.data);
				}
			}
		}

		return ok({
			cells: updatedCells,
			goldSpent,
		});
	}

	public async coolDownCell(
		cellId: string,
		timestamp: string,
	): Promise<Result<EspionageCellRecord, EspionageServiceFailure>> {
		const cellRes = await this.espionageRepository.findById(cellId);
		if (!cellRes.success) {
			return fail({
				code: "CELL_NOT_FOUND",
				message: `Célula com ID '${cellId}' não encontrada.`,
			});
		}
		const cell = cellRes.data;

		// Resfriamento Passivo: Inativa por 1 semana reduz o Heat da região em -1
		cell.isLockdown = true;
		cell.lockdownWeeksRemaining = 1;
		cell.vigilanceHeat = Math.max(0, cell.vigilanceHeat - 1);
		cell.updatedAt = timestamp;

		const saveRes = await this.espionageRepository.save(cell);
		if (!saveRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao salvar a célula após resfriamento passivo.",
				details: saveRes.error,
			});
		}

		return ok(saveRes.data);
	}

	public async clearHeatWithResources(input: {
		cellId: string;
		method: "gold" | "favor";
		availableGold: number;
		campaignId: string;
		timestamp: string;
	}): Promise<
		Result<
			{
				cell: EspionageCellRecord;
				goldSpent: number;
				favorPointsSpent: number;
			},
			EspionageServiceFailure
		>
	> {
		const cellRes = await this.espionageRepository.findById(input.cellId);
		if (!cellRes.success) {
			return fail({
				code: "CELL_NOT_FOUND",
				message: `Célula com ID '${input.cellId}' não encontrada.`,
			});
		}
		const cell = cellRes.data;

		let goldSpent = 0;
		let favorPointsSpent = 0;

		if (input.method === "gold") {
			// Tag A: 100 PO * Tier. Reduz o Heat em -2
			const cost = 100 * cell.tier;
			if (input.availableGold < cost) {
				return fail({
					code: "GOLD_INSUFFICIENT",
					message: `Ouro insuficiente para limpeza de Heat. Necessário: ${cost} PO, Disponível: ${input.availableGold} PO.`,
				});
			}
			goldSpent = cost;
		} else {
			// Tag D: 1 Favor Menor. Reduz o Heat em -2
			const ledgerRes = await this.factionRepository.getLedger(
				input.campaignId,
			);
			if (!ledgerRes.success || !ledgerRes.data) {
				return fail({
					code: "LEDGER_NOT_FOUND",
					message: "Ledger de reputação da campanha não pôde ser carregado.",
				});
			}
			const ledger = ledgerRes.data;
			if (ledger.favorPoints < 1) {
				return fail({
					code: "FAVOR_POINTS_INSUFFICIENT",
					message:
						"Pontos de favor insuficientes para limpar Heat via influência.",
				});
			}
			ledger.favorPoints -= 1;
			ledger.updatedAt = input.timestamp;
			await this.factionRepository.saveLedger(ledger);
			favorPointsSpent = 1;
		}

		cell.vigilanceHeat = Math.max(0, cell.vigilanceHeat - 2);
		cell.updatedAt = input.timestamp;

		const saveRes = await this.espionageRepository.save(cell);
		if (!saveRes.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_FAILED",
				message: "Erro ao salvar a célula após limpeza de Heat.",
				details: saveRes.error,
			});
		}

		return ok({
			cell: saveRes.data,
			goldSpent,
			favorPointsSpent,
		});
	}

	public async processWeeklyMaintenanceByTime(input: {
		campaignId: string;
		availableGold: number;
		timestamp: string;
	}): Promise<
		Result<
			{
				maintenanceRun: boolean;
				goldSpent: number;
				updatedCells: readonly EspionageCellRecord[];
			},
			EspionageServiceFailure
		>
	> {
		if (!this.worldStateRepository) {
			return ok({
				maintenanceRun: false,
				goldSpent: 0,
				updatedCells: [],
			});
		}

		// 1. Obter o tempo atual
		const timeRes = await this.worldStateRepository.getFlag(
			"location:current_time",
		);
		let currentDay = 1;
		if (timeRes.success) {
			const timeData = JSON.parse(timeRes.data.valueJson) as any;
			currentDay = timeData.day ?? 1;
		}

		// 2. Obter o dia da última manutenção processada
		const lastRecessRes = await this.worldStateRepository.getFlag(
			"location:espionage_last_recess_day",
		);
		let lastRecessDay = 1;
		if (lastRecessRes.success) {
			lastRecessDay = JSON.parse(lastRecessRes.data.valueJson) as number;
		} else {
			// Se não existe, inicializa com o dia atual e salva
			await this.worldStateRepository.setFlag({
				key: "location:espionage_last_recess_day",
				valueJson: JSON.stringify(currentDay),
				updatedAt: input.timestamp,
			});
			lastRecessDay = currentDay;
		}

		const daysPassed = currentDay - lastRecessDay;
		if (daysPassed >= 7) {
			const recessesToProcess = Math.floor(daysPassed / 7);
			let remainingGold = input.availableGold;
			let totalGoldSpent = 0;
			let finalUpdatedCells: readonly EspionageCellRecord[] = [];

			for (let i = 0; i < recessesToProcess; i++) {
				const maintenanceRes = await this.processWeeklyMaintenance({
					campaignId: input.campaignId,
					availableGold: remainingGold,
					timestamp: input.timestamp,
				});

				if (!maintenanceRes.success) {
					return fail(maintenanceRes.error);
				}

				remainingGold -= maintenanceRes.data.goldSpent;
				totalGoldSpent += maintenanceRes.data.goldSpent;
				finalUpdatedCells = maintenanceRes.data.cells;
			}

			// Atualiza a flag do dia da última manutenção
			const nextRecessDay = lastRecessDay + recessesToProcess * 7;
			await this.worldStateRepository.setFlag({
				key: "location:espionage_last_recess_day",
				valueJson: JSON.stringify(nextRecessDay),
				updatedAt: input.timestamp,
			});

			return ok({
				maintenanceRun: true,
				goldSpent: totalGoldSpent,
				updatedCells: finalUpdatedCells,
			});
		}

		return ok({
			maintenanceRun: false,
			goldSpent: 0,
			updatedCells: [],
		});
	}
}
