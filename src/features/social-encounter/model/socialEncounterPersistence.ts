import type {
	SocialEncounterEventRecord,
	SocialEncounterRecord,
} from "$lib/entities/social-encounter";
import type {
	SocialEncounterEvent,
	SocialEncounterState,
} from "./socialEncounterTypes";

export interface SocialEncounterPersistedRecords {
	readonly socialEncounters: readonly SocialEncounterRecord[];
	readonly socialEncounterEvents: readonly SocialEncounterEventRecord[];
}

export function createSocialEncounterRecordsFromState(
	state: SocialEncounterState,
): SocialEncounterPersistedRecords {
	return {
		socialEncounters: [createEncounterRecord(state)],
		socialEncounterEvents: state.events.map((event, index) =>
			createEventRecord(state.id, event, index),
		),
	};
}

export function createSocialEncounterStateFromRecords(
	encounter: SocialEncounterRecord,
	events: readonly SocialEncounterEventRecord[],
): SocialEncounterState {
	const orderedEvents = events
		.filter((event) => event.encounterId === encounter.id)
		.sort((left, right) => left.sequence - right.sequence)
		.map(createStateEvent);

	return {
		id: encounter.id,
		npcId: encounter.npcId,
		actorId: encounter.actorId,
		status: encounter.status,
		attitude: encounter.attitude,
		mentalHpCurrent: encounter.mentalHpCurrent,
		mentalHpMax: encounter.mentalHpMax,
		patienceCurrent: encounter.patienceCurrent,
		patienceMax: encounter.patienceMax,
		persuasionProgress: encounter.persuasionProgress,
		persuasionTarget: encounter.persuasionTarget,
		events: orderedEvents,
		log: orderedEvents.map((event) => event.message),
		createdAt: encounter.createdAt,
		updatedAt: encounter.updatedAt,
	};
}

function createEncounterRecord(
	state: SocialEncounterState,
): SocialEncounterRecord {
	return {
		id: state.id,
		npcId: state.npcId,
		actorId: state.actorId,
		status: state.status,
		attitude: state.attitude,
		mentalHpCurrent: state.mentalHpCurrent,
		mentalHpMax: state.mentalHpMax,
		patienceCurrent: state.patienceCurrent,
		patienceMax: state.patienceMax,
		persuasionProgress: state.persuasionProgress,
		persuasionTarget: state.persuasionTarget,
		createdAt: state.createdAt,
		updatedAt: state.updatedAt,
	};
}

function createEventRecord(
	encounterId: string,
	event: SocialEncounterEvent,
	sequence: number,
): SocialEncounterEventRecord {
	return {
		id: `${encounterId}-event-${sequence + 1}`,
		encounterId,
		sequence,
		type: event.type,
		message: event.message,
		createdAt: event.createdAt,
		commandId: event.commandId ?? null,
	};
}

function createStateEvent(
	event: SocialEncounterEventRecord,
): SocialEncounterEvent {
	const stateEvent: SocialEncounterEvent = {
		type: event.type,
		message: event.message,
		createdAt: event.createdAt,
	};

	if (event.commandId !== null) {
		return { ...stateEvent, commandId: event.commandId };
	}

	return stateEvent;
}
