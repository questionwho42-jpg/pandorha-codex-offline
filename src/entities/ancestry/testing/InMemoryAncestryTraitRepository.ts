import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { AncestryTraitRepository } from "../domain/AncestryTraitRepository";
import {
	type AncestryId,
	type AncestryTraitId,
	type AncestryTraitLinkRecord,
	type AncestryTraitRecord,
	ancestryTraitLinkSelectSchema,
	ancestryTraitSelectSchema,
} from "../model/ancestrySchema";
import type { AncestryTraitRepositoryFailure } from "../model/ancestryTypes";

export class InMemoryAncestryTraitRepository
	implements AncestryTraitRepository
{
	private readonly traits = new Map<AncestryTraitId, AncestryTraitRecord>();
	private readonly linksByAncestry = new Map<
		AncestryId,
		Set<AncestryTraitId>
	>();
	private nextListFailure: AncestryTraitRepositoryFailure | null = null;
	private nextFindFailure: AncestryTraitRepositoryFailure | null = null;
	private nextLinkFailure: AncestryTraitRepositoryFailure | null = null;

	public constructor(
		traits: readonly AncestryTraitRecord[],
		links: readonly AncestryTraitLinkRecord[],
	) {
		for (const trait of traits) {
			const parsed = ancestryTraitSelectSchema.safeParse(trait);
			if (parsed.success) {
				this.traits.set(parsed.data.id, parsed.data);
			}
		}

		for (const link of links) {
			const parsed = ancestryTraitLinkSelectSchema.safeParse(link);
			if (!parsed.success) {
				continue;
			}

			const existing =
				this.linksByAncestry.get(parsed.data.ancestryId) ??
				new Set<AncestryTraitId>();
			existing.add(parsed.data.traitId);
			this.linksByAncestry.set(parsed.data.ancestryId, existing);
		}
	}

	public async listTraitsByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		const traitIds = this.linksByAncestry.get(ancestryId) ?? new Set();
		const traits = Array.from(traitIds).flatMap((traitId) => {
			const trait = this.traits.get(traitId);
			return trait ? [trait] : [];
		});

		return ok(traits);
	}

	public async findTraitsByIds(
		traitIds: readonly AncestryTraitId[],
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		if (this.nextFindFailure) {
			const failure = this.nextFindFailure;
			this.nextFindFailure = null;
			return fail(failure);
		}

		return ok(
			traitIds.flatMap((traitId) => {
				const trait = this.traits.get(traitId);
				return trait ? [trait] : [];
			}),
		);
	}

	public async listLinksByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitLinkRecord[], AncestryTraitRepositoryFailure>
	> {
		if (this.nextLinkFailure) {
			const failure = this.nextLinkFailure;
			this.nextLinkFailure = null;
			return fail(failure);
		}

		const traitIds = this.linksByAncestry.get(ancestryId) ?? new Set();
		return ok(
			Array.from(traitIds).map((traitId) => ({
				ancestryId,
				traitId,
			})),
		);
	}

	public failNextList(failure: AncestryTraitRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextFind(failure: AncestryTraitRepositoryFailure): void {
		this.nextFindFailure = failure;
	}

	public failNextLinks(failure: AncestryTraitRepositoryFailure): void {
		this.nextLinkFailure = failure;
	}
}
