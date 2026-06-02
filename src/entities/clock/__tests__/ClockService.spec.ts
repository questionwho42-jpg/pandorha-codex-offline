import { describe, expect, it } from "vitest";
import { ok, type Result } from "$lib/shared/lib/result";
import type { ClockRepository } from "../domain/ClockRepository";
import { ClockService } from "../domain/ClockService";
import type { ClockRecord } from "../model/clockSchema";
import type { ClockFailure, ClockRepositoryFailure } from "../model/clockTypes";
import { InMemoryClockRepository } from "../testing/InMemoryClockRepository";

const TEST_TIMESTAMP = "2026-05-15T21:00:00.000Z";

describe("ClockService", () => {
	it("creates an active clock at zero slices", async () => {
		const service = createService();

		const clock = expectClockSuccess(
			await service.createClock({
				id: "fortify-perimeter",
				label: "Fortificar perímetro",
				maxSlices: 4,
				source: "camp",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			}),
		);

		expect(clock).toEqual({
			id: "fortify-perimeter",
			label: "Fortificar perímetro",
			currentSlices: 0,
			maxSlices: 4,
			status: "active",
			source: "camp",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
	});

	it("advances an active clock and marks it completed at the exact limit", async () => {
		const service = createService([buildClock()]);

		const advanced = expectClockSuccess(
			await service.advanceClock({
				clockId: "fortify-perimeter",
				slices: 1,
				updatedAt: TEST_TIMESTAMP,
			}),
		);
		const completed = expectClockSuccess(
			await service.advanceClock({
				clockId: "fortify-perimeter",
				slices: 3,
				updatedAt: TEST_TIMESTAMP,
			}),
		);

		expect(advanced).toMatchObject({
			currentSlices: 1,
			status: "active",
		});
		expect(completed).toMatchObject({
			currentSlices: 4,
			status: "completed",
		});
	});

	it("prevents overflow and keeps the previous clock state unchanged", async () => {
		const repository = createRepository([buildClock({ currentSlices: 3 })]);
		const service = new ClockService(repository);

		const failure = expectClockFailure(
			await service.advanceClock({
				clockId: "fortify-perimeter",
				slices: 2,
				updatedAt: TEST_TIMESTAMP,
			}),
		);
		const stored = expectClockSuccess(
			await service.findClockById("fortify-perimeter"),
		);

		expect(failure.code).toBe("CLOCK_SLICE_OVERFLOW");
		expect(stored.currentSlices).toBe(3);
	});

	it("rejects invalid inputs before calling the repository", async () => {
		const repository = createRepository();
		const service = new ClockService(repository);

		expectClockFailure(
			await service.createClock({
				id: "",
				label: "",
				maxSlices: 0,
				source: "",
				createdAt: "invalid",
				updatedAt: "invalid",
			}),
		);
		expectClockFailure(
			await service.advanceClock({
				clockId: "",
				slices: 0,
				updatedAt: "invalid",
			}),
		);
		expectClockFailure(await service.findClockById(""));

		expect(repository.writeCount).toBe(0);
		expect(repository.lookupCount).toBe(0);
	});

	it("returns typed failures for missing clocks and repository failures", async () => {
		const repository = createRepository();
		repository.failNextLookup({
			code: "CLOCK_REPOSITORY_LOOKUP_FAILED",
			message: "Injected lookup failure.",
		});
		const service = new ClockService(repository);

		expect(
			expectClockFailure(await service.findClockById("missing-clock")).code,
		).toBe("CLOCK_REPOSITORY_LOOKUP_FAILED");
		expect(
			expectClockFailure(await service.findClockById("missing-clock")).code,
		).toBe("CLOCK_NOT_FOUND");

		repository.failNextWrite({
			code: "CLOCK_REPOSITORY_WRITE_FAILED",
			message: "Injected write failure.",
		});
		expect(
			expectClockFailure(
				await service.createClock({
					id: "camp-progress",
					label: "Progresso do acampamento",
					maxSlices: 3,
					source: "camp",
					createdAt: TEST_TIMESTAMP,
					updatedAt: TEST_TIMESTAMP,
				}),
			).code,
		).toBe("CLOCK_REPOSITORY_WRITE_FAILED");
	});

	it("returns typed failures when advancing cannot read or write the clock", async () => {
		const repository = createRepository([buildClock()]);
		const service = new ClockService(repository);

		repository.failNextLookup({
			code: "CLOCK_REPOSITORY_LOOKUP_FAILED",
			message: "Injected lookup failure.",
		});
		expect(
			expectClockFailure(
				await service.advanceClock({
					clockId: "fortify-perimeter",
					slices: 1,
					updatedAt: TEST_TIMESTAMP,
				}),
			).code,
		).toBe("CLOCK_REPOSITORY_LOOKUP_FAILED");

		repository.failNextWrite({
			code: "CLOCK_REPOSITORY_WRITE_FAILED",
			message: "Injected write failure.",
		});
		expect(
			expectClockFailure(
				await service.advanceClock({
					clockId: "fortify-perimeter",
					slices: 1,
					updatedAt: TEST_TIMESTAMP,
				}),
			).code,
		).toBe("CLOCK_REPOSITORY_WRITE_FAILED");
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new ClockService(new CorruptClockRepository());

		expect(
			expectClockFailure(await service.findClockById("fortify-perimeter")).code,
		).toBe("CORRUPTED_CLOCK_RECORD");
	});
});

function createService(records: readonly ClockRecord[] = []): ClockService {
	return new ClockService(createRepository(records));
}

function createRepository(
	records: readonly ClockRecord[] = [],
): InMemoryClockRepository {
	return new InMemoryClockRepository({ records });
}

function buildClock(overrides: Partial<ClockRecord> = {}): ClockRecord {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		currentSlices: 0,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...overrides,
	};
}

function expectClockSuccess<Success>(
	result: Result<Success, ClockFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectClockFailure<Success>(
	result: Result<Success, ClockFailure>,
): ClockFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptClockRepository implements ClockRepository {
	public async save(): Promise<Result<ClockRecord, ClockRepositoryFailure>> {
		return ok(buildClock());
	}

	public async findById(): Promise<
		Result<ClockRecord, ClockRepositoryFailure>
	> {
		return ok({
			...buildClock(),
			currentSlices: 5,
		});
	}
}
