import {
	InMemorySpellCatalogRepository,
	OFFICIAL_SPELLS,
	SpellCatalogService,
	type SpellRecord,
} from "$lib/entities/spell";
import {
	SpellCastBuilderService,
	type SpellCastBuildResult,
	type SpellCastFailure,
	type SpellCastInput,
} from "$lib/features/spell-cast";
import type { Result } from "$lib/shared/lib/result";

export interface SpellCastSessionActor {
	readonly availableEther: number;
	readonly id: string;
	readonly label: string;
}

export interface SpellCastSessionTarget {
	readonly id: string;
	readonly label: string;
}

export interface SpellCastSession {
	readonly buildCastCommand: (
		input: unknown,
	) => Promise<Result<SpellCastBuildResult, SpellCastFailure>>;
	readonly caster: SpellCastSessionActor;
	readonly createCastInput: (spellId: string) => SpellCastInput;
	readonly spells: readonly SpellRecord[];
	readonly target: SpellCastSessionTarget;
}

const TRAINING_CASTER: SpellCastSessionActor = {
	availableEther: 0,
	id: "training-caster",
	label: "Conjurador de Treino",
};

const TRAINING_TARGET: SpellCastSessionTarget = {
	id: "training-guard",
	label: "Guarda de Treino",
};

const SPELL_CAST_CREATED_AT = "2026-05-13T12:00:00.000Z";

export function createSpellCastSession(): SpellCastSession {
	const repository = new InMemorySpellCatalogRepository({
		spells: OFFICIAL_SPELLS,
	});
	const catalogService = new SpellCatalogService(repository);
	const builder = new SpellCastBuilderService(catalogService);
	let nextCommandId = 1;

	return {
		buildCastCommand: (input) => builder.buildCastCommand(input),
		caster: TRAINING_CASTER,
		createCastInput: (spellId) => {
			const commandId = `spell-cast-${nextCommandId}`;
			nextCommandId += 1;

			return {
				commandId,
				casterId: TRAINING_CASTER.id,
				spellId,
				targetId: TRAINING_TARGET.id,
				availableEther: TRAINING_CASTER.availableEther,
				metamagicIds: [],
				createdAt: SPELL_CAST_CREATED_AT,
			};
		},
		spells: OFFICIAL_SPELLS,
		target: TRAINING_TARGET,
	};
}
