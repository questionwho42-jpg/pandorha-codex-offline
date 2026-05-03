import { describe, expect, it } from "vitest";
import type { CharacterFailure } from "$lib/entities/character";
import {
	createDefaultCharacterCreateDraft,
	mapCharacterCreateFailure,
	toCharacterCreateInput,
} from "../model/characterCreateView";

describe("character create view model", () => {
	it("creates a default draft that respects the 6/6 distribution", () => {
		const draft = createDefaultCharacterCreateDraft();

		expect(draft).toMatchObject({
			name: "",
			concept: "",
			ancestryId: "human",
			classId: "vanguarda",
			backgroundId: "abrigo-da-fe",
			level: 1,
		});
		expect(draft.physical + draft.mental + draft.social).toBe(6);
		expect(draft.conflict + draft.interaction + draft.resistance).toBe(6);
	});

	it("maps a draft to the Character service input contract", () => {
		const input = toCharacterCreateInput({
			...createDefaultCharacterCreateDraft(),
			name: "Kael de Almar",
			concept: "Vanguarda protetor da caravana",
			physical: 3,
			mental: 1,
			social: 2,
			conflict: 2,
			interaction: 1,
			resistance: 3,
		});

		expect(input).toEqual({
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
		});
	});

	it("translates rule failures to pt-BR copy", () => {
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_AXIS_DISTRIBUTION")),
		).toBe("A soma de Físico, Mental e Social deve ser exatamente 6.");
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_APPLICATION_DISTRIBUTION"),
			),
		).toBe(
			"A soma de Conflito, Interação e Resistência deve ser exatamente 6.",
		);
	});
});

function characterFailure(code: CharacterFailure["code"]): CharacterFailure {
	return {
		code,
		message: "technical failure",
	};
}
