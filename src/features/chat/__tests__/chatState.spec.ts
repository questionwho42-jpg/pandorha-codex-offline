import { beforeEach, describe, expect, it } from "vitest";

// Define Svelte 5 runes globals before importing the state to bypass compile-time macro issues in pure Node.js test environment
// @ts-expect-error global mock
globalThis.$state = <T>(val: T) => val;
// @ts-expect-error global mock
globalThis.$derived = <T>(fn: () => T) => {
	try {
		return fn();
	} catch {
		// biome-ignore lint/suspicious/noExplicitAny: mock return
		return undefined as any;
	}
};
// @ts-expect-error global mock
globalThis.$effect = (_fn: () => void) => {};

// Import chatState after Svelte 5 runes globals are defined
const { chatState } = await import("../model/chatState.svelte");

describe("ChatState Roll Modifiers and Status Integration", () => {
	beforeEach(() => {
		// Reset state before each test
		chatState.setActiveCharacter(null);
		chatState.clearMessages();
		chatState.rollType = "Normal";
		chatState.customBonus = 0;
	});

	it("should allow setting and clearing active character", () => {
		const mockCharacter = {
			id: "char-123",
			name: "Eldrin",
			statusEffects: [
				{
					id: "fx-1",
					type: "eter_fever",
					label: "Febre do Éter",
					severity: 1,
					isAggravated: false,
				},
			],
			axes: [{ label: "Físico", value: 2 }],
			applications: [{ label: "Conflito", value: 3 }],
		};

		chatState.setActiveCharacter(mockCharacter);

		expect(chatState.activeCharacterId).toBe("char-123");
		expect(chatState.activeCharacterName).toBe("Eldrin");
		expect(chatState.activeStatusEffects.length).toBe(1);
		expect(chatState.activeStatusEffects[0]?.type).toBe("eter_fever");
		expect(chatState.activeAxes).toEqual([{ label: "Físico", value: 2 }]);
		expect(chatState.activeApplications).toEqual([
			{ label: "Conflito", value: 3 },
		]);

		chatState.setActiveCharacter(null);
		expect(chatState.activeCharacterId).toBeNull();
		expect(chatState.activeCharacterName).toBeNull();
		expect(chatState.activeStatusEffects.length).toBe(0);
	});

	it("should apply Desvantagem on all checks under Unconscious or Moribund", () => {
		const effects = [
			{
				id: "fx-1",
				type: "unconscious",
				label: "Inconsciente",
				severity: 1,
				isAggravated: false,
			},
		];

		const resFisico = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(resFisico.forcedRollType).toBe("Desvantagem");
		expect(resFisico.appliedEffects).toContain("Inconsciente");

		const resMental = chatState.getStatusModifiersForAttribute(
			"Mental",
			effects,
		);
		expect(resMental.forcedRollType).toBe("Desvantagem");
		expect(resMental.appliedEffects).toContain("Inconsciente");

		const resConflito = chatState.getStatusModifiersForAttribute(
			"Conflito",
			effects,
		);
		expect(resConflito.forcedRollType).toBe("Desvantagem");
		expect(resConflito.appliedEffects).toContain("Inconsciente");
	});

	it("should apply Desvantagem only on Físico and Conflito under Immobilized", () => {
		const effects = [
			{
				id: "fx-1",
				type: "immobilized",
				label: "Imobilizado",
				severity: 1,
				isAggravated: false,
			},
		];

		const resFisico = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(resFisico.forcedRollType).toBe("Desvantagem");

		const resConflito = chatState.getStatusModifiersForAttribute(
			"Conflito",
			effects,
		);
		expect(resConflito.forcedRollType).toBe("Desvantagem");

		const resMental = chatState.getStatusModifiersForAttribute(
			"Mental",
			effects,
		);
		expect(resMental.forcedRollType).toBeNull(); // No effect on Mental check
	});

	it("should apply Desvantagem under latent_discoordination if axis matches", () => {
		const effects = [
			{
				id: "fx-1",
				type: "latent_discoordination",
				label: "Descoordenação Latente",
				severity: 3,
				isAggravated: false,
				metadata: "physical", // Affected axis
			},
		];

		const resFisico = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(resFisico.forcedRollType).toBe("Desvantagem");

		const resMental = chatState.getStatusModifiersForAttribute(
			"Mental",
			effects,
		);
		expect(resMental.forcedRollType).toBeNull(); // Different axis
	});

	it("should apply Vantagem under avatar_guerra on Físico and Conflito", () => {
		const effects = [
			{
				id: "fx-1",
				type: "avatar_guerra",
				label: "Avatar da Guerra",
				severity: 1,
				isAggravated: false,
			},
		];

		const resFisico = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(resFisico.forcedRollType).toBe("Vantagem");

		const resConflito = chatState.getStatusModifiersForAttribute(
			"Conflito",
			effects,
		);
		expect(resConflito.forcedRollType).toBe("Vantagem");

		const resSocial = chatState.getStatusModifiersForAttribute(
			"Social",
			effects,
		);
		expect(resSocial.forcedRollType).toBeNull();
	});

	it("should cancel out advantage and disadvantage when both are present", () => {
		const effects = [
			{
				id: "fx-1",
				type: "avatar_guerra",
				label: "Avatar da Guerra",
				severity: 1,
				isAggravated: false,
			},
			{
				id: "fx-2",
				type: "immobilized",
				label: "Imobilizado",
				severity: 1,
				isAggravated: false,
			},
		];

		const res = chatState.getStatusModifiersForAttribute("Físico", effects);
		expect(res.forcedRollType).toBe("Normal"); // Vantagem + Desvantagem = Normal
		expect(res.appliedEffects).toContain("Avatar da Guerra");
		expect(res.appliedEffects).toContain("Imobilizado");
	});

	it("should apply +5 bonus on Conflito check under cacada_selvagem", () => {
		const effects = [
			{
				id: "fx-1",
				type: "cacada_selvagem",
				label: "Caçada Selvagem",
				severity: 1,
				isAggravated: false,
			},
		];

		const resConflito = chatState.getStatusModifiersForAttribute(
			"Conflito",
			effects,
		);
		expect(resConflito.statusBonus).toBe(5);
		expect(resConflito.appliedEffects).toContain("Caçada Selvagem");

		const resFisico = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(resFisico.statusBonus).toBe(0); // Only applies to Conflito
	});

	it("should roll d20, apply modifiers, and log explanation of status source", () => {
		const effects = [
			{
				id: "fx-1",
				type: "immobilized",
				label: "Imobilizado",
				severity: 1,
				isAggravated: false,
			},
		];

		chatState.setActiveCharacter({
			id: "char-1",
			name: "Aria",
			statusEffects: effects,
			axes: [],
			applications: [],
		});

		// Trigger roll on Físico (which is affected by immobilized)
		chatState.rollD20("Aria", "Físico", 2);

		expect(chatState.messages.length).toBe(1);
		const msg = chatState.messages[0];
		expect(msg).toBeDefined();
		if (!msg) return;

		expect(msg.rollDetails).toBeDefined();
		expect(msg.rollDetails?.rollType).toBe("Desvantagem"); // Forced by Immobilized
		expect(msg.rollDetails?.modifier).toBe(2);

		// Details should contain the status name
		expect(msg.content).toContain("Imobilizado");
		expect(msg.content).toContain("Aria");
		expect(msg.content).toContain("Físico");
	});
});
