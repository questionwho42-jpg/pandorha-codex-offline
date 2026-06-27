import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CompendiumEntry,
	compendiumCategorySchema,
	compendiumEntrySelectSchema,
} from "../model/compendiumSchema";
import type { CompendiumFailure } from "../model/compendiumTypes";
import type { CompendiumRepository } from "./CompendiumRepository";

export const compendiumSearchInputSchema = z
	.object({
		category: z
			.union([compendiumCategorySchema, z.literal("all")])
			.optional()
			.default("all"),
		limit: z.number().int().min(1).max(200).optional().default(20),
		query: z.string().max(120).optional().default(""),
	})
	.strict();

export type CompendiumSearchInput = z.infer<typeof compendiumSearchInputSchema>;

/**
 * @description Searches the curated compendium catalog without loading raw Markdown in the browser.
 * @rule docs/architecture/sdd.md - compendium descriptions are dynamic searchable content, but T17A keeps them read-only and in memory
 */
export class CompendiumSearchService {
	public constructor(private readonly repository: CompendiumRepository) {}

	public async searchEntries(
		input: unknown,
	): Promise<Result<readonly CompendiumEntry[], CompendiumFailure>> {
		const parsedInput = compendiumSearchInputSchema.safeParse(input ?? {});
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_COMPENDIUM_SEARCH_INPUT",
				message: "Compendium search input failed validation.",
				details: { issues: formatIssues(parsedInput.error.issues) },
			});
		}

		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: CompendiumEntry[] = [];
		for (const record of listed.data) {
			const parsedRecord = compendiumEntrySelectSchema.safeParse(record);
			if (!parsedRecord.success) {
				return fail({
					code: "CORRUPTED_COMPENDIUM_ENTRY",
					message: "Compendium entry failed output validation.",
					details: { issues: formatIssues(parsedRecord.error.issues) },
				});
			}

			validated.push(parsedRecord.data);
		}

		const query = normalizeSearchText(parsedInput.data.query);
		const category = parsedInput.data.category;
		const categoryEntries =
			category === "all"
				? validated
				: validated.filter((entry) => entry.category === category);
		const matchingEntries =
			query.length === 0
				? categoryEntries
				: rankMatchingEntries(categoryEntries, query);

		return ok(matchingEntries.slice(0, parsedInput.data.limit));
	}
}

function rankMatchingEntries(
	entries: readonly CompendiumEntry[],
	query: string,
): readonly CompendiumEntry[] {
	const terms = splitSearchTerms(query);

	return [...entries]
		.filter((entry) => entryMatchesQuery(entry, terms))
		.sort((left, right) => {
			const rankDifference =
				rankEntry(left, query, terms) - rankEntry(right, query, terms);
			if (rankDifference !== 0) {
				return rankDifference;
			}

			const titleDifference = left.title.localeCompare(right.title, "pt-BR");
			if (titleDifference !== 0) {
				return titleDifference;
			}

			const sourceDifference = left.sourceFile.localeCompare(
				right.sourceFile,
				"pt-BR",
			);
			if (sourceDifference !== 0) {
				return sourceDifference;
			}

			return left.id.localeCompare(right.id, "pt-BR");
		});
}

function entryMatchesQuery(
	entry: CompendiumEntry,
	terms: readonly string[],
): boolean {
	const searchableText = normalizeSearchText(
		[
			entry.title,
			entry.summary,
			entry.searchText,
			entry.sourceFile,
			...entry.tags,
		].join(" "),
	);

	return terms.every((term) => searchableText.includes(term));
}

function rankEntry(
	entry: CompendiumEntry,
	query: string,
	terms: readonly string[],
): number {
	const normalizedTitle = normalizeSearchText(entry.title);
	if (normalizedTitle === query) {
		return 0;
	}

	if (normalizedTitle.startsWith(query)) {
		return 1;
	}

	if (terms.every((term) => normalizedTitle.includes(term))) {
		return 2;
	}

	const normalizedTagsAndCategory = normalizeSearchText(
		[entry.category, ...entry.tags].join(" "),
	);
	if (terms.every((term) => normalizedTagsAndCategory.includes(term))) {
		return 3;
	}

	return 4;
}

function splitSearchTerms(query: string): readonly string[] {
	return query.split(" ").filter(Boolean);
}

function normalizeSearchText(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase("pt-BR")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
