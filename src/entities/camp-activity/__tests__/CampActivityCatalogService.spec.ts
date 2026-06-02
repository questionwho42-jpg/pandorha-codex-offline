import { describe, expect, it } from "vitest";
import { ok, type Result } from "$lib/shared/lib/result";
import { CampActivityCatalogService } from "../domain/CampActivityCatalogService";
import type { CampActivityRepository } from "../domain/CampActivityRepository";
import { CAMP_ACTIVITY_CATALOG } from "../model/campActivityCatalog";
import {
	type CampActivityRecord,
	campActivitySelectSchema,
} from "../model/campActivitySchema";
import type {
	CampActivityFailure,
	CampActivityRepositoryFailure,
} from "../model/campActivityTypes";
import { InMemoryCampActivityRepository } from "../testing/InMemoryCampActivityRepository";

describe("Official camp activity catalog", () => {
	it("contains the four initial camp activities with English technical ids", () => {
		expect(CAMP_ACTIVITY_CATALOG).toHaveLength(4);
		expect(CAMP_ACTIVITY_CATALOG.map((activity) => activity.id)).toEqual([
			"watch",
			"repair-equipment",
			"cook-meal",
			"fortify-perimeter",
		]);

		for (const activity of CAMP_ACTIVITY_CATALOG) {
			expect(activity.id).toMatch(/^[a-z][a-z0-9-]*$/);
			expect(campActivitySelectSchema.safeParse(activity).success).toBe(true);
		}
	});
});

describe("CampActivityCatalogService", () => {
	it("lists validated activities from the repository", async () => {
		const activities = expectCampActivitySuccess(
			await createService().listActivities(),
		);

		expect(activities).toHaveLength(4);
		expect(activities[0]).toMatchObject({
			id: "watch",
			label: "Vigília",
			isCollective: false,
		});
	});

	it("finds fortify perimeter by English technical id", async () => {
		const activity = expectCampActivitySuccess(
			await createService().findActivityById("fortify-perimeter"),
		);

		expect(activity).toMatchObject({
			id: "fortify-perimeter",
			label: "Fortificar perímetro",
			isCollective: true,
			createsClock: true,
		});
	});

	it("rejects invalid ids before repository lookup", async () => {
		const repository = createRepository();
		const service = new CampActivityCatalogService(repository);

		const failure = expectCampActivityFailure(
			await service.findActivityById("Vigilia"),
		);

		expect(failure.code).toBe("INVALID_CAMP_ACTIVITY_ID");
		expect(repository.lookupCount).toBe(0);
	});

	it("returns typed failures for not found and repository read failures", async () => {
		const repository = createRepository();
		repository.failNextList({
			code: "CAMP_ACTIVITY_REPOSITORY_READ_FAILED",
			message: "Injected list failure.",
		});
		const service = new CampActivityCatalogService(repository);

		expect(expectCampActivityFailure(await service.listActivities()).code).toBe(
			"CAMP_ACTIVITY_REPOSITORY_READ_FAILED",
		);
		expect(
			expectCampActivityFailure(
				await service.findActivityById("missing-activity"),
			).code,
		).toBe("CAMP_ACTIVITY_NOT_FOUND");
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new CampActivityCatalogService(
			new CorruptCampActivityRepository(),
		);

		expect(expectCampActivityFailure(await service.listActivities()).code).toBe(
			"CORRUPTED_CAMP_ACTIVITY_RECORD",
		);
		expect(
			expectCampActivityFailure(await service.findActivityById("watch")).code,
		).toBe("CORRUPTED_CAMP_ACTIVITY_RECORD");
	});
});

function createService(): CampActivityCatalogService {
	return new CampActivityCatalogService(createRepository());
}

function createRepository(): InMemoryCampActivityRepository {
	return new InMemoryCampActivityRepository(CAMP_ACTIVITY_CATALOG);
}

function expectCampActivitySuccess<Success>(
	result: Result<Success, CampActivityFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCampActivityFailure<Success>(
	result: Result<Success, CampActivityFailure>,
): CampActivityFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptCampActivityRepository implements CampActivityRepository {
	public async list(): Promise<
		Result<readonly CampActivityRecord[], CampActivityRepositoryFailure>
	> {
		return ok([
			{
				...CAMP_ACTIVITY_CATALOG[0],
				label: "",
			} as CampActivityRecord,
		]);
	}

	public async findById(): Promise<
		Result<CampActivityRecord, CampActivityRepositoryFailure>
	> {
		return ok({
			...CAMP_ACTIVITY_CATALOG[0],
			summary: "",
		} as CampActivityRecord);
	}
}
