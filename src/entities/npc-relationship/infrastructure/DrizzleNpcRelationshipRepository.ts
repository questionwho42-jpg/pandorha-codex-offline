import { eq, type SQL } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { NpcRelationshipRepository } from "../domain/NpcRelationshipRepository";
import {
	type NewNpcRelationshipRecord,
	type NpcRelationshipRecord,
	npcRelationshipSelectSchema,
	npcRelationships,
} from "../model/npcRelationshipSchema";
import type { NpcRelationshipRepositoryFailure } from "../model/npcRelationshipTypes";

export interface NpcRelationshipDrizzleDatabase {
	insert(table: typeof npcRelationships): {
		values(record: NewNpcRelationshipRecord): {
			onConflictDoUpdate(input: {
				target: typeof npcRelationships.npcId;
				set: NewNpcRelationshipRecord;
			}): {
				returning(): Promise<NpcRelationshipRecord[]>;
			};
		};
	};
	select(): {
		from(table: typeof npcRelationships): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<NpcRelationshipRecord[]>;
			};
		};
	};
}

/**
 * @description Persists durable individual NPC relationship records through Drizzle without using WorldState flags.
 */
export class DrizzleNpcRelationshipRepository
	implements NpcRelationshipRepository
{
	public constructor(private readonly db: NpcRelationshipDrizzleDatabase) {}

	public async save(
		record: NewNpcRelationshipRecord,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		try {
			const rows = await this.db
				.insert(npcRelationships)
				.values(record)
				.onConflictDoUpdate({
					target: npcRelationships.npcId,
					set: record,
				})
				.returning();
			const parsed = npcRelationshipSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_NPC_RELATIONSHIP_RECORD",
					message:
						"Drizzle returned an invalid NPC relationship record after save.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED",
				message: "Could not persist NPC relationship record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findByNpcId(
		npcId: string,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		const rows = await this.db
			.select()
			.from(npcRelationships)
			.where(eq(npcRelationships.npcId, npcId))
			.limit(1);
		const row = rows[0];

		if (!row) {
			return fail({
				code: "NPC_RELATIONSHIP_NOT_FOUND",
				message: "NPC relationship record was not found.",
				details: { npcId },
			});
		}

		const parsed = npcRelationshipSelectSchema.safeParse(row);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_NPC_RELATIONSHIP_RECORD",
				message:
					"Drizzle returned an invalid NPC relationship record after select.",
				details: { npcId },
			});
		}

		return ok(parsed.data);
	}
}
