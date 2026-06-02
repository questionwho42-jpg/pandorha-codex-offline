import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type { ClockFailure, ClockRecord } from "$lib/entities/clock";
import type { Result } from "$lib/shared/lib/result";

export type CampHourEventType =
	| "camp-action-registered"
	| "camp-watch-covered"
	| "camp-clock-advanced"
	| "camp-danger-increased"
	| "camp-hour-resolved";

export interface CampHourEvent {
	readonly type: CampHourEventType;
	readonly message: string;
	readonly createdAt: string;
	readonly characterId?: string;
	readonly activityId?: string;
}

export interface CampHourResult {
	readonly session: CampSessionRecord;
	readonly assignments: readonly CampAssignmentRecord[];
	readonly watchCoverageMaintained: boolean;
	readonly advancedClock: ClockRecord | null;
	readonly events: readonly CampHourEvent[];
}

export type CampHourFailureCode =
	| "INVALID_CAMP_HOUR_INPUT"
	| "CAMP_SESSION_NOT_PLANNING"
	| "CAMP_ASSIGNMENT_SESSION_MISMATCH"
	| "CAMP_ASSIGNMENT_HOUR_MISMATCH"
	| "DUPLICATE_CAMP_CHARACTER_ASSIGNMENT"
	| "UNKNOWN_CAMP_ACTIVITY"
	| "MISSING_CAMP_CLOCK"
	| "CAMP_CLOCK_ADVANCE_FAILED";

export interface CampHourFailure {
	readonly code: CampHourFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface CampClockProgressPort {
	advanceClock(input: {
		readonly clockId: string;
		readonly slices: number;
		readonly updatedAt: string;
	}): Promise<Result<ClockRecord, ClockFailure>>;
}
