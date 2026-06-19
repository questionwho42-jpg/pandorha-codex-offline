import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { IDowntimeContext } from "../model/downtimeTypes";

export interface DowntimeLogResult {
	rollResult: number;
	outcomeDetails: string;
}

/**
 * @description Servidor de regras e resoluções do Downtime dos Andarilhos (Recesso Semanal)
 * @rule docs/adr/ADR-017-wanderer-downtime-engine.md
 */
export class DowntimeService {
	constructor(private readonly context: IDowntimeContext) {}

	/**
	 * Tag A: Busca Legal de Ouro (Sustento)
	 * Rolar d20 + Atributo do Trabalho vs DC 10 (Sustento), DC 15 (Militar), DC 20 (Lorde)
	 */
	public async resolveTagA(params: {
		characterId: string;
		tier: "sustento" | "militar" | "lorde";
		statName: string;
		regionId?: string;
	}): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;
		const dice = this.context.getDice();

		const rawRoll = dice.rollD20();
		const mod = actor.getStat(params.statName);
		const total = rawRoll + mod;

		let dc = 10;
		if (params.tier === "militar") dc = 15;
		if (params.tier === "lorde") dc = 20;

		const isCritical = total >= dc + 10 || rawRoll === 20;

		if (total >= dc) {
			if (params.tier === "sustento") {
				return ok({
					rollResult: total,
					outcomeDetails: isCritical
						? "Sucesso Crítico: Sustentou-se com sucesso absoluto (estilo de vida luxuoso)."
						: "Sucesso: Sustentou-se com sucesso (hospedagem simples garantida).",
				});
			}

			if (params.tier === "militar") {
				const goldEarned = isCritical ? 30 : 15;
				await actor.modifyGold(goldEarned);
				return ok({
					rollResult: total,
					outcomeDetails: isCritical
						? "Sucesso Crítico: Trabalho militar corporativo com honras. Ganhou 30 PO e +1 Favor Menor."
						: "Sucesso: Trabalho militar corporativo concluído. Ganhou 15 PO.",
				});
			}

			// Lorde
			const goldEarned = isCritical ? 100 : 50;
			await actor.modifyGold(goldEarned);
			return ok({
				rollResult: total,
				outcomeDetails: isCritical
					? "Sucesso Crítico: Lorde de Alta Corte impressionou a nobreza. Ganhou 100 PO e +1 Favor Maior."
					: "Sucesso Robusto: Lorde de Alta Corte bem-sucedido. Ganhou 50 PO.",
			});
		}

		// Falhas
		if (params.tier === "sustento") {
			return ok({
				rollResult: total,
				outcomeDetails:
					"Falha: Expulso do trabalho. Vigor cansado e músculos flácidos.",
			});
		}

		if (params.tier === "militar") {
			await actor.modifyGold(-5);
			return ok({
				rollResult: total,
				outcomeDetails: "Falha: Mercadoria estragada. Multa de 5 PO aplicada.",
			});
		}

		// Lorde Falha
		const isCritFail = total <= dc - 10 || rawRoll === 1;
		if (isCritFail && params.regionId) {
			const factionRes = await this.context.getFaction(params.regionId);
			if (factionRes.success) {
				await factionRes.data.modifyStanding(params.regionId, -10);
			}
			return ok({
				rollResult: total,
				outcomeDetails:
					"Falha Crítica: Escorregão de etiqueta absurdo! Perdeu 10 de Fama regional.",
			});
		}

