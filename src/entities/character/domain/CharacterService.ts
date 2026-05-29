import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { validateCharacterCreationRules } from "../model/characterRules";
import {
	type CharacterRecord,
	characterCreateInputSchema,
	characterInsertSchema,
	characterSelectSchema,
} from "../model/characterSchema";
import type {
	CharacterClock,
	CharacterFailure,
	CharacterIdProvider,
} from "../model/characterTypes";
import type { CharacterRepository } from "./CharacterRepository";

/**
 * @description Orquestra criação de personagem sem gravar atributos derivados finais.
 * @rule docs/system/survival/guia-criacao-de-ficha.md - ficha inicial, Eixos 6/6 e Aplicações 6/6
 */
export class CharacterService {
	public constructor(
		private readonly repository: CharacterRepository,
		private readonly idProvider: CharacterIdProvider,
		private readonly clock: CharacterClock,
	) {}

	public async createCharacter(
		input: unknown,
	): Promise<Result<CharacterRecord, CharacterFailure>> {
		const parsedInput = characterCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_CHARACTER_INPUT",
				message: "Character input does not match the Drizzle-Zod schema.",
				details: { issues: formatIssues(parsedInput.error.issues) },
			});
		}

		const rules = validateCharacterCreationRules(parsedInput.data);
		if (!rules.success) {
			return rules;
		}

		const timestamp = this.clock.now();
		const candidate = characterInsertSchema.safeParse({
			...rules.data,
			id: this.idProvider.generate(),
			createdAt: timestamp,
			updatedAt: timestamp,
		});

		if (!candidate.success) {
			return fail({
				code: "INVALID_CHARACTER_RECORD",
				message: "Character record failed validation before persistence.",
				details: { issues: formatIssues(candidate.error.issues) },
			});
		}

		const saved = await this.repository.save(candidate.data);
		if (!saved.success) {
			const repositoryFailure: CharacterFailure = {
				code: "REPOSITORY_WRITE_FAILED",
				message: saved.error.message,
			};

			if (saved.error.details) {
				return fail({ ...repositoryFailure, details: saved.error.details });
			}

			return fail(repositoryFailure);
		}

		const output = characterSelectSchema.safeParse(saved.data);
		if (!output.success) {
			return fail({
				code: "INVALID_CHARACTER_RECORD",
				message: "Persisted character record failed output validation.",
				details: { issues: formatIssues(output.error.issues) },
			});
		}

		return ok(output.data);
	}

	public async resurrectCharacter(
		characterId: string,
		isResurrectionBlockedFn: () => Promise<Result<boolean, unknown>>,
	): Promise<Result<{ status: "resurrected" }, CharacterFailure>> {
		const blockRes = await isResurrectionBlockedFn();
		if (blockRes.success && blockRes.data) {
			return fail({
				code: "RESURRECTION_BLOCKED",
				message:
					"Ressurreição bloqueada por dívidas de sangue ou alma penhorada.",
			});
		}

		const charRes = await this.repository.findById(characterId);
		if (!charRes.success) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: charRes.error.message,
			});
		}

		const char = charRes.data;
		char.updatedAt = this.clock.now();

		const saveRes = await this.repository.save(char);
		if (!saveRes.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: saveRes.error.message,
			});
		}

		return ok({ status: "resurrected" });
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
