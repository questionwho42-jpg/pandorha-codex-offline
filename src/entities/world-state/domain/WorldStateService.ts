import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type WorldStateEntryRecord,
	type WorldStateKey,
	worldStateEntrySelectSchema,
	worldStateKeySchema,
	worldStateListPrefixSchema,
	worldStateSetInputSchema,
	worldStateWritablePrefixSchema,
} from "../model/worldStateSchema";
import type {
	WorldStateFailure,
	WorldStateFlagView,
	WorldStateKeyPrefix,
	WorldStateValue,
} from "../model/worldStateTypes";
import type { WorldStateRepository } from "./WorldStateRepository";

/**
 * @description Stores narrative world flags as validated key-value entries. It does not talk to SQLite, OPFS, Worker RPC, clocks, or save slots directly.
 * @rule docs/architecture/blueprint.md - World State is a key-value persistence table.
 * @rule .agents/skills/world-state-manager/SKILL.md - system and engine namespaces are read-only for narrative writes.
 */
export class WorldStateService {
	public constructor(private readonly repository: WorldStateRepository) {}

	public async setNarrativeFlag(
		input: unknown,
	): Promise<Result<WorldStateFlagView, WorldStateFailure>> {
		const parsedInput = worldStateSetInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return invalidInputFailure(parsedInput.error.issues);
		}

		const namespace = extractKeyPrefix(parsedInput.data.key);
		const writableNamespace =
			worldStateWritablePrefixSchema.safeParse(namespace);
		if (!writableNamespace.success) {
			return fail({
				code: "WORLD_STATE_NAMESPACE_READ_ONLY",
				message:
					"World state namespace is read-only for narrative flag writes.",
				details: { key: parsedInput.data.key, namespace },
			});
		}

		const saved = await this.repository.setFlag({
			key: parsedInput.data.key,
			valueJson: JSON.stringify(parsedInput.data.value),
			updatedAt: parsedInput.data.updatedAt,
		});
		if (!saved.success) {
			return fail(saved.error);
		}

		return validateAndHydrateRecord(saved.data);
	}

	public async getFlag(
		key: unknown,
	): Promise<Result<WorldStateFlagView, WorldStateFailure>> {
		const parsedKey = worldStateKeySchema.safeParse(key);
		if (!parsedKey.success) {
			return invalidInputFailure(parsedKey.error.issues);
		}

		const found = await this.repository.getFlag(parsedKey.data);
		if (!found.success) {
			return fail(found.error);
		}

		return validateAndHydrateRecord(found.data);
	}

	public async listFlagsByPrefix(
		prefix: unknown,
	): Promise<Result<readonly WorldStateFlagView[], WorldStateFailure>> {
		const parsedPrefix = worldStateListPrefixSchema.safeParse(prefix);
		if (!parsedPrefix.success) {
			return invalidInputFailure(parsedPrefix.error.issues);
		}

		const listed = await this.repository.listFlagsByPrefix(parsedPrefix.data);
		if (!listed.success) {
			return fail(listed.error);
		}

		const views: WorldStateFlagView[] = [];
		for (const record of listed.data) {
			const view = validateAndHydrateRecord(record);
			if (!view.success) {
				return fail(view.error);
			}

			views.push(view.data);
		}

		return ok(views);
	}
}

function validateAndHydrateRecord(
	record: WorldStateEntryRecord,
): Result<WorldStateFlagView, WorldStateFailure> {
	const parsedRecord = worldStateEntrySelectSchema.safeParse(record);
	if (!parsedRecord.success) {
		return fail({
			code: "CORRUPTED_WORLD_STATE_RECORD",
			message: "World state record failed output validation.",
			details: { issues: formatIssues(parsedRecord.error.issues) },
		});
	}

	return ok({
		key: parsedRecord.data.key,
		value: JSON.parse(parsedRecord.data.valueJson) as WorldStateValue,
		updatedAt: parsedRecord.data.updatedAt,
	});
}

function extractKeyPrefix(key: WorldStateKey): WorldStateKeyPrefix {
	const [prefix] = key.split(":");
	return prefix as WorldStateKeyPrefix;
}

function invalidInputFailure(
	issues: readonly ZodIssue[],
): Result<never, WorldStateFailure> {
	return fail({
		code: "INVALID_WORLD_STATE_INPUT",
		message: "World state input does not match the expected contract.",
		details: { issues: formatIssues(issues) },
	});
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
