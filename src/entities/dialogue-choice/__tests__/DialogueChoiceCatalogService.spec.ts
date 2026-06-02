import { describe, expect, it } from "vitest";
import { DialogueChoiceCatalogService } from "../domain/DialogueChoiceCatalogService";
import { DIALOGUE_CHOICE_CATALOG } from "../model/dialogueChoiceCatalog";
import type { DialogueChoiceRecord } from "../model/dialogueChoiceSchema";
import type { DialogueChoiceFailure } from "../model/dialogueChoiceTypes";
import { InMemoryDialogueChoiceCatalogRepository } from "../testing/InMemoryDialogueChoiceCatalogRepository";

describe("DialogueChoiceCatalogService", () => {
	it("lists exactly the three initial social argument choices", async () => {
		const service = createService();

		const result = await service.listDialogueChoices();
		const records = expectSuccess(result);

		expect(records).toHaveLength(3);
		expect(records.map((record) => record.id)).toEqual([
			"persuade",
			"bargain",
			"threaten",
		]);
		expect(records.every((record) => /^[a-z][a-z0-9-]*$/.test(record.id))).toBe(
			true,
		);
	});

	it("finds persuade with pt-BR label, tag, modifier and source", async () => {
		const service = createService();

		const result = await service.findDialogueChoiceById("persuade");
		const record = expectSuccess(result);

		expect(record).toMatchObject({
			id: "persuade",
			label: "Persuadir",
			tag: "persuade",
			appealModifier: 0,
			sourceFile: "docs/system/survival/regras-negociacao.md",
		});
	});

	it("lists choices by technical tag", async () => {
		const service = createService();

		const result = await service.listDialogueChoicesByTag("bargain");
		const records = expectSuccess(result);

		expect(records).toHaveLength(1);
		expect(records[0]).toMatchObject({
			id: "bargain",
			label: "Barganhar",
			appealModifier: 1,
		});
	});

	it("does not call repository for invalid id or tag", async () => {
		const repository = new InMemoryDialogueChoiceCatalogRepository();
		const service = new DialogueChoiceCatalogService(repository);

		const idResult = await service.findDialogueChoiceById("Persuadir");
		const tagResult = await service.listDialogueChoicesByTag("debate");

		expectFailure(idResult, "INVALID_DIALOGUE_CHOICE_ID");
		expectFailure(tagResult, "INVALID_DIALOGUE_CHOICE_TAG");
		expect(repository.getCallCount()).toBe(0);
	});

	it("returns typed failure for missing records", async () => {
		const service = createService();

		const result = await service.findDialogueChoiceById("missing-choice");

		expectFailure(result, "MISSING_DIALOGUE_CHOICE");
	});

	it("returns typed failure for corrupted records", async () => {
		const corrupted = {
			...DIALOGUE_CHOICE_CATALOG[0],
			appealModifier: 99,
		} as unknown as DialogueChoiceRecord;
		const service = createService([corrupted]);

		const listResult = await service.listDialogueChoices();
		const findResult = await service.findDialogueChoiceById("persuade");
		const tagResult = await service.listDialogueChoicesByTag("persuade");

		expectFailure(listResult, "CORRUPTED_DIALOGUE_CHOICE_RECORD");
		expectFailure(findResult, "CORRUPTED_DIALOGUE_CHOICE_RECORD");
		expectFailure(tagResult, "CORRUPTED_DIALOGUE_CHOICE_RECORD");
	});

	it("returns typed failure when repository fails", async () => {
		const repository = new InMemoryDialogueChoiceCatalogRepository();
		const service = new DialogueChoiceCatalogService(repository);

		repository.failNextCall();
		const listResult = await service.listDialogueChoices();
		repository.failNextCall();
		const findResult = await service.findDialogueChoiceById("persuade");
		repository.failNextCall();
		const tagResult = await service.listDialogueChoicesByTag("persuade");

		expectFailure(listResult, "REPOSITORY_FAILURE");
		expectFailure(findResult, "REPOSITORY_FAILURE");
		expectFailure(tagResult, "REPOSITORY_FAILURE");
	});
});

function createService(
	records: readonly DialogueChoiceRecord[] = DIALOGUE_CHOICE_CATALOG,
): DialogueChoiceCatalogService {
	return new DialogueChoiceCatalogService(
		new InMemoryDialogueChoiceCatalogRepository(records),
	);
}

function expectSuccess<T>(
	result:
		| { readonly success: true; readonly data: T }
		| { readonly success: false },
): T {
	expect(result.success).toBe(true);
	if (!result.success) {
		expect.fail("Expected success.");
	}
	return result.data;
}

function expectFailure(
	result:
		| { readonly success: true }
		| { readonly success: false; readonly error: DialogueChoiceFailure },
	code: DialogueChoiceFailure["code"],
): DialogueChoiceFailure {
	expect(result.success).toBe(false);
	if (result.success) {
		expect.fail("Expected failure.");
	}
	expect(result.error.code).toBe(code);
	return result.error;
}
