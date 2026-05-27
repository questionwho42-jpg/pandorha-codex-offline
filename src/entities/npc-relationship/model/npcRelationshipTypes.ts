import type { Result } from "$lib/shared/lib/result";
import type {
	NewNpcRelationshipRecord,
	NpcRelationshipNpcId,
	NpcRelationshipRecord,
} from "./npcRelationshipSchema";

export type NpcRelationshipEventType =
	| "npc-relationship-created"
	| "npc-relationship-pressure-recorded"
	| "npc-relationship-pressure-skipped";

export interface NpcRelationshipEvent {
	readonly type: NpcRelationshipEventType;
	readonly message: string;
	readonly npcId: string;
	readonly createdAt: string;
}

export interface NpcRelationshipChangeResult {
	readonly relationship: NpcRelationshipRecord;
	readonly event: NpcRelationshipEvent;
	readonly applied: boolean;
}

export type NpcRelationshipFailureCode =
	| "INVALID_NPC_RELATIONSHIP_INPUT"
	| "CORRUPTED_NPC_RELATIONSHIP_RECORD"
	| NpcRelationshipRepositoryFailureCode;

export type NpcRelationshipRepositoryFailureCode =
	| "NPC_RELATIONSHIP_NOT_FOUND"
	| "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED"
	| "NPC_RELATIONSHIP_REPOSITORY_LOOKUP_FAILED"
	| "CORRUPTED_NPC_RELATIONSHIP_RECORD";

export interface NpcRelationshipFailure {
	readonly code: NpcRelationshipFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface NpcRelationshipRepositoryFailure {
	readonly code: NpcRelationshipRepositoryFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface NpcRelationshipRepositoryPort {
	save(
		record: NewNpcRelationshipRecord,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>>;
	findByNpcId(
		npcId: NpcRelationshipNpcId,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>>;
}
