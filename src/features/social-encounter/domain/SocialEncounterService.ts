import {
	type ActionCommand,
	type ActionCommandProcessor,
	type ActionQueueFailure,
	type ActionQueueProcessedCommand,
	type ActionQueueProcessorFailure,
	ActionQueueService,
} from "$lib/shared/action-queue";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	formatSocialEncounterIssues,
	type SocialEncounterStartInput,
	socialEncounterAppealInputSchema,
	socialEncounterStartInputSchema,
} from "../model/socialEncounterSchemas";
import type {
	SocialAppealOutcome,
	SocialEncounterEvent,
	SocialEncounterFailure,
	SocialEncounterNpcPort,
	SocialEncounterState,
} from "../model/socialEncounterTypes";

/**
 * @description Resolves a deterministic training social negotiation without rolls, UI, persistence, or dialogue trees.
 * @rule docs/system/survival/regras-completas-interacoes-sociais.md - persuasion track is request complexity plus target tier.
 * @rule docs/architecture/feature_state_machines.md - social combat uses queued social actions and derived state.
 */
export class SocialEncounterService {
	public constructor(private readonly npcPort: SocialEncounterNpcPort) {}

	public async startEncounter(
		input: unknown,
	): Promise<Result<SocialEncounterState, SocialEncounterFailure>> {
		const parsed = socialEncounterStartInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const npcResult = await this.npcPort.findNpcById(parsed.data.npcId);
		if (!npcResult.success) {
			return fail({
				code: "NPC_LOOKUP_FAILED",
				message: "Could not find NPC before starting social encounter.",
				details: {
					npcId: parsed.data.npcId,
					npcFailureCode: npcResult.error.code,
				},
				cause: npcResult.error,
			});
		}

		return ok(createInitialState(parsed.data, npcResult.data));
	}

	public resolveAppeal(
		input: unknown,
	): Result<SocialEncounterState, SocialEncounterFailure> {
		const parsed = socialEncounterAppealInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		if (parsed.data.state.status !== "active") {
			return fail({
				code: "SOCIAL_ENCOUNTER_NOT_ACTIVE",
				message: "Social appeal can only be resolved in an active encounter.",
				details: { status: parsed.data.state.status },
			});
		}

		const actionQueue = new ActionQueueService();
		const enqueued = actionQueue.enqueue(parsed.data.command);
		if (!enqueued.success) {
			return fail(createActionQueueFailure(enqueued.error));
		}

		let resolvedState: SocialEncounterState = parsed.data.state;
		let pendingFailure: SocialEncounterFailure = {
			code: "ACTION_QUEUE_FAILED",
			message: "Social encounter processor failed before deriving state.",
			details: { reason: "missing-social-encounter-state" },
		};
		const processor = createSocialAppealProcessor({
			state: parsed.data.state,
			outcome: parsed.data.outcome,
			resolvedAt: parsed.data.resolvedAt,
			onSuccess: (state) => {
				resolvedState = state;
			},
			onFailure: (failure) => {
				pendingFailure = failure;
			},
		});

		const processed = actionQueue.processNext(processor);
		if (!processed.success) {
			return fail(pendingFailure);
		}

		return ok(resolvedState);
	}
}

function createInitialState(
	input: SocialEncounterStartInput,
	npc: {
		readonly id: string;
		readonly label: string;
		readonly tier: number;
		readonly mentalHp: number;
		readonly patience: number;
		readonly attitude: SocialEncounterState["attitude"];
	},
): SocialEncounterState {
	const persuasionTarget = input.requestComplexity + npc.tier;
	const event: SocialEncounterEvent = {
		type: "social-encounter-started",
		message: `Negociação iniciada com ${npc.label}. Trilha ${persuasionTarget}; Paciência ${npc.patience}.`,
		createdAt: input.createdAt,
	};

	return {
		id: input.id,
		npcId: npc.id,
		actorId: input.actorId,
		status: "active",
		attitude: npc.attitude,
		mentalHpCurrent: npc.mentalHp,
		mentalHpMax: npc.mentalHp,
		patienceCurrent: npc.patience,
		patienceMax: npc.patience,
		persuasionProgress: 0,
		persuasionTarget,
		events: [event],
		log: [event.message],
		createdAt: input.createdAt,
		updatedAt: input.createdAt,
	};
}

function createSocialAppealProcessor(input: {
	readonly state: SocialEncounterState;
	readonly outcome: SocialAppealOutcome;
	readonly resolvedAt: string;
	readonly onSuccess: (state: SocialEncounterState) => void;
	readonly onFailure: (failure: SocialEncounterFailure) => void;
}): ActionCommandProcessor {
	return {
		process: (
			command: ActionCommand,
		): Result<ActionQueueProcessedCommand, ActionQueueProcessorFailure> => {
			if (command.type !== "social-appeal") {
				input.onFailure({
					code: "INVALID_SOCIAL_APPEAL_COMMAND",
					message: "Social encounter only accepts social appeal commands.",
					details: { commandType: command.type },
				});
				return fail({
					code: "PROCESSOR_REJECTED_COMMAND",
					message: "Social encounter processor rejected the command.",
					details: { commandType: command.type },
				});
			}

			input.onSuccess(
				resolveQueuedSocialAppeal({
					state: input.state,
					command,
					outcome: input.outcome,
					resolvedAt: input.resolvedAt,
				}),
			);

			return ok({
				commandId: command.id,
				commandType: command.type,
				processedAt: input.resolvedAt,
			});
		},
	};
}

