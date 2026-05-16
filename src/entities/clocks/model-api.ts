import type { Result } from "../../shared/lib/result";
import type { ClockData } from "./model/clockSchema";

export interface IClockRepository {
	save(clock: ClockData): Promise<Result<ClockData, Error>>;
	findById(id: string): Promise<Result<ClockData | null, Error>>;
	findAll(): Promise<Result<ClockData[], Error>>;
	delete(id: string): Promise<Result<void, Error>>;
}

export type { ClockData };
