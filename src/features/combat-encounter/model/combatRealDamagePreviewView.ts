import type { CombatRealHitPointsReplayState } from "./combatRealHitPointsReplay";

export type CombatRealDamagePreviewViewStatus =
	| "active"
	| "failure"
	| "terminal"
	| "unavailable";

export interface CombatRealDamagePreviewViewInput {
	readonly failureMessage?: string | null;
	readonly hitPoints: CombatRealHitPointsReplayState | null;
}

export interface CombatRealDamagePreviewView {
	readonly description: string;
	readonly status: CombatRealDamagePreviewViewStatus;
	readonly summaryLabel: string;
	readonly titleLabel: string;
}

const TITLE_LABEL = "Prévia local de HP real";
const UNAVAILABLE_SUMMARY = "Prévia local de HP real indisponível";

export function createCombatRealDamagePreviewView(
	input: CombatRealDamagePreviewViewInput,
): CombatRealDamagePreviewView {
	if (input.failureMessage) {
		return {
			description:
				"Prévia local de HP real indisponível. Não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "failure",
			summaryLabel: UNAVAILABLE_SUMMARY,
			titleLabel: TITLE_LABEL,
		};
	}

	if (input.hitPoints === null) {
		return {
			description:
				"Ainda não há ledger local para calcular HP real; não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "unavailable",
			summaryLabel: UNAVAILABLE_SUMMARY,
			titleLabel: TITLE_LABEL,
		};
	}

	const summaryLabel = `Prévia local de HP real de ${input.hitPoints.targetLabel}: ${input.hitPoints.currentHitPoints}/${input.hitPoints.maxHitPoints}`;
	if (input.hitPoints.isTerminal) {
		return {
			description:
				"Prévia local chegou a 0 HP real; estados oficiais continuam bloqueados. Não salva a ficha e não aplica Moribundo ou Inconsciente.",
			status: "terminal",
			summaryLabel,
			titleLabel: TITLE_LABEL,
		};
	}

	return {
		description:
			"Calculada somente por eventos locais; não salva a ficha e não aplica Moribundo ou Inconsciente.",
		status: "active",
		summaryLabel,
		titleLabel: TITLE_LABEL,
	};
}
