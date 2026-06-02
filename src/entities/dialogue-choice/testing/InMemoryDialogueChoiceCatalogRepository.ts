import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { DialogueChoiceCatalogRepository } from "../domain/DialogueChoiceCatalogRepository";
import { DIALOGUE_CHOICE_CATALOG } from "../model/dialogueChoiceCatalog";
import type {
	DialogueChoiceId,
	DialogueChoiceRecord,
	DialogueChoiceTag,
} from "../model/dialogueChoiceSchema";
import type { DialogueChoiceFailure } from "../model/dialogueChoiceTypes";

export class InMemoryDialogueChoiceCatalogRepository
	implements DialogueChoiceCatalogRepository
{
	private readonly records: readonly DialogueChoiceRecord[];
	private shouldFail = false;
	private calls = 0;

	public constructor(
		records: readonly DialogueChoiceRecord[] = DIALOGUE_CHOICE_CATALOG,
	) {
		this.records = [...records];
	}

	public getCallCount(): number {
		return this.calls;
	}

	public failNextCall(): void {
		this.shouldFail = true;
	}

	public async listDialogueChoices(): Promise<
		Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>
	> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(this.records);
	}

	public async findDialogueChoiceById(
		id: DialogueChoiceId,
	): Promise<Result<DialogueChoiceRecord, DialogueChoiceFailure>> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		const record = this.records.find((candidate) => candidate.id === id);
		if (!record) {
			return fail({
				code: "MISSING_DIALOGUE_CHOICE",
				message: "Dialogue choice record was not found.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listDialogueChoicesByTag(
		tag: DialogueChoiceTag,
	): Promise<Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(this.records.filter((candidate) => candidate.tag === tag));
	}

	private consumeFailure(): boolean {
		if (!this.shouldFail) {
			return false;
		}

		this.shouldFail = false;
		return true;
	}
}

function repositoryFailure(): Result<never, DialogueChoiceFailure> {
	return fail({
		code: "REPOSITORY_FAILURE",
		message: "Dialogue choice repository failed.",
	});
}
