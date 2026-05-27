import { describe, expect, it } from "vitest";
import { ok, type Result } from "$lib/shared/lib/result";
import type { NpcRelationshipRepository } from "../domain/NpcRelationshipRepository";
import { NpcRelationshipService } from "../domain/NpcRelationshipService";
import type {
	NewNpcRelationshipRecord,
	NpcRelationshipNpcId,
	NpcRelationshipRecord,
} from "../model/npcRelationshipSchema";
import type { NpcRelationshipRepositoryFailure } from "../model/npcRelationshipTypes";
import { InMemoryNpcRelationshipRepository } from "../testing/InMemoryNpcRelationshipRepository";

describe("NpcRelationshipService", () => {
	it("creates a neutral relationship record for one NPC", async () => {
		const repository = new InMemoryNpcRelationshipRepository();

		const result = await new NpcRelationshipService(
			repository,
		).createRelationship({
			initialAttitude: "neutral",
			npcId: "training-broker",
			updatedAt: "2026-05-27T13:00:00.000-03:00",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(repository.writeCount).toBe(1);
		expect(result.data.relationship).toEqual({
			npcId: "training-broker",
			attitude: "neutral",
			status: "stable",
			pressureDamage: 0,
			appliedPressureKeysJson: "[]",
			updatedAt: "2026-05-27T13:00:00.000-03:00",
		});
		expect(result.data.event).toEqual({
			type: "npc-relationship-created",
			message: "Relação individual com training-broker iniciada.",
			npcId: "training-broker",
			createdAt: "2026-05-27T13:00:00.000-03:00",
		});
	});

	it("records one pressure consequence without touching faction fame or WorldState", async () => {
		const repository = new InMemoryNpcRelationshipRepository({
			records: [buildRelationship({ attitude: "friendly" })],
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship: buildRelationship({ attitude: "friendly" }),
			severity: "pressure",
			updatedAt: "2026-05-27T13:05:00.000-03:00",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(repository.writeCount).toBe(1);
		expect(result.data.applied).toBe(true);
		expect(result.data.relationship).toMatchObject({
			npcId: "training-broker",
			attitude: "neutral",
			status: "strained",
			pressureDamage: 1,
			updatedAt: "2026-05-27T13:05:00.000-03:00",
		});
		expect(
			JSON.parse(result.data.relationship.appliedPressureKeysJson),
		).toEqual(["npc:training-broker:pressure-infamy:social-encounter-primary"]);
		expect(result.data.event.message).toBe(
			"Pressão social abalou a relação individual com training-broker.",
		);
	});

	it("is idempotent for an already applied pressure key", async () => {
		const relationship = buildRelationship({
			appliedPressureKeysJson: JSON.stringify([
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			]),
			attitude: "skeptical",
			pressureDamage: 1,
			status: "strained",
		});
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:10:00.000-03:00",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(repository.writeCount).toBe(0);
		expect(result.data.applied).toBe(false);
		expect(result.data.relationship).toEqual(relationship);
		expect(result.data.event).toEqual({
			type: "npc-relationship-pressure-skipped",
			message:
				"Pressão social npc:training-broker:pressure-infamy:social-encounter-primary já afetou training-broker.",
			npcId: "training-broker",
			createdAt: "2026-05-27T13:10:00.000-03:00",
		});
	});

	it("turns a mental break into a durable enemy relationship", async () => {
		const relationship = buildRelationship({ attitude: "skeptical" });
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey: "npc:training-broker:mental-break:social-encounter-primary",
			relationship,
			severity: "mental-break",
			updatedAt: "2026-05-27T13:15:00.000-03:00",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.relationship).toMatchObject({
			attitude: "hostile",
			status: "enemy",
			pressureDamage: 1,
		});
		expect(result.data.event.message).toBe(
			"Quebra mental tornou training-broker um inimigo durável.",
		);
	});

	it("keeps a hostile relationship hostile after ordinary pressure", async () => {
		const relationship = buildRelationship({ attitude: "hostile" });
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:16:00.000-03:00",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.relationship).toMatchObject({
			attitude: "hostile",
			status: "strained",
			pressureDamage: 1,
		});
	});

	it("finds an existing relationship by NPC id", async () => {
		const relationship = buildRelationship();
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});

		const result = await new NpcRelationshipService(
			repository,
		).findRelationshipByNpcId("training-broker");

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data).toEqual(relationship);
	});

	it("rejects invalid input before repository writes", async () => {
		const repository = new InMemoryNpcRelationshipRepository();

		const result = await new NpcRelationshipService(
			repository,
		).createRelationship(null);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(repository.writeCount).toBe(0);
		expect(result.error.code).toBe("INVALID_NPC_RELATIONSHIP_INPUT");
		expect(result.error.details).toMatchObject({
			issues: [expect.stringMatching(/^root:/)],
		});
	});

	it("rejects invalid pressure input before repository writes", async () => {
		const repository = new InMemoryNpcRelationshipRepository();

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence(null);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(repository.writeCount).toBe(0);
		expect(result.error.code).toBe("INVALID_NPC_RELATIONSHIP_INPUT");
	});

	it("rejects invalid NPC ids before repository lookups", async () => {
		const repository = new InMemoryNpcRelationshipRepository();

		const result = await new NpcRelationshipService(
			repository,
		).findRelationshipByNpcId("Training Broker");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(repository.lookupCount).toBe(0);
		expect(result.error.code).toBe("INVALID_NPC_RELATIONSHIP_INPUT");
	});

	it("rejects corrupted applied pressure keys", async () => {
		const relationship = buildRelationship({
			appliedPressureKeysJson: "{not-json",
		});
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:20:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});

	it("rejects non-array applied pressure key ledgers", async () => {
		const relationship = buildRelationship({
			appliedPressureKeysJson: "{}",
		});

		const result = await new NpcRelationshipService(
			new InMemoryNpcRelationshipRepository(),
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:21:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});

	it("rejects invalid pressure keys inside applied ledgers", async () => {
		const relationship = buildRelationship({
			appliedPressureKeysJson: JSON.stringify(["Bad Key"]),
		});

		const result = await new NpcRelationshipService(
			new InMemoryNpcRelationshipRepository(),
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:22:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});

	it("wraps repository write failures", async () => {
		const repository = new InMemoryNpcRelationshipRepository();
		repository.failNextSave({
			code: "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED",
			message: "Write failed.",
		});

		const result = await new NpcRelationshipService(
			repository,
		).createRelationship({
			npcId: "training-broker",
			updatedAt: "2026-05-27T13:25:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED");
	});

	it("wraps repository write failures while recording pressure", async () => {
		const relationship = buildRelationship();
		const repository = new InMemoryNpcRelationshipRepository({
			records: [relationship],
		});
		repository.failNextSave({
			code: "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED",
			message: "Write failed.",
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:30:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED");
	});

	it("wraps repository lookup failures", async () => {
		const repository = new InMemoryNpcRelationshipRepository();
		repository.failNextLookup({
			code: "NPC_RELATIONSHIP_REPOSITORY_LOOKUP_FAILED",
			message: "Lookup failed.",
		});

		const result = await new NpcRelationshipService(
			repository,
		).findRelationshipByNpcId("training-broker");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("NPC_RELATIONSHIP_REPOSITORY_LOOKUP_FAILED");
	});

	it("rejects corrupted records returned after create writes", async () => {
		const repository = new CorruptingNpcRelationshipRepository({
			attitude: "unknown",
		});

		const result = await new NpcRelationshipService(
			repository,
		).createRelationship({
			npcId: "training-broker",
			updatedAt: "2026-05-27T13:35:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(repository.writeCount).toBe(1);
		expect(result.error.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});

	it("rejects corrupted records returned after pressure writes", async () => {
		const relationship = buildRelationship();
		const repository = new CorruptingNpcRelationshipRepository({
			status: "unknown",
		});

		const result = await new NpcRelationshipService(
			repository,
		).recordPressureConsequence({
			pressureKey:
				"npc:training-broker:pressure-infamy:social-encounter-primary",
			relationship,
			severity: "pressure",
			updatedAt: "2026-05-27T13:40:00.000-03:00",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(repository.writeCount).toBe(1);
		expect(result.error.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});
});

function buildRelationship(
	patch: Partial<NpcRelationshipRecord> = {},
): NpcRelationshipRecord {
	return {
		npcId: "training-broker",
		attitude: "neutral",
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: "2026-05-27T12:55:00.000-03:00",
		...patch,
	};
}

class CorruptingNpcRelationshipRepository implements NpcRelationshipRepository {
	public writeCount = 0;
	public lookupCount = 0;

	public constructor(
		private readonly corruption: Readonly<Record<string, unknown>>,
	) {}

	public async save(
		record: NewNpcRelationshipRecord,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		this.writeCount += 1;
		return ok({
			...record,
			...this.corruption,
		} as unknown as NpcRelationshipRecord);
	}

	public async findByNpcId(
		npcId: NpcRelationshipNpcId,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		this.lookupCount += 1;
		return ok({
			...buildRelationship({ npcId }),
			...this.corruption,
		} as unknown as NpcRelationshipRecord);
	}
}
