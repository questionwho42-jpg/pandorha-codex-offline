import type {
	WorldStateFlagView,
	WorldStateValue,
} from "$lib/entities/world-state";
import type { SocialEncounterState } from "./socialEncounterTypes";

type SocialEncounterTerminalStatus = Extract<
	SocialEncounterState["status"],
	"convinced" | "walked-away"
>;

export interface SocialEncounterConsequenceView {
	readonly key: string;
	readonly label: string;
	readonly summary: string;
}

export interface SocialEncounterConsequenceValue {
	readonly actorId: string;
	readonly encounterId: string;
	readonly npcId: string;
	readonly outcome: SocialEncounterTerminalStatus;
	readonly summary: string;
}

export function createSocialEncounterConsequenceFlag(input: {
	readonly state: SocialEncounterState;
	readonly updatedAt: string;
}): WorldStateFlagView | null {
	if (!isTerminalSocialEncounter(input.state.status)) {
		return null;
	}

	const summary = createConsequenceSummary(input.state.status);
	const value = {
		actorId: input.state.actorId,
		encounterId: input.state.id,
		npcId: input.state.npcId,
		outcome: input.state.status,
		summary,
	} satisfies SocialEncounterConsequenceValue;

	return {
		key: createSocialEncounterConsequenceKey(input.state),
		value,
		updatedAt: input.updatedAt,
	};
}

export function upsertSocialEncounterConsequenceFlag(
	flags: readonly WorldStateFlagView[],
	flag: WorldStateFlagView,
): readonly WorldStateFlagView[] {
	const withoutCurrent = flags.filter(
		(candidate) => candidate.key !== flag.key,
	);
	return [...withoutCurrent, flag];
}

export function createSocialEncounterConsequenceView(input: {
	readonly state: SocialEncounterState | null;
	readonly worldState: readonly WorldStateFlagView[];
}): SocialEncounterConsequenceView | null {
	if (!input.state || !isTerminalSocialEncounter(input.state.status)) {
		return null;
	}

	const key = createSocialEncounterConsequenceKey(input.state);
	const flag = input.worldState.find((candidate) => candidate.key === key);
	const value = parseConsequenceValue(flag?.value);
	if (!value) {
		return null;
	}

	return {
		key,
		label:
			value.outcome === "convinced"
				? "Consequência: NPC convencido"
				: "Consequência: negociação perdida",
		summary: value.summary,
	};
}

function createSocialEncounterConsequenceKey(
	state: Pick<SocialEncounterState, "npcId" | "status">,
): string {
	return `npc:${state.npcId}:${state.status}`;
}

function createConsequenceSummary(
	status: SocialEncounterTerminalStatus,
): string {
	return status === "convinced"
		? "O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo."
		: "O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.";
}

function isTerminalSocialEncounter(
	status: SocialEncounterState["status"],
): status is SocialEncounterTerminalStatus {
	return status === "convinced" || status === "walked-away";
}

function parseConsequenceValue(
	value: WorldStateValue | undefined,
): SocialEncounterConsequenceValue | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const candidate = value as Partial<
		Record<keyof SocialEncounterConsequenceValue, unknown>
	>;
	if (
		typeof candidate.actorId !== "string" ||
		typeof candidate.encounterId !== "string" ||
		typeof candidate.npcId !== "string" ||
		typeof candidate.summary !== "string" ||
		(candidate.outcome !== "convinced" && candidate.outcome !== "walked-away")
	) {
		return null;
	}

	return {
		actorId: candidate.actorId,
		encounterId: candidate.encounterId,
		npcId: candidate.npcId,
		outcome: candidate.outcome,
		summary: candidate.summary,
	};
}
