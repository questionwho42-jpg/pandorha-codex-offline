import { describe, expect, it } from "vitest";
import {
	type CombatRealDamagePreviewViewInput,
	createCombatRealDamagePreviewView,
} from "../model/combatRealDamagePreviewView";

describe("combat real damage preview view", () => {
	it("shows an unavailable preview before a local ledger exists", () => {
		const view = createCombatRealDamagePreviewView({ hitPoints: null });

		expect(view).toEqual({
			description:
				"Ainda não há ledger local para calcular HP real; não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "unavailable",
			summaryLabel: "Prévia local de HP real indisponível",
			titleLabel: "Prévia local de HP real",
		});
	});

	it("shows an active local real HP preview", () => {
		const view = createCombatRealDamagePreviewView({
			hitPoints: createHitPoints({ currentHitPoints: 8 }),
		});

		expect(view).toEqual({
			description:
				"Calculada somente por eventos locais; não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "active",
			summaryLabel: "Prévia local de HP real de Lia: 8/14",
			titleLabel: "Prévia local de HP real",
		});
	});

	it("shows a terminal local preview without applying official states", () => {
		const view = createCombatRealDamagePreviewView({
			hitPoints: createHitPoints({ currentHitPoints: 0, isTerminal: true }),
		});

		expect(view).toEqual({
			description:
				"Prévia local chegou a 0 HP real; estados oficiais continuam bloqueados. Não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "terminal",
			summaryLabel: "Prévia local de HP real de Lia: 0/14",
			titleLabel: "Prévia local de HP real",
		});
	});

	it("shows a safe failure message without exposing technical details", () => {
		const view = createCombatRealDamagePreviewView({
			failureMessage: "REAL_DAMAGE_REPLAY_FAILED",
			hitPoints: null,
		});

		expect(view).toEqual({
			description:
				"Prévia local de HP real indisponível. Não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "failure",
			summaryLabel: "Prévia local de HP real indisponível",
			titleLabel: "Prévia local de HP real",
		});
	});
});

function createHitPoints(
	patch: Partial<
		NonNullable<CombatRealDamagePreviewViewInput["hitPoints"]>
	> = {},
): NonNullable<CombatRealDamagePreviewViewInput["hitPoints"]> {
	const currentHitPoints = patch.currentHitPoints ?? 8;

	return {
		appliedDamageTotal: 14 - currentHitPoints,
		currentHitPoints,
		isTerminal: currentHitPoints <= 0,
		matchedEventCount: 1,
		maxHitPoints: 14,
		summaryLabel: `HP real de Lia: ${currentHitPoints}/14`,
		targetId: "session-character-1",
		targetLabel: "Lia",
		...patch,
	};
}
