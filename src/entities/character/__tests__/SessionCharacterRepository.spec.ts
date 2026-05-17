import { describe, expect, it } from "vitest";
import { SessionCharacterRepository } from "../infrastructure/SessionCharacterRepository";
import type { CharacterRecord } from "../model/characterSchema";

const record: CharacterRecord = {
	id: "session-character-1",
	name: "Kael de Almar",
	concept: "Vanguarda protetor da caravana",
	ancestryId: "human",
	classId: "vanguarda",
	backgroundId: "abrigo-da-fe",
	level: 1,
	physical: 3,
	mental: 1,
	social: 2,
	conflict: 2,
	interaction: 1,
	resistance: 3,
	createdAt: "2026-05-03T13:57:34.000Z",
	updatedAt: "2026-05-03T13:57:34.000Z",
};

describe("SessionCharacterRepository", () => {
	it("saves and lists records for the current browser session", async () => {
		const repository = new SessionCharacterRepository();

		const result = await repository.save(record);

		expect(result).toEqual({ success: true, data: record });
		expect(repository.all()).toEqual([record]);
	});

	it("finds a saved record by id", async () => {
		const repository = new SessionCharacterRepository();
		await repository.save(record);

		const result = await repository.findById("session-character-1");

		expect(result).toEqual({ success: true, data: record });
	});

	it("returns a typed failure when the record is missing", async () => {
		const repository = new SessionCharacterRepository();

		const result = await repository.findById("missing-character");

		expect(result).toEqual({
			success: false,
			error: {
				code: "CHARACTER_NOT_FOUND",
				message: "Character record was not found in session memory.",
				details: { id: "missing-character" },
			},
		});
	});

	it("saves, finds, and deletes status effects in session memory", async () => {
		const repository = new SessionCharacterRepository();
		const effectInput = {
			characterId: "session-character-1",
			type: "eter_fever",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
		};

		const saveResult = await repository.saveStatusEffect(effectInput);
		expect(saveResult.success).toBe(true);
		expect(saveResult.data?.id).toBeDefined();
		expect(saveResult.data?.type).toBe("eter_fever");

		const effectId = saveResult.data?.id;

		const findResult = await repository.findStatusEffectsByCharacterId(
			"session-character-1",
		);
		expect(findResult.success).toBe(true);
		expect(findResult.data?.length).toBe(1);
		expect(findResult.data?.[0].id).toBe(effectId);

		const deleteResult = await repository.deleteStatusEffect(effectId);
		expect(deleteResult.success).toBe(true);

		const findAfterDelete = await repository.findStatusEffectsByCharacterId(
			"session-character-1",
		);
		expect(findAfterDelete.success).toBe(true);
		expect(findAfterDelete.data?.length).toBe(0);
	});
});
