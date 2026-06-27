import {
	CAMP_ACTIVITY_CATALOG,
	type CampActivityRecord,
} from "$lib/entities/camp-activity";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import {
	type ClockRecord,
	ClockService,
	InMemoryClockRepository,
} from "$lib/entities/clock";
import { CampHourService } from "$lib/features/camp-hour/domain/CampHourService";
import { CampHourTransitionService } from "$lib/features/camp-hour/domain/CampHourTransitionService";
import type {
	CampHourInput,
	CampHourTransitionInput,
} from "$lib/features/camp-hour/model/campHourSchemas";
import type {
	CampHourFailure,
	CampHourResult,
	CampHourTransitionFailure,
} from "$lib/features/camp-hour/model/campHourTypes";
import type { Result } from "$lib/shared/lib/result";

export interface CampPersistedState {
	readonly clocks: readonly ClockRecord[];
	readonly campSessions: readonly CampSessionRecord[];
	readonly campAssignments: readonly CampAssignmentRecord[];
}

export interface CampSessionAppModel {
	readonly activities: readonly CampActivityRecord[];
	createInitialState(createdAt: string): CampPersistedState;
	resolveHour(
		input: CampHourInput,
		clocks: readonly ClockRecord[],
	): Promise<Result<CampHourResult, CampHourFailure>>;
	prepareNextHour(
		input: CampHourTransitionInput,
	): Result<CampSessionRecord, CampHourTransitionFailure>;
}

export function createCampSession(): CampSessionAppModel {
	const transitionService = new CampHourTransitionService();

	return {
		activities: CAMP_ACTIVITY_CATALOG,
		createInitialState,
		prepareNextHour: (input) => transitionService.prepareNextHour(input),
		resolveHour: (input, clocks) => {
			const clockRepository = new InMemoryClockRepository({ records: clocks });
			const service = new CampHourService(new ClockService(clockRepository));
			return service.resolveHour(input);
		},
	};
}

function createInitialState(createdAt: string): CampPersistedState {
	return {
		clocks: [
			{
				id: "fortify-perimeter",
				label: "Fortificar perímetro",
				currentSlices: 0,
				maxSlices: 4,
				status: "active",
				source: "camp",
				createdAt,
				updatedAt: createdAt,
			},
		],
		campSessions: [
			{
				id: "camp-session-1",
				currentHour: 1,
				danger: 0,
				status: "planning",
				fortifyClockId: "fortify-perimeter",
				createdAt,
				updatedAt: createdAt,
			},
		],
		campAssignments: [],
	};
}
