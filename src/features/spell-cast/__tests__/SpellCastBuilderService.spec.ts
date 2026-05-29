import { describe, expect, it } from "vitest";
import {
	OFFICIAL_SPELLS,
	type SpellFailure,
	type SpellRecord,
} from "$lib/entities/spell";
import { ActionQueueService } from "$lib/shared/action-queue";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { SpellCastBuilderService } from "../domain/SpellCastBuilderService";
import type {
	SpellCastBuildResult,
	SpellCastCatalogPort,
	SpellCastFailure,
	SpellCastInput,
} from "../model/spellCastBuilderTypes";

describe("SpellCastBuilderService", () => {
	it("builds a cast-spell command for light with zero available ether", async () => {
		const result = await createService().buildCastCommand(
			createCastInput({ availableEther: 0, spellId: "light" }),
		);
		const built = expectSpellCastSuccess(result);

		expect(built.draft).toMatchObject({
			casterId: "training-caster",
			spellId: "light",
			targetId: "training-guard",
		});
		expect(built.audit).toMatchObject({
			baseEtherCost: 0,
			metamagicEtherCost: 0,
			totalEtherCost: 0,
			availableEther: 0,
		});
		expect(built.command).toMatchObject({
			id: "spell-cast-light",
			type: "cast-spell",
			source: "SpellCastBuilderService",
			createdAt: "2026-05-13T12:00:00.000Z",
			payload: {
				casterId: "training-caster",
				targetId: "training-guard",
				spellId: "light",
				spellCircle: 0,
				totalEtherCost: 0,
				requiresAttackRoll: false,
				requiresSavingThrow: false,
				damageText: null,
			},
		});
	});

	it("creates a command that can enter the ActionQueue", async () => {
		const built = expectSpellCastSuccess(
			await createService().buildCastCommand(createCastInput()),
		);
		const queued = new ActionQueueService().enqueue(built.command);

		expect(queued.success).toBe(true);
		if (queued.success) {
			expect(queued.data.normal).toHaveLength(1);
			expect(queued.data.normal[0]?.type).toBe("cast-spell");
		}
	});

	it("uses the spell ether cost as total cost before metamagic exists", async () => {
		const service = createService([PAID_TEST_SPELL]);

		const built = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 1,
					spellId: "paid-light",
					commandId: "spell-cast-paid-light",
				}),
			),
		);

		expect(built.audit.totalEtherCost).toBe(1);
		expect(built.command.payload?.totalEtherCost).toBe(1);
	});

	it("rejects insufficient ether with a typed failure", async () => {
		const service = createService([PAID_TEST_SPELL]);

		const failure = expectSpellCastFailure(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 0,
					spellId: "paid-light",
					commandId: "spell-cast-paid-light",
				}),
			),
		);

		expect(failure).toMatchObject({
			code: "INSUFFICIENT_ETHER",
			details: {
				availableEther: 0,
				requiredEther: 1,
				spellId: "paid-light",
			},
		});
	});

	it("maps missing spell lookup into a spell cast failure", async () => {
		const failure = expectSpellCastFailure(
			await createService().buildCastCommand(
				createCastInput({
					spellId: "missing-spell",
					commandId: "spell-cast-missing",
				}),
			),
		);

		expect(failure).toMatchObject({
			code: "SPELL_LOOKUP_FAILED",
			details: {
				spellFailureCode: "SPELL_NOT_FOUND",
				spellId: "missing-spell",
			},
		});
	});

	it("rejects invalid cast input before looking up the spell", async () => {
		const catalog = new FakeSpellCastCatalog(OFFICIAL_SPELLS);
		const service = new SpellCastBuilderService(catalog);

		const invalidTargetFailure = expectSpellCastFailure(
			await service.buildCastCommand(
				createCastInput({ targetId: "Guarda de Treino" }),
			),
		);
		const invalidDateFailure = expectSpellCastFailure(
			await service.buildCastCommand(
				createCastInput({
					createdAt: "13/05/2026",
					commandId: "spell-cast-invalid-date",
				}),
			),
		);

		expect(invalidTargetFailure.code).toBe("INVALID_SPELL_CAST_INPUT");
		expect(invalidDateFailure.code).toBe("INVALID_SPELL_CAST_INPUT");
		expect(catalog.lookupCount).toBe(0);
	});

	it("calculates metamagic ether cost incremental increase", async () => {
		const service = createService([PAID_TEST_SPELL]);

		const built = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 10,
					spellId: "paid-light",
					metamagicIds: ["distant-spell", "resonant-spell"],
				}),
			),
		);

		expect(built.audit.baseEtherCost).toBe(1);
		expect(built.audit.metamagicEtherCost).toBe(3); // 1 (distant-spell) + 2 (resonant-spell) = 3
		expect(built.audit.totalEtherCost).toBe(4);
		expect(built.command.payload?.totalEtherCost).toBe(4);
		expect(built.command.payload?.metamagicIdsCsv).toBe(
			"distant-spell,resonant-spell",
		);
	});

	it("returns invalid command failure when the command validator rejects output", async () => {
		const service = new SpellCastBuilderService(
			new FakeSpellCastCatalog(OFFICIAL_SPELLS),
			() =>
				fail({
					code: "INVALID_SPELL_COMMAND",
					message: "Injected command validation failure.",
					details: { commandId: "spell-cast-light" },
				}),
		);

		const failure = expectSpellCastFailure(
			await service.buildCastCommand(createCastInput()),
		);

		expect(failure).toMatchObject({
			code: "INVALID_SPELL_COMMAND",
			details: { commandId: "spell-cast-light" },
		});
	});

	it("returns invalid command failure when spell data breaks ActionQueue payload validation", async () => {
		const corruptPayloadSpell = {
			...BASE_LIGHT_SPELL,
			id: "corrupt-payload",
			damageText: { nested: "invalid" },
		} as unknown as SpellRecord;

		const failure = expectSpellCastFailure(
			await createService([corruptPayloadSpell]).buildCastCommand(
				createCastInput({
					commandId: "spell-cast-corrupt-payload",
					spellId: "corrupt-payload",
				}),
			),
		);

		expect(failure.code).toBe("INVALID_SPELL_COMMAND");
		expect(failure.details?.issues).toContain(
			"payload.damageText: Invalid input",
		);
	});

	it("keeps the command payload limited to simple scalar values", async () => {
		const built = expectSpellCastSuccess(
			await createService().buildCastCommand(createCastInput()),
		);

		const payloadValues = Object.values(built.command.payload ?? {});
		expect(payloadValues.length).toBeGreaterThan(0);
		expect(
			payloadValues.every(
				(value) =>
					value === null ||
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean",
			),
		).toBe(true);
	});

	it("calculates metamagic cost using a function for twinned/twin/gemea spells", async () => {
		const service = createService([
			{
				...BASE_LIGHT_SPELL,
				id: "paid-light-2",
				label: "Luz Forte",
				circle: 2,
				etherCost: 2,
				tags: ["utility", "light"],
				summary: "Versao de teste com custo de EE de 2.",
			},
		]);

		const builtTwin = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 10,
					spellId: "paid-light-2",
					metamagicIds: ["twin-spell"],
				}),
			),
		);
		expect(builtTwin.audit.baseEtherCost).toBe(2);
		expect(builtTwin.audit.metamagicEtherCost).toBe(2); // twin-spell(2) = 2
		expect(builtTwin.audit.totalEtherCost).toBe(4);

		const builtTwinned = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 10,
					spellId: "paid-light-2",
					metamagicIds: ["twinned-spell"],
				}),
			),
		);
		expect(builtTwinned.audit.metamagicEtherCost).toBe(2); // twinned-spell(2) = 2

		const builtGemea = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 10,
					spellId: "paid-light-2",
					metamagicIds: ["gemea"],
				}),
			),
		);
		expect(builtGemea.audit.metamagicEtherCost).toBe(2); // gemea(2) = 2
	});

	it("applies a fallback cost of 1 for unknown metamagics", async () => {
		const service = createService([PAID_TEST_SPELL]);

		const built = expectSpellCastSuccess(
			await service.buildCastCommand(
				createCastInput({
					availableEther: 10,
					spellId: "paid-light",
					metamagicIds: ["non-existent-metamagic"],
				}),
			),
		);

		expect(built.audit.baseEtherCost).toBe(1);
		expect(built.audit.metamagicEtherCost).toBe(1); // fallback
		expect(built.audit.totalEtherCost).toBe(2);
	});
});

