import { describe, expect, it } from "vitest";
import { CAMP_ACTIVITY_CATALOG } from "$lib/entities/camp-activity";
import type { CampSessionRecord } from "$lib/entities/camp-session";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import type { ClockRecord } from "$lib/entities/clock";
import type {
	CampHourFailure,
	CampHourTransitionFailure,
} from "../model/campHourTypes";
import {
	createCampHourView,
	mapCampHourFailureToMessage,
	mapCampHourTransitionFailureToMessage,
} from "../model/campHourView";

const TEST_TIMESTAMP = "2026-05-19T13:05:00.000Z";

describe("campHourView", () => {
	it("shows an empty state when no character exists", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [],
			characters: [],
			clock: buildClock(),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "initial-planning",
			selectedActivityIds: {},
			session: buildSession(),
		});

		expect(view.emptyStateLabel).toBe(
			"Crie pelo menos um personagem antes de planejar o acampamento.",
		);
		expect(view.canResolve).toBe(false);
	});

	it("shows planning labels and selected actions in pt-BR", () => {
		const character = buildCharacter();
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [],
			characters: [character],
			clock: buildClock(),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "initial-planning",
			selectedActivityIds: { [character.id]: "fortify-perimeter" },
			session: buildSession(),
		});

		expect(view.sessionStatusLabel).toBe("Planejando hora 1 de acampamento");
		expect(view.dangerLabel).toBe("Perigo 0");
		expect(view.clockProgressLabel).toBe("0/4 fatias");
		expect(view.clockStatusLabel).toBe("Relógio ativo");
		expect(view.characterRows).toEqual([
			{
				characterId: character.id,
				characterName: character.name,
				selectedActivityId: "fortify-perimeter",
				isLocked: false,
			},
		]);
		expect(view.canResolve).toBe(true);
	});

	it("shows resolved logs and completed clock state", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [buildAssignment()],
			characters: [buildCharacter()],
			clock: buildClock({ currentSlices: 4, status: "completed" }),
			errorMessage: null,
			events: [
				{
					type: "camp-hour-resolved",
					message: "Hora 1 do acampamento resolvida.",
					createdAt: TEST_TIMESTAMP,
				},
			],
			isResolving: false,
			lifecycleState: "resolved-local",
			selectedActivityIds: {},
			session: buildSession({ danger: 1, status: "resolved" }),
		});

		expect(view.sessionStatusLabel).toBe("Hora 1 resolvida");
		expect(view.dangerLabel).toBe("Perigo 1");
		expect(view.clockProgressLabel).toBe("4/4 fatias");
		expect(view.clockStatusLabel).toBe("Relógio concluído");
		expect(view.logLines).toEqual(["Hora 1 do acampamento resolvida."]);
		expect(view.characterRows[0]?.isLocked).toBe(true);
		expect(view.canResolve).toBe(false);
		expect(view.showPrepareNextHour).toBe(true);
		expect(view.canPrepareNextHour).toBe(true);
	});

	it("shows restored assignment logs for resolved saved camp state", () => {
		const character = buildCharacter();
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [buildAssignment()],
			characters: [character],
			clock: buildClock({ currentSlices: 1 }),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "resolved-restored",
			selectedActivityIds: {},
			session: buildSession({ danger: 1, status: "resolved" }),
		});

		expect(view.sessionStatusLabel).toBe("Hora 1 restaurada do save local");
		expect(view.canPrepareNextHour).toBe(true);
		expect(view.logLines).toEqual([
			"Hora de acampamento restaurada do save local.",
			"Lia: Fortificar perímetro.",
		]);
		expect(view.canResolve).toBe(false);
	});

	it("shows a safe resolved fallback when saved camp assignments are missing", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [],
			characters: [buildCharacter()],
			clock: buildClock({ currentSlices: 1 }),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "resolved-restored",
			selectedActivityIds: {},
			session: buildSession({ danger: 1, status: "resolved" }),
		});

		expect(view.logLines).toEqual(["Hora de acampamento já resolvida."]);
	});

	it("shows safe restored assignment fallbacks when saved references are gone", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [buildAssignment({ activityId: "removed-activity" })],
			characters: [],
			clock: buildClock({ currentSlices: 1 }),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "resolved-restored",
			selectedActivityIds: {},
			session: buildSession({ danger: 1, status: "resolved" }),
		});

		expect(view.logLines).toEqual([
			"Hora de acampamento restaurada do save local.",
			"Personagem removido: ação desconhecida.",
		]);
	});

	it("uses persisted assignments and safe fallbacks for missing session data", () => {
		const character = buildCharacter();
		const view = createCampHourView({
			activities: [],
			assignments: [buildAssignment({ activityId: "repair-equipment" })],
			characters: [character],
			clock: null,
			errorMessage: "Erro visível",
			events: [],
			isResolving: true,
			lifecycleState: "initial-planning",
			selectedActivityIds: {},
			session: null,
		});

		expect(view.characterRows[0]).toMatchObject({
			selectedActivityId: "repair-equipment",
			isLocked: false,
		});
		expect(view.clockLabel).toBe("Fortificar perímetro");
		expect(view.clockProgressLabel).toBe("0/4 fatias");
		expect(view.clockStatusLabel).toBe("Relógio pronto");
		expect(view.errorMessage).toBe("Erro visível");
		expect(view.logLines).toEqual([
			"Escolha as ações e resolva uma hora de acampamento.",
		]);
		expect(view.canResolve).toBe(false);
	});

	it("uses watch as a final activity fallback", () => {
		const view = createCampHourView({
			activities: [],
			assignments: [],
			characters: [buildCharacter()],
			clock: null,
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "initial-planning",
			selectedActivityIds: {},
			session: buildSession(),
		});

		expect(view.characterRows[0]?.selectedActivityId).toBe("watch");
	});

	it("shows the next hour ready with unlocked actions", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [],
			characters: [buildCharacter()],
			clock: buildClock({ currentSlices: 1 }),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "next-hour-ready",
			selectedActivityIds: {},
			session: buildSession({
				currentHour: 2,
				danger: 1,
				status: "planning",
			}),
		});

		expect(view.sessionStatusLabel).toBe("Hora 2 pronta para planejamento");
		expect(view.logLines).toEqual([
			"Hora 2 pronta. Escolha as ações antes de resolver.",
		]);
		expect(view.characterRows[0]?.isLocked).toBe(false);
		expect(view.canResolve).toBe(true);
		expect(view.showPrepareNextHour).toBe(false);
		expect(view.canPrepareNextHour).toBe(false);
	});

	it("blocks another transition at the 24-hour boundary", () => {
		const view = createCampHourView({
			activities: CAMP_ACTIVITY_CATALOG,
			assignments: [buildAssignment({ hour: 24 })],
			characters: [buildCharacter()],
			clock: buildClock(),
			errorMessage: null,
			events: [],
			isResolving: false,
			lifecycleState: "resolved-restored",
			selectedActivityIds: {},
			session: buildSession({ currentHour: 24, status: "resolved" }),
		});

		expect(view.showPrepareNextHour).toBe(true);
		expect(view.canPrepareNextHour).toBe(false);
		expect(view.nextHourUnavailableLabel).toBe(
			"O acampamento atingiu o limite de 24 horas.",
		);
	});

	it("maps failures to useful user messages without technical codes", () => {
		expect(
			mapCampHourTransitionFailureToMessage(
				buildTransitionFailure("INVALID_CAMP_HOUR_TRANSITION_INPUT"),
			),
		).toBe("Não foi possível preparar a próxima hora.");
		expect(
			mapCampHourTransitionFailureToMessage(
				buildTransitionFailure("CAMP_SESSION_NOT_RESOLVED"),
			),
		).toBe("Resolva a hora atual antes de preparar a próxima.");
		expect(
			mapCampHourTransitionFailureToMessage(
				buildTransitionFailure("CAMP_HOUR_LIMIT_REACHED"),
			),
		).toBe("O acampamento atingiu o limite de 24 horas.");
		expect(
			mapCampHourFailureToMessage(buildFailure("INVALID_CAMP_HOUR_INPUT")),
		).toBe("Revise as ações escolhidas antes de resolver a hora.");
		expect(
			mapCampHourFailureToMessage(buildFailure("CAMP_SESSION_NOT_PLANNING")),
		).toBe(
			"Esta hora já foi resolvida. Salve a sessão ou recarregue o encontro.",
		);
		expect(
			mapCampHourFailureToMessage(
				buildFailure("DUPLICATE_CAMP_CHARACTER_ASSIGNMENT"),
			),
		).toBe("Cada personagem pode receber apenas uma ação por hora.");
		expect(
			mapCampHourFailureToMessage(buildFailure("UNKNOWN_CAMP_ACTIVITY")),
		).toBe("Uma das ações escolhidas não existe no catálogo atual.");
		expect(
			mapCampHourFailureToMessage(buildFailure("MISSING_CAMP_CLOCK")),
		).toBe("O relógio de Fortificar perímetro não está disponível.");
		expect(
			mapCampHourFailureToMessage(buildFailure("CAMP_CLOCK_ADVANCE_FAILED")),
		).toBe("Não foi possível avançar o relógio de Fortificar perímetro.");
		expect(
			mapCampHourFailureToMessage(
				buildFailure("CAMP_ASSIGNMENT_SESSION_MISMATCH"),
			),
		).toBe("As ações planejadas não pertencem à hora atual do acampamento.");
	});
});

