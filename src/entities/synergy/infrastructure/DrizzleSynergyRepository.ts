import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SynergyRepository,
	SynergyRepositoryFailure,
} from "../domain/SynergyRepository";
import {
	type CampaignCohesionRecord,
	campaignCohesion,
	campaignCohesionSelectSchema,
	type RegisteredSignatureRecord,
	registeredSignatures,
	signatureSelectSchema,
} from "../model/synergySchema";

export class DrizzleSynergyRepository implements SynergyRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database instance
	public constructor(private readonly db: any) {}

	public async getCohesion(
		id: string,
	): Promise<Result<CampaignCohesionRecord | null, SynergyRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignCohesion)
				.where(eq(campaignCohesion.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}

			const parsed = campaignCohesionSelectSchema.safeParse(row);
			if (!parsed.success) {
				return fail({
					code: "SYNERGY_REPOSITORY_READ_FAILED",
					message: "Invalid cohesion record format in database.",
					details: parsed.error,
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_READ_FAILED",
				message: "Could not fetch campaign cohesion record.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async saveCohesion(
		cohesion: CampaignCohesionRecord,
	): Promise<Result<CampaignCohesionRecord, SynergyRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignCohesion)
				.values({
					id: cohesion.id,
					cohesionLevel: cohesion.cohesionLevel,
					cohesionPoints: cohesion.cohesionPoints,
					activePlayers: cohesion.activePlayers,
					updatedAt: cohesion.updatedAt,
				})
				.onConflictDoUpdate({
					target: campaignCohesion.id,
					set: {
						cohesionLevel: cohesion.cohesionLevel,
						cohesionPoints: cohesion.cohesionPoints,
						activePlayers: cohesion.activePlayers,
						updatedAt: cohesion.updatedAt,
					},
				})
				.run();

			return ok(cohesion);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_WRITE_FAILED",
				message: "Could not save campaign cohesion record.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async saveSignature(
		signature: RegisteredSignatureRecord,
	): Promise<Result<RegisteredSignatureRecord, SynergyRepositoryFailure>> {
		try {
			await this.db
				.insert(registeredSignatures)
				.values({
					id: signature.id,
					name: signature.name,
					openingTactId: signature.openingTactId,
					reinforceTactId: signature.reinforceTactId ?? null,
					detonationTactId: signature.detonationTactId,
					usageCount: signature.usageCount,
					updatedAt: signature.updatedAt,
				})
				.onConflictDoUpdate({
					target: registeredSignatures.id,
					set: {
						name: signature.name,
						openingTactId: signature.openingTactId,
						reinforceTactId: signature.reinforceTactId ?? null,
						detonationTactId: signature.detonationTactId,
						usageCount: signature.usageCount,
						updatedAt: signature.updatedAt,
					},
				})
				.run();

			return ok(signature);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_WRITE_FAILED",
				message: "Could not save registered signature.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async findSignatureById(
		id: string,
	): Promise<
		Result<RegisteredSignatureRecord | null, SynergyRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(registeredSignatures)
				.where(eq(registeredSignatures.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}

			const parsed = signatureSelectSchema.safeParse(row);
			if (!parsed.success) {
				return fail({
					code: "SYNERGY_REPOSITORY_READ_FAILED",
					message: "Invalid signature record format in database.",
					details: parsed.error,
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_READ_FAILED",
				message: "Could not fetch registered signature by ID.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async findAllSignatures(): Promise<
		Result<RegisteredSignatureRecord[], SynergyRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(registeredSignatures).all();

			const list: RegisteredSignatureRecord[] = [];
			for (const row of rows) {
				const parsed = signatureSelectSchema.safeParse(row);
				if (!parsed.success) {
					return fail({
						code: "SYNERGY_REPOSITORY_READ_FAILED",
						message: "Invalid signature record in list.",
						details: parsed.error,
					});
				}
				list.push(parsed.data);
			}

			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_READ_FAILED",
				message: "Could not fetch all registered signatures.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async deleteSignature(
		id: string,
	): Promise<Result<void, SynergyRepositoryFailure>> {
		try {
			await this.db
				.delete(registeredSignatures)
				.where(eq(registeredSignatures.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "SYNERGY_REPOSITORY_WRITE_FAILED",
				message: "Could not delete registered signature.",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}
}