const BASE_LIGHT_SPELL = OFFICIAL_SPELLS[0] as SpellRecord;

const PAID_TEST_SPELL: SpellRecord = {
	...BASE_LIGHT_SPELL,
	id: "paid-light",
	label: "Luz Maior",
	circle: 1,
	etherCost: 1,
	tags: ["utility", "light"],
	summary: "Versao de teste com custo de EE para validar auditoria.",
};

function createService(
	extraSpells: readonly SpellRecord[] = [],
): SpellCastBuilderService {
	return new SpellCastBuilderService(
		new FakeSpellCastCatalog([...OFFICIAL_SPELLS, ...extraSpells]),
	);
}

function createCastInput(
	overrides: Partial<SpellCastInput> = {},
): SpellCastInput {
	return {
		commandId: "spell-cast-light",
		casterId: "training-caster",
		spellId: "light",
		targetId: "training-guard",
		availableEther: 0,
		metamagicIds: [],
		createdAt: "2026-05-13T12:00:00.000Z",
		...overrides,
	};
}

function expectSpellCastSuccess(
	result: Result<SpellCastBuildResult, SpellCastFailure>,
): SpellCastBuildResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectSpellCastFailure(
	result: Result<SpellCastBuildResult, SpellCastFailure>,
): SpellCastFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class FakeSpellCastCatalog implements SpellCastCatalogPort {
	private readonly records: ReadonlyMap<string, SpellRecord>;
	public lookupCount = 0;

	public constructor(records: readonly SpellRecord[]) {
		this.records = new Map(records.map((record) => [record.id, record]));
	}

	public async findSpellById(
		id: unknown,
	): Promise<Result<SpellRecord, SpellFailure>> {
		this.lookupCount += 1;
		const record = this.records.get(String(id));
		if (!record) {
			return fail({
				code: "SPELL_NOT_FOUND",
				message: "Spell not found in fake catalog.",
				details: { id: String(id) },
			});
		}

		return ok(record);
	}
}
