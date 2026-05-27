import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type NewNpcRelationshipRecord,
	type NpcRelationshipNpcId,
	type NpcRelationshipRecord,
	npcRelationshipCreateInputSchema,
	npcRelationshipNpcIdSchema,
	npcRelationshipPressureInputSchema,
	npcRelationshipPressureKeySchema,
	npcRelationshipRawRecordInputSchema,
	type ParsedNpcRelationshipCreateInput,
	type ParsedNpcRelationshipPressureInput,
} from "../model/npcRelationshipSchema";
import type {
	NpcRelationshipChangeResult,
	NpcRelationshipEvent,
	NpcRelationshipFailure,
} from "../model/npcRelationshipTypes";
import type { NpcRelationshipRepository } from "./NpcRelationshipRepository";

/**
 * @description Manages durable individual NPC relationship state without faction Fame, WorldState flags, UI, save slots, or Worker RPC.
 * @rule docs/system/survival/regras-negociacao.md - reducing a NPC to 0 mental HP can make the relationship collapse durably.
 * @rule docs/system/survival/06-npcs-e-aliados.md - NPCs have their own will and fears.
 */
export class NpcRelationshipService {
	public constructor(private readonly repository: NpcRelationshipRepository) {}

	public async createRelationship(
		input: unknown,
	): Promise<Result<NpcRelationshipChangeResult, NpcRelationshipFailure>> {
		const parsedInput = npcRelationshipCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return invalidInputFailure(parsedInput.error.issues);
		}

		const saved = await this.repository.save(
			createInitialRecord(parsedInput.data),
		);
		if (!saved.success) {
			return fail(saved.error);
		}

		const relationship = validateRecord(saved.data);
		if (!relationship.success) {
			return fail(relationship.error);
		}

		return ok({
			relationship: relationship.data,
			applied: true,
			event: {
				type: "npc-relationship-created",
				message: `Relação individual com ${relationship.data.npcId} iniciada.`,
				npcId: relationship.data.npcId,
				createdAt: relationship.data.updatedAt,
			},
		});
	}

	public async recordPressureConsequence(
		input: unknown,
	): Promise<Result<NpcRelationshipChangeResult, NpcRelationshipFailure>> {
		const parsedInput = npcRelationshipPressureInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return invalidInputFailure(parsedInput.error.issues);
		}

		const relationship: NpcRelationshipRecord = parsedInput.data.relationship;
		const appliedPressureKeys = parseAppliedPressureKeys(relationship);
		if (!appliedPressureKeys.success) {
			return fail(appliedPressureKeys.error);
		}

		if (appliedPressureKeys.data.includes(parsedInput.data.pressureKey)) {
			return ok({
				relationship,
				applied: false,
				event: {
					type: "npc-relationship-pressure-skipped",
					message: `Pressão social ${parsedInput.data.pressureKey} já afetou ${relationship.npcId}.`,
					npcId: relationship.npcId,
					createdAt: parsedInput.data.updatedAt,
				},
			});
		}

		const nextRelationship = createPressureRelationship(
			relationship,
			parsedInput.data,
			[...appliedPressureKeys.data, parsedInput.data.pressureKey],
		);
		const saved = await this.repository.save(nextRelationship);
		if (!saved.success) {
			return fail(saved.error);
		}

		const savedRelationship = validateRecord(saved.data);
		if (!savedRelationship.success) {
			return fail(savedRelationship.error);
		}

		return ok({
			relationship: savedRelationship.data,
			applied: true,
			event: createPressureEvent(savedRelationship.data, parsedInput.data),
		});
	}

	public async findRelationshipByNpcId(
		npcId: unknown,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipFailure>> {
		const parsedNpcId = npcRelationshipNpcIdSchema.safeParse(npcId);
		if (!parsedNpcId.success) {
			return invalidInputFailure(parsedNpcId.error.issues);
		}

		const found = await this.repository.findByNpcId(parsedNpcId.data);
		if (!found.success) {
			return fail(found.error);
		}

		return validateRecord(found.data);
	}
}

function createInitialRecord(
	input: ParsedNpcRelationshipCreateInput,
): NewNpcRelationshipRecord {
	return {
		npcId: input.npcId,
		attitude: input.initialAttitude,
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: input.updatedAt,
	};
}

function createPressureRelationship(
	relationship: NpcRelationshipRecord,
	input: ParsedNpcRelationshipPressureInput,
	appliedPressureKeys: readonly string[],
): NewNpcRelationshipRecord {
	const isMentalBreak = input.severity === "mental-break";
	const attitude = isMentalBreak
		? "hostile"
		: degradeAttitude(relationship.attitude);

	return {
		...relationship,
		attitude,
		status: isMentalBreak ? "enemy" : "strained",
		pressureDamage: relationship.pressureDamage + 1,
		appliedPressureKeysJson: JSON.stringify(appliedPressureKeys),
		updatedAt: input.updatedAt,
	};
}

function createPressureEvent(
	relationship: NpcRelationshipRecord,
	input: ParsedNpcRelationshipPressureInput,
): NpcRelationshipEvent {
	if (input.severity === "mental-break") {
		return {
			type: "npc-relationship-pressure-recorded",
			message: `Quebra mental tornou ${relationship.npcId} um inimigo durável.`,
			npcId: relationship.npcId,
			createdAt: input.updatedAt,
		};
	}

	return {
		type: "npc-relationship-pressure-recorded",
		message: `Pressão social abalou a relação individual com ${relationship.npcId}.`,
		npcId: relationship.npcId,
		createdAt: input.updatedAt,
	};
}

function degradeAttitude(
	attitude: NpcRelationshipRecord["attitude"],
): NpcRelationshipRecord["attitude"] {
	if (attitude === "friendly") {
		return "neutral";
	}
	if (attitude === "neutral") {
		return "skeptical";
	}
	return "hostile";
}

function validateRecord(
	record: NpcRelationshipRecord,
): Result<NpcRelationshipRecord, NpcRelationshipFailure> {
	const parsedRecord = npcRelationshipRawRecordInputSchema.safeParse(record);
	if (!parsedRecord.success) {
		return fail({
			code: "CORRUPTED_NPC_RELATIONSHIP_RECORD",
			message: "NPC relationship record failed output validation.",
			details: { issues: formatIssues(parsedRecord.error.issues) },
		});
	}

	return ok(parsedRecord.data);
}

function parseAppliedPressureKeys(
	relationship: NpcRelationshipRecord,
): Result<readonly string[], NpcRelationshipFailure> {
	try {
		const parsed = JSON.parse(relationship.appliedPressureKeysJson) as unknown;
		if (
			!Array.isArray(parsed) ||
			parsed.some(
				(item) => !npcRelationshipPressureKeySchema.safeParse(item).success,
			)
		) {
			return corruptedAppliedPressureKeys(relationship.npcId);
		}

		return ok(parsed);
	} catch {
		return corruptedAppliedPressureKeys(relationship.npcId);
	}
}

function corruptedAppliedPressureKeys(
	npcId: NpcRelationshipNpcId,
): Result<never, NpcRelationshipFailure> {
	return fail({
		code: "CORRUPTED_NPC_RELATIONSHIP_RECORD",
		message: "NPC relationship pressure key ledger is corrupted.",
		details: { npcId },
	});
}

function invalidInputFailure(
	issues: readonly ZodIssue[],
): Result<never, NpcRelationshipFailure> {
	return fail({
		code: "INVALID_NPC_RELATIONSHIP_INPUT",
		message: "NPC relationship input does not match the expected contract.",
		details: { issues: formatIssues(issues) },
	});
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
