import type { Result } from "$lib/shared/lib/result";
import type {
	ClockId,
	ClockRecord,
	NewClockRecord,
} from "../model/clockSchema";
import type { ClockRepositoryFailure } from "../model/clockTypes";

export interface ClockRepository {
	save(
		record: NewClockRecord,
	): Promise<Result<ClockRecord, ClockRepositoryFailure>>;
	findById(id: ClockId): Promise<Result<ClockRecord, ClockRepositoryFailure>>;
}
