import type {
	CombatEncounterActorRef,
	CombatEncounterState,
	CombatEncounterTargetState,
} from "./combatEncounterTypes";
import type { CombatAttackerOption } from "./combatSessionAttacker";
import type { CombatTurnState } from "./combatTurnTypes";

export type CombatAttackerViewOption = Readonly<{
	id: string;
	isSelected: boolean;
	label: string;
}>;

export type CombatEncounterViewInput = Readonly<{
	attacker: CombatEncounterActorRef;
	attackerOptions: readonly CombatAttackerOption[];
	target: CombatEncounterTargetState;
	targetDescription: string;
	targetHitPoints: number;
	lastState: CombatEncounterState | null;
	log: readonly string[];
	errorMessage: string | null;
	turn: CombatTurnState;
	canResolveTrainingEnemyAttack: boolean;
}>;

export type CombatEncounterView = Readonly<{
	actionPointsLabel: string;
	activeTurnLabel: string;
	attackerLabel: string;
	attackerOptions: readonly CombatAttackerViewOption[];
	canAttack: boolean;
	canEndTurn: boolean;
	canReset: boolean;
	encounterOutcomeDescription: string;
	encounterOutcomeLabel: string;
	errorMessage: string | null;
	isEncounterComplete: boolean;
	isTargetDefeated: boolean;
	logItems: readonly string[];
	resultSummary: string;
	roundLabel: string;
	statusLabel: string;
	targetArmorClassLabel: string;
	targetDescription: string;
	targetHitPointsLabel: string;
	targetLabel: string;
	turnInstruction: string;
}>;

const EMPTY_LOG_INSTRUCTION =
	"Clique em Atacar para registrar a primeira ação do encontro.";

export function createCombatEncounterView(
	input: CombatEncounterViewInput,
): CombatEncounterView {
	const isTargetDefeated = input.targetHitPoints <= 0;
	const isAttackerTurn = input.turn.activeActorId === input.attacker.id;
	const activeActorLabel = isAttackerTurn
		? input.attacker.label
		: input.target.label;

	return {
		actionPointsLabel: `Ações ${input.turn.actionPointsRemaining}/${input.turn.maxActionPoints}`,
		activeTurnLabel: `Turno de ${activeActorLabel}`,
		attackerLabel: input.attacker.label,
		attackerOptions: input.attackerOptions.map((option) => ({
			id: option.id,
			isSelected: option.id === input.attacker.id,
			label: option.label,
		})),
		canAttack:
			!isTargetDefeated &&
			isAttackerTurn &&
			input.turn.actionPointsRemaining > 0,
		canEndTurn: !isTargetDefeated,
		canReset: true,
		encounterOutcomeDescription: createEncounterOutcomeDescription(
			input,
			isTargetDefeated,
		),
		encounterOutcomeLabel: isTargetDefeated
			? "Alvo derrotado"
			: "Encontro em andamento",
		errorMessage: input.errorMessage,
		isEncounterComplete: isTargetDefeated,
		isTargetDefeated,
		logItems: input.log.length > 0 ? input.log : [EMPTY_LOG_INSTRUCTION],
		resultSummary: createResultSummary(input),
		roundLabel: `Rodada ${input.turn.round}`,
		statusLabel: createStatusLabel(input, isTargetDefeated),
		targetArmorClassLabel: `CA ${input.target.armorClass}`,
		targetDescription: input.targetDescription,
		targetHitPointsLabel: `HP ${input.targetHitPoints}`,
		targetLabel: input.target.label,
		turnInstruction: createTurnInstruction({
			attackerLabel: input.attacker.label,
			canResolveTrainingEnemyAttack: input.canResolveTrainingEnemyAttack,
			isAttackerTurn,
			isTargetDefeated,
			targetLabel: input.target.label,
		}),
	};
}

function createEncounterOutcomeDescription(
	input: CombatEncounterViewInput,
	isTargetDefeated: boolean,
): string {
	if (!isTargetDefeated) {
		return "O encontro continua enquanto o alvo tiver HP.";
	}

	return `${input.target.label} chegou a 0 HP. O encontro de treino terminou; reinicie para tentar outro alvo ou atacante.`;
}

function createTurnInstruction(input: {
	readonly attackerLabel: string;
	readonly canResolveTrainingEnemyAttack: boolean;
	readonly isAttackerTurn: boolean;
	readonly isTargetDefeated: boolean;
	readonly targetLabel: string;
}): string {
	if (input.isTargetDefeated) {
		return `${input.targetLabel} foi derrotado.`;
	}

	if (input.isAttackerTurn) {
		return "Escolha Atacar ou encerre o turno.";
	}

	if (input.canResolveTrainingEnemyAttack) {
		return `Encerre o turno para resolver o ataque de treino contra a CA equipada de ${input.attackerLabel}.`;
	}

	return "O alvo de treino não age nesta versão. Encerre o turno para voltar ao atacante.";
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
