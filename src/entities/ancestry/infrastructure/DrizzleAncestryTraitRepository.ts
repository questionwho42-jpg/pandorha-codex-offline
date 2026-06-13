import { eq, inArray } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { AncestryTraitRepository } from "../domain/AncestryTraitRepository";
import type {
	AncestryId,
	AncestryTraitId,
	AncestryTraitLinkRecord,
	AncestryTraitRecord,
} from "../model/ancestrySchema";
import { ancestryTraitLinks, ancestryTraits } from "../model/ancestrySchema";
import type { AncestryTraitRepositoryFailure } from "../model/ancestryTypes";

export class DrizzleAncestryTraitRepository implements AncestryTraitRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance dynamic typing
	public constructor(private readonly db: any) {}

	public async listTraitsByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		try {
			const rows = this.db
				.select({
					id: ancestryTraits.id,
					label: ancestryTraits.label,
					description: ancestryTraits.description,
					sourceFile: ancestryTraits.sourceFile,
				})
				.from(ancestryTraits)
				.innerJoin(
					ancestryTraitLinks,
					eq(ancestryTraits.id, ancestryTraitLinks.traitId),
				)
				.where(eq(ancestryTraitLinks.ancestryId, ancestryId))
				.all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
				message: "Falha ao listar traços por ancestralidade no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async findTraitsByIds(
		traitIds: readonly AncestryTraitId[],
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		try {
			if (traitIds.length === 0) {
				return ok([]);
			}
			const rows = this.db
				.select()
				.from(ancestryTraits)
				.where(inArray(ancestryTraits.id, traitIds as AncestryTraitId[]))
				.all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
				message: "Falha ao buscar traços por IDs no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async listLinksByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitLinkRecord[], AncestryTraitRepositoryFailure>
	> {
		try {
			const rows = this.db
				.select()
				.from(ancestryTraitLinks)
				.where(eq(ancestryTraitLinks.ancestryId, ancestryId))
				.all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
				message: "Falha ao listar links de traços no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}
}
