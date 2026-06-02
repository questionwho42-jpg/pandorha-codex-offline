import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type AncestryId,
	type AncestryTraitId,
	type AncestryTraitRecord,
	ancestryIdSchema,
	ancestryTraitChoiceInputSchema,
	ancestryTraitLinkSelectSchema,
	ancestryTraitSelectSchema,
} from "../model/ancestrySchema";
import type { AncestryTraitFailure } from "../model/ancestryTypes";
import type { AncestryTraitRepository } from "./AncestryTraitRepository";

export interface AncestryTraitSelection {
	readonly ancestryId: AncestryId;
	readonly traitIds: readonly AncestryTraitId[];
	readonly traits: readonly AncestryTraitRecord[];
}

/**
 * @description Validates the textual ancestry trait catalog and the level-one choice of exactly three traits.
 * @rule docs/system/survival/guia-criacao-de-ficha.md - every ancestry offers 10 traits and a character chooses 3
 */
export class AncestryTraitSelectionService {
	public constructor(private readonly repository: AncestryTraitRepository) {}

	public async listTraitsByAncestry(
		ancestryId: unknown,
	): Promise<Result<readonly AncestryTraitRecord[], AncestryTraitFailure>> {
		const parsedId = ancestryIdSchema.safeParse(ancestryId);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_ANCESTRY_ID",
				message: "Ancestry id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const listed = await this.repository.listTraitsByAncestry(parsedId.data);
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated = validateTraitRecords(listed.data);
		if (!validated.success) {
			return validated;
		}

		return ok(validated.data);
	}

	public async chooseLevelOneTraits(
		input: unknown,
	): Promise<Result<AncestryTraitSelection, AncestryTraitFailure>> {
		const parsedInput = ancestryTraitChoiceInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_ANCESTRY_TRAIT_SELECTION",
				message:
					"Level-one ancestry trait selection must contain exactly three valid trait ids.",
				details: { issues: formatIssues(parsedInput.error.issues) },
			});
		}

		const selectedIds = parsedInput.data.traitIds;
		if (new Set(selectedIds).size !== selectedIds.length) {
			return fail({
				code: "DUPLICATE_ANCESTRY_TRAIT_SELECTION",
				message:
					"Level-one ancestry trait selection cannot contain duplicate trait ids.",
				details: { traitIds: selectedIds },
			});
		}

		const found = await this.repository.findTraitsByIds(selectedIds);
		if (!found.success) {
			return fail(found.error);
		}

		const validatedTraits = validateTraitRecords(found.data);
		if (!validatedTraits.success) {
			return validatedTraits;
		}

		const foundIds = new Set(validatedTraits.data.map((trait) => trait.id));
		const missingTraitIds = selectedIds.filter(
			(traitId) => !foundIds.has(traitId),
		);
		if (missingTraitIds.length > 0) {
			return fail({
				code: "ANCESTRY_TRAIT_NOT_FOUND",
				message: "One or more selected ancestry traits were not found.",
				details: { traitIds: missingTraitIds },
			});
		}

		const linked = await this.repository.listLinksByAncestry(
			parsedInput.data.ancestryId,
		);
		if (!linked.success) {
			return fail(linked.error);
		}

		const allowedTraitIds = new Set<AncestryTraitId>();
		for (const link of linked.data) {
			const parsedLink = ancestryTraitLinkSelectSchema.safeParse(link);
			if (!parsedLink.success) {
				return fail({
					code: "CORRUPTED_ANCESTRY_TRAIT_LINK",
					message: "Ancestry trait link failed output validation.",
					details: { issues: formatIssues(parsedLink.error.issues) },
				});
			}

			allowedTraitIds.add(parsedLink.data.traitId);
		}

		const mismatchedTraitIds = selectedIds.filter(
			(traitId) => !allowedTraitIds.has(traitId),
		);
		if (mismatchedTraitIds.length > 0) {
			return fail({
				code: "ANCESTRY_TRAIT_ANCESTRY_MISMATCH",
				message:
					"One or more selected traits do not belong to the selected ancestry.",
				details: {
					ancestryId: parsedInput.data.ancestryId,
					traitIds: mismatchedTraitIds,
				},
			});
		}

		const traitsById = new Map(
			validatedTraits.data.map((trait) => [trait.id, trait]),
		);
		const orderedTraits = selectedIds.map(
			(traitId) => traitsById.get(traitId) as AncestryTraitRecord,
		);

		return ok({
			ancestryId: parsedInput.data.ancestryId,
			traitIds: selectedIds,
			traits: orderedTraits,
		});
	}
}

function validateTraitRecords(
	records: readonly AncestryTraitRecord[],
): Result<readonly AncestryTraitRecord[], AncestryTraitFailure> {
	const validated: AncestryTraitRecord[] = [];
	for (const record of records) {
		const parsed = ancestryTraitSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_ANCESTRY_TRAIT_RECORD",
				message: "Ancestry trait record failed output validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
