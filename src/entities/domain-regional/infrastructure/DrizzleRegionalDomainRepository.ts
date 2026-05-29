import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RegionalDomainRepository } from "../domain/RegionalDomainRepository";
import {
	campaignRegionalDomains,
	type NewRegionalDomainRecord,
	type RegionalDomainRecord,
	regionalDomainSelectSchema,
} from "../model/regionalDomainSchema";
import type { RegionalDomainRepositoryFailure } from "../model/regionalDomainTypes";

export class DrizzleRegionalDomainRepository
	implements RegionalDomainRepository
{
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		record: NewRegionalDomainRecord,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignRegionalDomains)
				.values(record)
				.onConflictDoUpdate({
					target: campaignRegionalDomains.id,
					set: {
						tier: record.tier,
						physicalLevel: record.physicalLevel,
						mentalLevel: record.mentalLevel,
						socialLevel: record.socialLevel,
						regentId: record.regentId,
						weeksAway: record.weeksAway,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			const result = await this.findById(record.id);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir o domínio regional.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignRegionalDomains)
				.where(eq(campaignRegionalDomains.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "REGIONAL_DOMAIN_NOT_FOUND",
					message: `Domínio regional com ID ${id} não encontrado.`,
				});
			}
			return ok(regionalDomainSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_REGIONAL_DOMAIN_RECORD",
				message: "Erro ao carregar registro de domínio regional do banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async listAll(): Promise<
		Result<readonly RegionalDomainRecord[], RegionalDomainRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(campaignRegionalDomains).all();
			const list = rows.map((r: unknown) =>
				regionalDomainSelectSchema.parse(r),
			);
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_REGIONAL_DOMAIN_RECORD",
				message: "Erro ao listar domínios regionais.",
				details: { cause: String(error) },
			});
		}
	}
}
