import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import { createCharacterSession } from "./characterSession";

describe("createCharacterSession", () => {
	it("restores session records and advances the next generated id", async () => {
		const session = createCharacterSession();
		const restoredRecord = {
			...CharacterBuilder.valid().buildCreateInput(),
			id: "session-character-3",
			createdAt: "2026-05-15T20:22:00.000Z",
			updatedAt: "2026-05-15T20:22:00.000Z",
		};

		const restored = session.restoreRecords([restoredRecord]);
		const created = await session.service.createCharacter(
			CharacterBuilder.valid().withName("Lia").buildCreateInput(),
		);

		expect(restored).toEqual({ success: true, data: [restoredRecord] });
		expect(created).toMatchObject({
			success: true,
			data: { id: "session-character-4", name: "Lia" },
		});
	});

	it("persists exactly three validated ancestry trait selections", async () => {
		const session = createCharacterSession();
		const character = expectCharacterSuccess(
			await session.service.createCharacter(
				CharacterBuilder.valid().buildCreateInput(),
			),
		);

		const selected = await session.createTraitSelections({
			characterId: character.id,
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});

		expect(selected).toEqual({
			success: true,
			data: [
				{
					id: "session-character-trait-selection-1",
					characterId: character.id,
					sequence: 1,
					traitId: "human-diligencia-erudita",
					createdAt: expect.any(String),
				},
				{
					id: "session-character-trait-selection-2",
					characterId: character.id,
					sequence: 2,
					traitId: "human-lingua-de-prata",
					createdAt: expect.any(String),
				},
				{
					id: "session-character-trait-selection-3",
					characterId: character.id,
					sequence: 3,
					traitId: "human-vontade-indomavel",
					createdAt: expect.any(String),
				},
			],
		});
		expect(session.traitSelectionRepository.all()).toHaveLength(3);
	});

	it("rejects duplicate and mismatched ancestry trait selections before persistence", async () => {
		const session = createCharacterSession();
		const duplicate = await session.createTraitSelections({
			characterId: "session-character-1",
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-diligencia-erudita",
				"human-vontade-indomavel",
			],
		});
		const mismatched = await session.createTraitSelections({
			characterId: "session-character-1",
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"elf-visao-estelar",
				"human-vontade-indomavel",
			],
		});

		expect(duplicate).toMatchObject({
			success: false,
			error: { code: "DUPLICATE_ANCESTRY_TRAIT_SELECTION" },
		});
		expect(mismatched).toMatchObject({
			success: false,
			error: { code: "ANCESTRY_TRAIT_ANCESTRY_MISMATCH" },
		});
		expect(session.traitSelectionRepository.all()).toEqual([]);
	});

	it("restores trait selections and advances generated selection ids", async () => {
		const session = createCharacterSession();
		const restored = session.restoreTraitSelections([
			{
				id: "session-character-trait-selection-7",
				characterId: "session-character-3",
				sequence: 1,
				traitId: "human-diligencia-erudita",
				createdAt: "2026-05-15T20:22:00.000Z",
			},
		]);
		const created = await session.createTraitSelections({
			characterId: "session-character-4",
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});

		expect(restored).toMatchObject({ success: true });
		expect(created).toMatchObject({
			success: true,
			data: [
				{ id: "session-character-trait-selection-8" },
				{ id: "session-character-trait-selection-9" },
				{ id: "session-character-trait-selection-10" },
			],
		});
	});
});

function expectCharacterSuccess(
	result: Awaited<
		ReturnType<
			ReturnType<typeof createCharacterSession>["service"]["createCharacter"]
		>
	>,
) {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected character success, received ${result.error.code}`);
}
