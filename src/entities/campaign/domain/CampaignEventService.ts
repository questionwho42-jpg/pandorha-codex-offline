import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CampaignEventRecord,
	campaignEventSelectSchema,
} from "../model/campaignSchema";
import type { CampaignRepository } from "./CampaignRepository";

export interface ICampaignWorldState {
	getFlag(key: string): Promise<Result<{ value: any }, any>>;
	setFlag(key: string, value: any): Promise<Result<any, any>>;
}

export interface ICampaignSiegeTrigger {
	triggerSiege(params: {
		campaignId: string;
		bastionId: string;
		factionId: string;
		dangerLevel: number;
	}): Promise<Result<any, any>>;
}

export interface ICampaignFactionStanding {
	getInfamy(factionId: string): Promise<Result<number, any>>;
}

export class CampaignEventService {
	public constructor(
		private readonly repository: CampaignRepository,
		private readonly worldState?: ICampaignWorldState,
		private readonly siegeTrigger?: ICampaignSiegeTrigger,
		private readonly factionStanding?: ICampaignFactionStanding,
	) {}

	public async recordEvent(
		campaignId: string,
		eventType: string,
		description: string,
	): Promise<Result<CampaignEventRecord, Error>> {
		const newEvent = {
			id: crypto.randomUUID(),
			campaignId,
			eventType,
			description,
			createdAt: new Date().toISOString(),
		};

		const parsed = campaignEventSelectSchema.safeParse(newEvent);
		if (!parsed.success) {
			return fail(
				new Error(`Dados inválidos para histórico: ${parsed.error.message}`),
			);
		}

		return this.repository.saveEvent(parsed.data);
	}

	public async listEvents(
		campaignId: string,
	): Promise<Result<CampaignEventRecord[], Error>> {
		return this.repository.listEvents(campaignId);
	}

	public async evaluateTriggers(
		campaignId: string,
		triggerPayload: string,
		context?: any,
	): Promise<
		Result<{ ambushTriggered?: boolean; eventTriggered?: string | null }, Error>
	> {
		try {
			if (triggerPayload === "CHECK_INFAMY") {
				if (!this.worldState || !this.siegeTrigger || !this.factionStanding) {
					return ok({});
				}

				// Verificar se a regra está ativada
				const ruleRes = await this.worldState.getFlag(
					"system:rules:siege_on_extreme_infamy",
				);
				const isRuleEnabled = ruleRes.success
					? ruleRes.data.value === true
					: true;

				if (!isRuleEnabled) {
					return ok({});
				}

				const factionId = context?.factionId || "rival_faction";
				const bastionId = context?.bastionId || "primary_bastion";

				const infamyRes = await this.factionStanding.getInfamy(factionId);
				if (!infamyRes.success) {
					return fail(new Error("Não foi possível buscar a infâmia da facção"));
				}

				const infamy = infamyRes.data;
				if (infamy <= -10) {
					const dangerLevel = Math.min(
						5,
						Math.max(1, Math.floor(Math.abs(infamy) / 5)),
					);

					// Gravar histórico informativo
					await this.recordEvent(
						campaignId,
						"ambience_change",
						`A infâmia com a facção inimiga [${factionId}] atingiu nível extremo [${infamy}].`,
					);

					const triggerRes = await this.siegeTrigger.triggerSiege({
						campaignId,
						bastionId,
						factionId,
						dangerLevel,
					});

					if (triggerRes.success) {
						await this.recordEvent(
							campaignId,
							"siege_start",
							`Cerco iniciado automaticamente devido a infâmia extrema com a facção [${factionId}]. Nível de Perigo: ${dangerLevel}.`,
						);
					}
				}
				return ok({});
			}

			if (triggerPayload === "CLOCK_COMPLETED") {
				if (!this.worldState) {
					return ok({});
				}

				const triggerEvent = context?.triggerEvent || "";
				const clockName = context?.clockName || "Relógio";

				// Gravar evento de progresso completado
				await this.recordEvent(
					campaignId,
					"clock_advance",
					`O Relógio de Progresso [${clockName}] foi preenchido totalmente!`,
				);

				if (triggerEvent.startsWith("weather:")) {
					const weatherType = triggerEvent.split(":")[1] || "none";
					await this.worldState.setFlag("location:weather_active", weatherType);

					await this.recordEvent(
						campaignId,
						"weather_shift",
						`O clima mudou para [${weatherType}] devido ao término do relógio [${clockName}].`,
					);
				}

				return ok({});
			}

			if (triggerPayload === "CAMP_REST_ATTEMPT") {
				if (!this.worldState) {
					return ok({ ambushTriggered: false });
				}

				const isDebtMarked = context?.isDebtMarked === true;
				const ruleRes = await this.worldState.getFlag(
					"system:rules:block_rest_on_debt_marked",
				);
				const isRuleEnabled = ruleRes.success
					? ruleRes.data.value === true
					: true;

				if (isRuleEnabled && isDebtMarked) {
					await this.recordEvent(
						campaignId,
						"ambience_change",
						"O repouso foi interrompido por um ataque surpresa! O grupo está Marcado pela Dívida.",
					);
					return ok({ ambushTriggered: true });
				}

				return ok({ ambushTriggered: false });
			}

			return ok({});
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Erro ao avaliar gatilhos de campanha."),
			);
		}
	}
}
