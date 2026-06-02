import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { WorldStateRepository } from "../domain/WorldStateRepository";
import { WorldStateService } from "../domain/WorldStateService";
import type { WorldStateEntryRecord } from "../model/worldStateSchema";
import type {
	WorldStateFailure,
	WorldStateFlagView,
	WorldStateRepositoryFailure,
} from "../model/worldStateTypes";
import { InMemoryWorldStateRepository } from "../testing/InMemoryWorldStateRepository";

const TEST_TIMESTAMP = "2026-05-14T09:00:00.000Z";

describe("WorldStateService", () => {
	it("sets and reads a narrative flag in a writable namespace", async () => {
		const service = createService();

		const saved = expectWorldStateSuccess(
			await service.setNarrativeFlag({
				key: "location:morden:gate-open",
				value: { open: true, source: "lever" },
				updatedAt: TEST_TIMESTAMP,
			}),
		);
		const found = expectWorldStateSuccess(
			await service.getFlag("location:morden:gate-open"),
		);

		expect(saved).toEqual({
			key: "location:morden:gate-open",
			value: { open: true, source: "lever" },
			updatedAt: TEST_TIMESTAMP,
		});
		expect(found).toEqual(saved);
	});

	it("lists flags by a validated prefix", async () => {
		const service = new WorldStateService(
			new InMemoryWorldStateRepository({
				records: [
					buildRecord("location:morden:gate-open", true),
					buildRecord("location:morden:alarm-raised", false),
					buildRecord("npc:vanya:status", "neutral"),
				],
			}),
		);

		const flags = expectWorldStateSuccess(
			await service.listFlagsByPrefix("location:morden:"),
		);

		expect(flags.map((flag) => flag.key)).toEqual([
			"location:morden:gate-open",
			"location:morden:alarm-raised",
		]);
	});

	it("allows reading system and engine flags while blocking narrative writes", async () => {
		const repository = new InMemoryWorldStateRepository({
			records: [
				buildRecord("system:database:version", 1),
				buildRecord("engine:worker:ready", true),
			],
		});
		const service = new WorldStateService(repository);

		expectWorldStateSuccess(await service.getFlag("system:database:version"));
		expectWorldStateSuccess(await service.getFlag("engine:worker:ready"));
		const systemWrite = expectWorldStateFailure(
			await service.setNarrativeFlag({
				key: "system:database:version",
				value: 2,
				updatedAt: TEST_TIMESTAMP,
			}),
		);
		const engineWrite = expectWorldStateFailure(
			await service.setNarrativeFlag({
				key: "engine:worker:ready",
				value: false,
				updatedAt: TEST_TIMESTAMP,
			}),
		);

		expect(systemWrite.code).toBe("WORLD_STATE_NAMESPACE_READ_ONLY");
		expect(engineWrite.code).toBe("WORLD_STATE_NAMESPACE_READ_ONLY");
		expect(repository.writeCount).toBe(0);
	});

	it("rejects invalid inputs before asking the repository", async () => {
		const repository = createRepository();
		const service = new WorldStateService(repository);

		expectWorldStateFailure(
			await service.setNarrativeFlag({
				key: "portao_aberto",
				value: true,
				updatedAt: TEST_TIMESTAMP,
			}),
		);
		expectWorldStateFailure(await service.getFlag("location:"));
		expectWorldStateFailure(await service.listFlagsByPrefix("morden"));

		expect(repository.writeCount).toBe(0);
		expect(repository.lookupCount).toBe(0);
		expect(repository.listCount).toBe(0);
	});

	it("returns not found for missing flags", async () => {
		const service = createService();

		const failure = expectWorldStateFailure(
			await service.getFlag("location:morden:missing-flag"),
		);

		expect(failure).toMatchObject({
			code: "WORLD_STATE_FLAG_NOT_FOUND",
			details: { key: "location:morden:missing-flag" },
		});
	});

	it("maps repository failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextWrite({
			code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
			message: "Injected world state write failure.",
			details: { cause: "locked-world-state" },
		});
		repository.failNextLookup({
			code: "WORLD_STATE_REPOSITORY_LOOKUP_FAILED",
			message: "Injected world state lookup failure.",
			details: { cause: "lookup-timeout" },
		});
		repository.failNextList({
			code: "WORLD_STATE_REPOSITORY_READ_FAILED",
			message: "Injected world state list failure.",
			details: { cause: "list-timeout" },
		});
		const service = new WorldStateService(repository);

		expect(
			expectWorldStateFailure(
				await service.setNarrativeFlag({
					key: "plot:act-1:intro-seen",
					value: true,
					updatedAt: TEST_TIMESTAMP,
				}),
			),
		).toMatchObject({
			code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
			details: { cause: "locked-world-state" },
		});
		expect(
			expectWorldStateFailure(await service.getFlag("plot:act-1:intro-seen")),
		).toMatchObject({
			code: "WORLD_STATE_REPOSITORY_LOOKUP_FAILED",
			details: { cause: "lookup-timeout" },
		});
		expect(
			expectWorldStateFailure(await service.listFlagsByPrefix("plot:")),
		).toMatchObject({
			code: "WORLD_STATE_REPOSITORY_READ_FAILED",
			details: { cause: "list-timeout" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new WorldStateService(new CorruptWorldStateRepository());

		expect(
			expectWorldStateFailure(await service.getFlag("location:morden:gate"))
				.code,
		).toBe("CORRUPTED_WORLD_STATE_RECORD");
		expect(
			expectWorldStateFailure(await service.listFlagsByPrefix("location:"))
				.code,
		).toBe("CORRUPTED_WORLD_STATE_RECORD");
	});
});

function createRepository(): InMemoryWorldStateRepository {
	return new InMemoryWorldStateRepository();
}

function createService(): WorldStateService {
	return new WorldStateService(createRepository());
}

function buildRecord(key: string, value: unknown): WorldStateEntryRecord {
	return {
		key,
		valueJson: JSON.stringify(value),
		updatedAt: TEST_TIMESTAMP,
	} as WorldStateEntryRecord;
}

function expectWorldStateSuccess(
	result: Result<WorldStateFlagView, WorldStateFailure>,
): WorldStateFlagView;
function expectWorldStateSuccess(
	result: Result<readonly WorldStateFlagView[], WorldStateFailure>,
): readonly WorldStateFlagView[];
function expectWorldStateSuccess<Success>(
	result: Result<Success, WorldStateFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectWorldStateFailure<Success>(
	result: Result<Success, WorldStateFailure>,
): WorldStateFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptWorldStateRepository implements WorldStateRepository {
	public async setFlag(): Promise<
		Result<WorldStateEntryRecord, WorldStateRepositoryFailure>
	> {
		return ok(buildRecord("location:morden:gate", true));
	}

	public async getFlag(): Promise<
		Result<WorldStateEntryRecord, WorldStateRepositoryFailure>
	> {
		return ok({
			key: "location:morden:gate",
			valueJson: "{",
			updatedAt: TEST_TIMESTAMP,
		});
	}

	public async listFlagsByPrefix(): Promise<
		Result<readonly WorldStateEntryRecord[], WorldStateRepositoryFailure>
	> {
		return ok([
			{
				key: "location:morden:gate",
				valueJson: JSON.stringify(undefined),
				updatedAt: TEST_TIMESTAMP,
			} as WorldStateEntryRecord,
		]);
	}
}
