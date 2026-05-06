import type {
	CombatEncounterActorRef,
	CombatEncounterState,
	CombatEncounterTargetState,
} from "../index";

export type CombatEncounterViewInput = Readonly<{
	attacker: CombatEncounterActorRef;
	target: CombatEncounterTargetState;
	targetDescription: string;
	targetHitPoints: number;
	lastState: CombatEncounterState | null;
	log: readonly string[];
	errorMessage: string | null;
}>;

export type CombatEncounterView = Readonly<{
	attackerLabel: string;
	canAttack: boolean;
	errorMessage: string | null;
	isTargetDefeated: boolean;
	logItems: readonly string[];
	resultSummary: string;
	statusLabel: string;
	targetArmorClassLabel: string;
	targetDescription: string;
	targetHitPointsLabel: string;
	targetLabel: string;
}>;

const EMPTY_LOG_INSTRUCTION =
	"Clique em Atacar para registrar a primeira ação do encontro.";

export function createCombatEncounterView(
	input: CombatEncounterViewInput,
): CombatEncounterView {
	const isTargetDefeated = input.targetHitPoints <= 0;

	return {
		attackerLabel: input.attacker.label,
		canAttack: !isTargetDefeated,
		errorMessage: input.errorMessage,
		isTargetDefeated,
		logItems: input.log.length > 0 ? input.log : [EMPTY_LOG_INSTRUCTION],
		resultSummary: createResultSummary(input),
		statusLabel: createStatusLabel(input, isTargetDefeated),
		targetArmorClassLabel: `CA ${input.target.armorClass}`,
		targetDescription: input.targetDescription,
		targetHitPointsLabel: `HP ${input.targetHitPoints}`,
		targetLabel: input.target.label,
	};
}

function createResultSummary(input: CombatEncounterViewInput): string {
	if (!input.lastState) {
		return "Nenhum ataque resolvido ainda.";
	}

	const degreeLabel =
		input.lastState.resolution.degree === "criticalSuccess"
			? "sucesso crítico"
			: input.lastState.resolution.degree === "successWithCost"
				? "sucesso com custo"
				: input.lastState.resolution.degree === "success"
					? "sucesso"
					: "falha";
	const damage = input.lastState.damage?.finalDamage ?? 0;

	return `Último ataque: ${degreeLabel}. Dano final: ${damage}. HP restante: ${input.targetHitPoints}.`;
}

function createStatusLabel(
	input: CombatEncounterViewInput,
	isTargetDefeated: boolean,
): string {
	if (isTargetDefeated) {
		return `${input.target.label} foi derrotado`;
	}

	if (input.targetHitPoints < input.target.currentHitPoints) {
		return `${input.target.label} está ferido`;
	}

	return "Encontro pronto";
}