function buildCharacter() {
	return {
		...CharacterBuilder.valid().buildCreateInput(),
		id: "session-character-1",
		name: "Lia",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
	};
}

function buildSession(
	patch: Partial<CampSessionRecord> = {},
): CampSessionRecord {
	return {
		...baseSession(),
		...patch,
	};
}

function baseSession(): CampSessionRecord {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 0,
		status: "planning",
		fortifyClockId: "fortify-perimeter",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
	};
}

function buildClock(patch: Partial<ClockRecord> = {}): ClockRecord {
	return {
		...baseClock(),
		...patch,
	};
}

function baseClock(): ClockRecord {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		currentSlices: 0,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
	};
}

function buildAssignment(
	patch: Partial<ReturnType<typeof baseAssignment>> = {},
) {
	return {
		...baseAssignment(),
		...patch,
	};
}

function baseAssignment() {
	return {
		id: "camp-assignment-1",
		sessionId: "camp-session-1",
		characterId: "session-character-1",
		activityId: "fortify-perimeter",
		hour: 1,
		createdAt: TEST_TIMESTAMP,
	};
}

function buildFailure(code: CampHourFailure["code"]): CampHourFailure {
	return {
		code,
		message: "failure",
	};
}

function buildTransitionFailure(
	code: CampHourTransitionFailure["code"],
): CampHourTransitionFailure {
	return {
		code,
		message: "failure",
	};
}
