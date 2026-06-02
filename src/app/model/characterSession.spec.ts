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
});
