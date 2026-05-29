import type { Result } from "$lib/shared/lib/result";
import type {
	InvestigationRecord,
	NewInvestigationRecord,
} from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

export interface InvestigationRepository {
	save(
		record: NewInvestigationRecord,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>>;
	findById(
		id: string,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>>;
	findByTargetId(
		targetId: string,
	): Promise<Result<InvestigationRecord[], InvestigationRepositoryFailure>>;
	listActive(): Promise<
		Result<InvestigationRecord[], InvestigationRepositoryFailure>
	>;
}
