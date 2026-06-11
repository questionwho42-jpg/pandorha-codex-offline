import { eq, like } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldStateRepository } from "../domain/WorldStateRepository";
import {
	type WorldStateEntryRecord,
	type WorldStateKey,
	type WorldStateListPrefix,
	worldStateEntries,
	worldStateEntrySelectSchema,
} from "../model/worldStateSchema";
import type { WorldStateRepositoryFailure } from "../model/worldStateTypes";

export class DrizzleWorldStateRepository implements WorldStateRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async setFlag(flag: {
		key: WorldStateKey;
		valueJson: string;
		updatedAt: string;
	}): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		try {
			await this.db
				.insert(worldStateEntries)
				.values({
					key: flag.key,
					valueJson: flag.valueJson,
					updatedAt: flag.updatedAt,
				})
				.onConflictDoUpdate({
					target: worldStateEntries.key,
					set: {
						valueJson: flag.valueJson,
						updatedAt: flag.updatedAt,
					},
				})
				.run();

			const result = await this.getFlag(flag.key);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível gravar a flag do world state.",
				details: { cause: String(error) },
			});
		}
	}

	public async getFlag(
		key: WorldStateKey,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(worldStateEntries)
				.where(eq(worldStateEntries.key, key))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "WORLD_STATE_FLAG_NOT_FOUND",
					message: `Flag do world state com a chave '${key}' não encontrada.`,
				});
			}
			return ok(worldStateEntrySelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: "Erro ao ler a flag do world state.",
				details: { cause: String(error) },
			});
		}
	}

	public async listFlagsByPrefix(
		prefix: WorldStateListPrefix,
	): Promise<
		Result<readonly WorldStateEntryRecord[], WorldStateRepositoryFailure>
	> {
		try {
			const searchPattern = `${prefix}%`;
			const rows = await this.db
				.select()
				.from(worldStateEntries)
				.where(like(worldStateEntries.key, searchPattern))
				.all();
			const list = rows.map((r: unknown) =>
				worldStateEntrySelectSchema.parse(r),
			);
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: `Erro ao listar flags com prefixo '${prefix}'.`,
				details: { cause: String(error) },
			});
		}
	}
}