function resolveQueuedSocialAppeal(input: {
	readonly state: SocialEncounterState;
	readonly command: ActionCommand;
	readonly outcome: SocialAppealOutcome;
	readonly resolvedAt: string;
}): SocialEncounterState {
	const queuedEvent: SocialEncounterEvent = {
		type: "social-appeal-queued",
		message: "Apelo social entrou na fila oficial.",
		createdAt: input.resolvedAt,
		commandId: input.command.id,
	};

	const updatedState =
		input.outcome.kind === "success"
			? resolveSuccessfulAppeal({ ...input, outcome: input.outcome })
			: resolveFailedAppeal({ ...input, outcome: input.outcome });

	return appendEvents(input.state, [queuedEvent, ...updatedState.events], {
		status: updatedState.status,
		mentalHpCurrent: updatedState.mentalHpCurrent,
		patienceCurrent: updatedState.patienceCurrent,
		persuasionProgress: updatedState.persuasionProgress,
		updatedAt: input.resolvedAt,
	});
}

function resolveSuccessfulAppeal(input: {
	readonly state: SocialEncounterState;
	readonly command: ActionCommand;
	readonly outcome: Extract<SocialAppealOutcome, { readonly kind: "success" }>;
	readonly resolvedAt: string;
}): {
	readonly status: SocialEncounterState["status"];
	readonly mentalHpCurrent: number;
	readonly patienceCurrent: number;
	readonly persuasionProgress: number;
	readonly events: readonly SocialEncounterEvent[];
} {
	const mentalHpCurrent = Math.max(
		0,
		input.state.mentalHpCurrent - input.outcome.mentalDamage,
	);
	const persuasionProgress = Math.min(
		input.state.persuasionTarget,
		input.state.persuasionProgress + input.outcome.persuasionProgress,
	);
	const isConvinced =
		mentalHpCurrent === 0 || persuasionProgress >= input.state.persuasionTarget;
	const events: SocialEncounterEvent[] = [
		{
			type: "social-appeal-succeeded",
			message: `Apelo social bem-sucedido. HP mental ${mentalHpCurrent}/${input.state.mentalHpMax}; Progresso ${persuasionProgress}/${input.state.persuasionTarget}.`,
			createdAt: input.resolvedAt,
			commandId: input.command.id,
		},
	];

	if (isConvinced) {
		events.push({
			type: "social-encounter-convinced",
			message: "O NPC foi convencido pelo apelo.",
			createdAt: input.resolvedAt,
			commandId: input.command.id,
		});
	}

	return {
		status: isConvinced ? "convinced" : "active",
		mentalHpCurrent,
		patienceCurrent: input.state.patienceCurrent,
		persuasionProgress,
		events,
	};
}

function resolveFailedAppeal(input: {
	readonly state: SocialEncounterState;
	readonly command: ActionCommand;
	readonly outcome: Extract<SocialAppealOutcome, { readonly kind: "failure" }>;
	readonly resolvedAt: string;
}): {
	readonly status: SocialEncounterState["status"];
	readonly mentalHpCurrent: number;
	readonly patienceCurrent: number;
	readonly persuasionProgress: number;
	readonly events: readonly SocialEncounterEvent[];
} {
	const patienceCurrent = Math.max(
		0,
		input.state.patienceCurrent - input.outcome.patienceDamage,
	);
	const walkedAway = patienceCurrent === 0;
	const events: SocialEncounterEvent[] = [
		{
			type: "social-appeal-failed",
			message: `Apelo social falhou. Paciência ${patienceCurrent}/${input.state.patienceMax}.`,
			createdAt: input.resolvedAt,
			commandId: input.command.id,
		},
	];

	if (walkedAway) {
		events.push({
			type: "social-encounter-walked-away",
			message: "O NPC encerrou a negociação.",
			createdAt: input.resolvedAt,
			commandId: input.command.id,
		});
	}

	return {
		status: walkedAway ? "walked-away" : "active",
		mentalHpCurrent: input.state.mentalHpCurrent,
		patienceCurrent,
		persuasionProgress: input.state.persuasionProgress,
		events,
	};
}

function appendEvents(
	state: SocialEncounterState,
	events: readonly SocialEncounterEvent[],
	updates: Pick<
		SocialEncounterState,
		| "status"
		| "mentalHpCurrent"
		| "patienceCurrent"
		| "persuasionProgress"
		| "updatedAt"
	>,
): SocialEncounterState {
	const nextEvents = [...state.events, ...events];

	return {
		...state,
		...updates,
		events: nextEvents,
		log: nextEvents.map((event) => event.message),
	};
}

function invalidInput(
	issues: Parameters<typeof formatSocialEncounterIssues>[0],
): SocialEncounterFailure {
	return {
		code: "INVALID_SOCIAL_ENCOUNTER_INPUT",
		message: "Social encounter input failed validation.",
		details: { issues: formatSocialEncounterIssues(issues) },
	};
}

function createActionQueueFailure(
	failure: ActionQueueFailure,
): SocialEncounterFailure {
	return {
		code: "ACTION_QUEUE_FAILED",
		message: "Social encounter failed while using the action queue.",
		details: { actionQueueFailureCode: failure.code },
		cause: failure,
	};
}