		return ok({
			rollResult: total,
			outcomeDetails: "Falha: Rejeitado nos círculos da corte.",
		});
	}

	/**
	 * Tag B: Recuperação Prolongada Intensiva (Curas)
	 * Deduz 100 PO para remover enfermidades graves/permanentes.
	 */
	public async resolveTagB(
		characterId: string,
	): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		if (actor.getGold() < 100) {
			return fail(
				"Ouro insuficiente para internação no santuário (requer 100 PO).",
			);
		}

		await actor.modifyGold(-100);
		await actor.clearIllnessesAndNecroticLosses();

		return ok({
			rollResult: 0,
			outcomeDetails:
				"Cura concluída. Enfermidades limpas e HP máximo restaurado.",
		});
	}

	/**
	 * Tag C: Investigação Arcana/Urbana Extrema
	 * Rolar d20 + mental + interaction vs DC 20/25 gastando suborno
	 */
	public async resolveTagC(params: {
		characterId: string;
		bossId: string;
		dc: number;
		subornoPO: number;
	}): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		if (actor.getGold() < params.subornoPO) {
			return fail("Ouro insuficiente para subornos.");
		}

		await actor.modifyGold(-params.subornoPO);

		const dice = this.context.getDice();
		const rawRoll = dice.rollD20();
		const mod = actor.getStat("mental") + actor.getStat("interaction");
		const total = rawRoll + mod;

		if (total >= params.dc) {
			const quest = this.context.getQuest();
			await quest.revealWeaknessOrImmunity(
				params.bossId,
				`fraqueza revelada contra boss ${params.bossId}`,
			);
			return ok({
				rollResult: total,
				outcomeDetails:
					"Sucesso: Fraquezas e imunidades do Boss reveladas no papiro de investigação.",
			});
		}

		return ok({
			rollResult: total,
			outcomeDetails:
				"Falha: Trilha de investigação falsa ou suborno desperdiçado com espiões duplos.",
		});
	}

	/**
	 * Tag D: Compra e Venda Especulativa no Submundo
	 * Rolar d20 + mod vs DC 20
	 */
	public async resolveTagD(
		characterId: string,
		statName: string,
	): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;
		const dice = this.context.getDice();

		const rawRoll = dice.rollD20();
		const mod = actor.getStat(statName);
		const total = rawRoll + mod;

		if (total >= 20) {
			return ok({
				rollResult: total,
				outcomeDetails:
					"Sucesso: Especulação positiva acertada! 20% de benefício em vendas/compras.",
			});
		}

		const isCritFail = total <= 10 || rawRoll === 1;
		if (isCritFail) {
			await actor.modifyGold(-20);
			return ok({
				rollResult: total,
				outcomeDetails:
					"Falha Crítica: Meliantes perceberam inexperiência. Perda de 20 PO com runas podres/falsificadas.",
			});
		}

		return ok({
			rollResult: total,
			outcomeDetails:
				"Falha: Sem oportunidades mercantilistas lucrativas nesta semana.",
		});
	}

	/**
	 * Tag E: Boemia e Lavagem de Infâmia Político
	 * Gasta 15 a 50 PO e rola Social vs DC
	 */
	public async resolveTagE(params: {
		characterId: string;
		regionId: string;
		goldSpent: number;
		statName: string;
		dc: number;
	}): Promise<Result<DowntimeLogResult, string>> {
		if (params.goldSpent < 15 || params.goldSpent > 50) {
			return fail("Custo boêmio fora dos limites (requer entre 15 e 50 PO).");
		}

		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		if (actor.getGold() < params.goldSpent) {
			return fail("Ouro insuficiente para noites de taverna e boemia.");
		}

		await actor.modifyGold(-params.goldSpent);

		const factionRes = await this.context.getFaction(params.regionId);
		if (!factionRes.success) {
			return fail(factionRes.error);
		}
		const faction = factionRes.data;

		const dice = this.context.getDice();
		const rawRoll = dice.rollD20();
		const mod = actor.getStat(params.statName);
		const total = rawRoll + mod;

		if (total >= params.dc) {
			const reduction = Math.floor(params.goldSpent / 10);
			await faction.modifyInfamy(params.regionId, -reduction);
			return ok({
				rollResult: total,
				outcomeDetails: `Sucesso: Gastos boêmios limparam o nome do grupo na região. Reduziu ${reduction} de Infâmia.`,
			});
		}

		return ok({
			rollResult: total,
			outcomeDetails:
				"Falha: Boemia sem impacto político nas tavernas. Infâmia regional inalterada.",
		});
	}

	/**
	 * Tag F: Re-Treinamento (Respec de Talentos)
	 * Substitui o talento antigo por novo
	 */
	public async resolveTagF(params: {
		characterId: string;
		oldTalentId: string;
		newTalentId: string;
	}): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		if (!actor.hasTalent(params.oldTalentId)) {
			return fail(
				"O talento antigo especificado não é possuído pelo andarilho.",
			);
		}

		const retrainRes = await actor.retrainTalent(
			params.oldTalentId,
			params.newTalentId,
		);
		if (!retrainRes.success) {
			return fail(retrainRes.error);
		}

		return ok({
			rollResult: 0,
			outcomeDetails: `Sucesso: Habilidade retreinada. Removeu [${params.oldTalentId}] e aprendeu [${params.newTalentId}].`,
		});
	}

	/**
	 * Tag G: Gestão de Domínio Regional
	 */
	public async resolveTagG(params: {
		characterId: string;
		actionType: "subir_nivel" | "coleta_impostos" | "manutencao_crise";
		statName: string;
	}): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		if (params.actionType === "coleta_impostos") {
			const dice = this.context.getDice();
			const total = dice.rollD20() + actor.getStat(params.statName);

			if (total >= 10) {
				return ok({
					rollResult: total,
					outcomeDetails:
						"Sucesso: Renda de Imposto coletada com sucesso no território.",
				});
			}
			return ok({
				rollResult: total,
				outcomeDetails:
					"Falha: Instabilidade gerada no território durante coleta fiscal.",
			});
		}

		return ok({
			rollResult: 0,
			outcomeDetails: `Sucesso: Ação de Domínio (${params.actionType}) resolvida.`,
		});
	}

	/**
	 * Tag H: Juramento de Sangue (Alianças de Facção)
	 * Custo: 500 PO * level (ou similar). Rolar vs DC da facção (mínimo 15)
	 */
	public async resolveTagH(params: {
		characterId: string;
		factionId: string;
		statName: string;
		dc: number;
	}): Promise<Result<DowntimeLogResult, string>> {
		const actorRes = await this.context.getActor(params.characterId);
		if (!actorRes.success) {
			return fail(actorRes.error);
		}
		const actor = actorRes.data;

		const cost = actor.getLevel() * 500;
		if (actor.getGold() < cost) {
			return fail(
				`Ouro insuficiente para pacto de facção (requer ${cost} PO para nível ${actor.getLevel()}).`,
			);
		}

		await actor.modifyGold(-cost);

		const factionRes = await this.context.getFaction(params.factionId);
		if (!factionRes.success) {
			return fail(factionRes.error);
		}
		const faction = factionRes.data;

		const dice = this.context.getDice();
		const rawRoll = dice.rollD20();
		const mod = actor.getStat(params.statName);
		const total = rawRoll + mod;

		const dc = Math.max(15, params.dc);

		if (total >= dc) {
			await faction.sealPact(params.factionId, true);
			await faction.modifyStanding(params.factionId, 25);
			return ok({
				rollResult: total,
				outcomeDetails:
					"Sucesso: Pacto de Juramento de Sangue selado com sucesso! +25 Standing de Facção.",
			});
		}

		return ok({
			rollResult: total,
			outcomeDetails:
				"Falha: Emissário da facção recusou o sacrifício e o juramento do grupo.",
		});
	}
}
