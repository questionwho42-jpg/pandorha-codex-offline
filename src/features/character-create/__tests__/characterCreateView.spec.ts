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

	it("translates every failure code to actionable pt-BR copy", () => {
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_AXIS_DISTRIBUTION", { received: 8 }),
			),
		).toBe(
			"Os Eixos somam 8. Ajuste Físico, Mental e Social para somarem exatamente 6.",
		);
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_APPLICATION_DISTRIBUTION", { received: 5 }),
			),
		).toBe(
			"As Aplicações somam 5. Ajuste Conflito, Interação e Resistência para somarem exatamente 6.",
		);
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_TIER_CAP", {
					cap: 3,
					field: "physical",
					received: 4,
				}),
			),
		).toBe("Físico está em 4, mas o limite para o nível atual é 3.");
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_CHARACTER_INPUT")),
		).toBe(
			"Preencha nome, conceito e todos os campos numéricos antes de criar o personagem.",
		);
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_CHARACTER_RECORD")),
		).toBe(
			"O personagem foi montado com dados inválidos. Revise o formulário e tente novamente.",
		);
		expect(
			mapCharacterCreateFailure(characterFailure("REPOSITORY_WRITE_FAILED")),
		).toBe(
			"Não foi possível salvar o personagem nesta sessão. Tente criar novamente.",
		);
	});
});

function characterFailure(
	code: CharacterFailure["code"],
	details: CharacterFailure["details"] = {},
): CharacterFailure {
	return {
		code,
		details,
		message: "technical failure",
	};
}
