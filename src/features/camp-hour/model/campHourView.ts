import type { CampActivityRecord } from "$lib/entities/camp-activity";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type { CharacterRecord } from "$lib/entities/character";
import type { ClockRecord } from "$lib/entities/clock";
import type {
	CampHourEvent,
	CampHourFailure,
	CampHourTransitionFailure,
} from "./campHourTypes";

export type CampHourLifecycleState =
	| "initial-planning"
	| "resolved-local"
	| "resolved-restored"
	| "next-hour-ready";

export interface CampHourCharacterRow {
	readonly characterId: string;
	readonly characterName: string;
	readonly selectedActivityId: string;
	readonly isLocked: boolean;
}

export interface CampHourView {
	readonly actionOptions: readonly CampActivityRecord[];
	readonly canPrepareNextHour: boolean;
	readonly canResolve: boolean;
	readonly characterRows: readonly CampHourCharacterRow[];
	readonly clockLabel: string;
	readonly clockProgressLabel: string;
	readonly clockStatusLabel: string;
	readonly dangerLabel: string;
	readonly emptyStateLabel: string | null;
	readonly errorMessage: string | null;
	readonly logLines: readonly string[];
	readonly nextHourUnavailableLabel: string | null;
	readonly sessionStatusLabel: string;
	readonly showPrepareNextHour: boolean;
}

export interface CampHourViewInput {
	readonly activities: readonly CampActivityRecord[];
	readonly assignments: readonly CampAssignmentRecord[];
	readonly characters: readonly CharacterRecord[];
	readonly clock: ClockRecord | null;
	readonly errorMessage: string | null;
	readonly events: readonly CampHourEvent[];
	readonly isResolving: boolean;
	readonly lifecycleState: CampHourLifecycleState;
	readonly selectedActivityIds: Readonly<Record<string, string>>;
	readonly session: CampSessionRecord | null;
}

export function createCampHourView(input: CampHourViewInput): CampHourView {
	const defaultActivityId = input.activities[0]?.id ?? "watch";
	const isResolved = input.session?.status === "resolved";
	const currentHour = input.session?.currentHour ?? 1;
	const showPrepareNextHour = isResolved;

	return {
		actionOptions: input.activities,
		canPrepareNextHour:
			showPrepareNextHour && !input.isResolving && currentHour < 24,
		canResolve:
			input.characters.length > 0 &&
			!input.isResolving &&
			input.session !== null &&
			!isResolved,
		characterRows: input.characters.map((character) => ({
			characterId: character.id,
			characterName: character.name,
			selectedActivityId:
				input.selectedActivityIds[character.id] ??
				findPersistedActivityId(input.assignments, character.id) ??
				defaultActivityId,
			isLocked: isResolved,
		})),
		clockLabel: input.clock?.label ?? "Fortificar perímetro",
		clockProgressLabel: input.clock
			? `${input.clock.currentSlices}/${input.clock.maxSlices} fatias`
			: "0/4 fatias",
		clockStatusLabel: createClockStatusLabel(input.clock),
		dangerLabel: `Perigo ${input.session?.danger ?? 0}`,
		emptyStateLabel:
			input.characters.length === 0
				? "Crie pelo menos um personagem antes de planejar o acampamento."
				: null,
		errorMessage: input.errorMessage,
		logLines: createCampLogLines(input),
		nextHourUnavailableLabel:
			showPrepareNextHour && currentHour >= 24
				? "O acampamento atingiu o limite de 24 horas."
				: null,
		sessionStatusLabel: createSessionStatusLabel(input),
		showPrepareNextHour,
	};
}

export function mapCampHourFailureToMessage(failure: CampHourFailure): string {
	switch (failure.code) {
		case "INVALID_CAMP_HOUR_INPUT":
			return "Revise as ações escolhidas antes de resolver a hora.";
		case "CAMP_SESSION_NOT_PLANNING":
			return "Esta hora já foi resolvida. Salve a sessão ou recarregue o encontro.";
		case "DUPLICATE_CAMP_CHARACTER_ASSIGNMENT":
			return "Cada personagem pode receber apenas uma ação por hora.";
		case "UNKNOWN_CAMP_ACTIVITY":
			return "Uma das ações escolhidas não existe no catálogo atual.";
		case "MISSING_CAMP_CLOCK":
			return "O relógio de Fortificar perímetro não está disponível.";
		case "CAMP_CLOCK_ADVANCE_FAILED":
			return "Não foi possível avançar o relógio de Fortificar perímetro.";
		case "CAMP_ASSIGNMENT_SESSION_MISMATCH":
		case "CAMP_ASSIGNMENT_HOUR_MISMATCH":
			return "As ações planejadas não pertencem à hora atual do acampamento.";
	}
}

export function mapCampHourTransitionFailureToMessage(
	failure: CampHourTransitionFailure,
): string {
	switch (failure.code) {
		case "INVALID_CAMP_HOUR_TRANSITION_INPUT":
			return "Não foi possível preparar a próxima hora.";
		case "CAMP_SESSION_NOT_RESOLVED":
			return "Resolva a hora atual antes de preparar a próxima.";
		case "CAMP_HOUR_LIMIT_REACHED":
			return "O acampamento atingiu o limite de 24 horas.";
	}
}

function createSessionStatusLabel(input: CampHourViewInput): string {
	const currentHour = input.session?.currentHour ?? 1;

	switch (input.lifecycleState) {
		case "resolved-local":
			return `Hora ${currentHour} resolvida`;
		case "resolved-restored":
			return `Hora ${currentHour} restaurada do save local`;
		case "next-hour-ready":
			return `Hora ${currentHour} pronta para planejamento`;
		case "initial-planning":
			return `Planejando hora ${currentHour} de acampamento`;
	}
}

function createClockStatusLabel(clock: ClockRecord | null): string {
	if (!clock) {
		return "Relógio pronto";
	}

	return clock.status === "completed" ? "Relógio concluído" : "Relógio ativo";
}

function createCampLogLines(input: CampHourViewInput): readonly string[] {
	if (input.events.length > 0) {
		return input.events.map((event) => event.message);
	}

	if (input.lifecycleState === "next-hour-ready" && input.session) {
		return [
			`Hora ${input.session.currentHour} pronta. Escolha as ações antes de resolver.`,
		];
	}

	if (input.session?.status === "resolved") {
		const restoredAssignments = input.assignments
			.filter((assignment) => assignment.sessionId === input.session?.id)
			.map((assignment) => formatRestoredAssignment(assignment, input));

		return restoredAssignments.length > 0
			? [
					"Hora de acampamento restaurada do save local.",
					...restoredAssignments,
				]
			: ["Hora de acampamento já resolvida."];
	}

	return ["Escolha as ações e resolva uma hora de acampamento."];
}

function formatRestoredAssignment(
	assignment: CampAssignmentRecord,
	input: CampHourViewInput,
): string {
	const characterName =
		input.characters.find(
			(character) => character.id === assignment.characterId,
		)?.name ?? "Personagem removido";
	const activityLabel =
		input.activities.find((activity) => activity.id === assignment.activityId)
			?.label ?? "ação desconhecida";

	return `${characterName}: ${activityLabel}.`;
}

function findPersistedActivityId(
	assignments: readonly CampAssignmentRecord[],
	characterId: string,
): string | null {
	return (
		assignments.find((assignment) => assignment.characterId === characterId)
			?.activityId ?? null
	);
}
