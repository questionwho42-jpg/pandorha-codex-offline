import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import { TRAINING_FACTION_STANDINGS } from "$lib/entities/faction";
import type { Result } from "$lib/shared/lib/result";
import {
	createRpcFailureResponse,
	createRpcSuccessResponse,
	FakeWorkerBridge,
} from "$lib/shared/rpc";
import { SaveLoadService } from "../domain/SaveLoadService";
import type {
	LoadedSessionState,
	SaveLoadFailure,
	SaveLoadMessageIdProvider,
	SaveSessionResult,
} from "../model/saveLoadTypes";

const SAVE_MESSAGE_ID = "1659d6b3-b92e-4cc9-9934-53e91ca1ac7c";
const LOAD_MESSAGE_ID = "e4360b10-b7dc-49b4-8bb5-227697030648";
const SAVED_AT = "2026-05-15T18:59:00.000Z";

describe("SaveLoadService", () => {
	it("persists equipment durability events in v9 and migrates v8 with an empty ledger", async () => {
		const saveBridge = new FakeWorkerBridge();
		saveBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: SAVE_MESSAGE_ID,
				data: { saved: true },
			}),
		);
		const saved = expectSaveSuccess(
			await createService(saveBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				inventoryEvents: [buildInventoryEvent()],
				equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
				characterTraitSelections: [buildCharacterTraitSelection()],
				equipmentDurabilityEvents: [buildEquipmentDurabilityEvent()],
				savedAt: SAVED_AT,
			}),
		);

		expect(saved).toMatchObject({
			version: 9,
			equipmentDurabilityEventCount: 1,
		});
		expect(saveBridge.requests[0]).toMatchObject({
			payload: {
				snapshot: {
					version: 9,
					equipmentDurabilityEvents: [buildEquipmentDurabilityEvent()],
				},
			},
		});

		const loadBridge = new FakeWorkerBridge();
		loadBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 8,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					characterTraitSelections: [buildCharacterTraitSelection()],
					worldState: [],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
					inventoryEvents: [buildInventoryEvent()],
					equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
				},
			}),
		);

		expect(
			expectLoadSuccess(
				await createService(loadBridge, [LOAD_MESSAGE_ID]).loadSession(),
			),
		).toMatchObject({
			version: 9,
			equipmentDurabilityEvents: [],
		});
	});

	it("persists character trait selections in v9 and migrates v7 with empty later ledgers", async () => {
		const saveBridge = new FakeWorkerBridge();
		saveBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: SAVE_MESSAGE_ID,
				data: { saved: true },
			}),
		);
		const saved = expectSaveSuccess(
			await createService(saveBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				inventoryEvents: [buildInventoryEvent()],
				equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
				characterTraitSelections: [buildCharacterTraitSelection()],
				savedAt: SAVED_AT,
			}),
		);

		expect(saved).toMatchObject({
			version: 9,
			characterTraitSelectionCount: 1,
			equipmentDurabilityEventCount: 0,
		});
		expect(saveBridge.requests[0]).toMatchObject({
			payload: {
				snapshot: {
					version: 9,
					characterTraitSelections: [buildCharacterTraitSelection()],
					equipmentDurabilityEvents: [],
				},
			},
		});

		const loadBridge = new FakeWorkerBridge();
		loadBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 7,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					worldState: [],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
					inventoryEvents: [buildInventoryEvent()],
					equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
				},
			}),
		);

		expect(
			expectLoadSuccess(
				await createService(loadBridge, [LOAD_MESSAGE_ID]).loadSession(),
			),
		).toMatchObject({
			version: 9,
			characterTraitSelections: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("persists equipment loadout events in v9 and migrates v6 with empty ledgers", async () => {
		const saveBridge = new FakeWorkerBridge();
		saveBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: SAVE_MESSAGE_ID,
				data: { saved: true },
			}),
		);
		const saved = expectSaveSuccess(
			await createService(saveBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				inventoryEvents: [buildInventoryEvent()],
				equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
				savedAt: SAVED_AT,
			}),
		);

		expect(saved).toMatchObject({
			version: 9,
			inventoryEventCount: 1,
			equipmentLoadoutEventCount: 1,
			characterTraitSelectionCount: 0,
			equipmentDurabilityEventCount: 0,
		});
		expect(saveBridge.requests[0]).toMatchObject({
			payload: {
				snapshot: {
					version: 9,
					equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
					characterTraitSelections: [],
					equipmentDurabilityEvents: [],
				},
			},
		});

		const loadBridge = new FakeWorkerBridge();
		loadBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 6,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					worldState: [],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
					inventoryEvents: [buildInventoryEvent()],
				},
			}),
		);

		expect(
			expectLoadSuccess(
				await createService(loadBridge, [LOAD_MESSAGE_ID]).loadSession(),
			),
		).toMatchObject({
			version: 9,
			inventoryEvents: [buildInventoryEvent()],
			equipmentLoadoutEvents: [],
			characterTraitSelections: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("persists inventory events in v9 and migrates v5 with empty ledgers", async () => {
		const saveBridge = new FakeWorkerBridge();
		saveBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: SAVE_MESSAGE_ID,
				data: { saved: true },
			}),
		);
		const saved = expectSaveSuccess(
			await createService(saveBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				inventoryEvents: [buildInventoryEvent()],
				savedAt: SAVED_AT,
			}),
		);

		expect(saved).toMatchObject({
			version: 9,
			inventoryEventCount: 1,
			equipmentLoadoutEventCount: 0,
			characterTraitSelectionCount: 0,
			equipmentDurabilityEventCount: 0,
		});
		expect(saveBridge.requests[0]).toMatchObject({
			payload: {
				snapshot: {
					version: 9,
					inventoryEvents: [buildInventoryEvent()],
					equipmentLoadoutEvents: [],
					characterTraitSelections: [],
					equipmentDurabilityEvents: [],
				},
			},
		});

		const loadBridge = new FakeWorkerBridge();
		loadBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 5,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					worldState: [],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
				},
			}),
		);

		expect(
			expectLoadSuccess(
				await createService(loadBridge, [LOAD_MESSAGE_ID]).loadSession(),
			),
		).toMatchObject({
			version: 9,
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			characterTraitSelections: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("saves a versioned snapshot with validated Character and WorldState data", async () => {
		const bridge = new FakeWorkerBridge();
		bridge.queueResponse(
			createRpcSuccessResponse({
				messageId: SAVE_MESSAGE_ID,
				data: { saved: true },
			}),
		);
		const service = createService(bridge);

		const saved = expectSaveSuccess(
			await service.saveSession({
				characters: [buildCharacter()],
				worldState: [buildWorldStateFlag()],
				clocks: [buildClock()],
				campSessions: [buildCampSession()],
				campAssignments: [buildCampAssignment()],
				factionStandings: [buildFactionStanding()],
				socialEncounters: [buildSocialEncounter()],
				socialEncounterEvents: [buildSocialEncounterEvent()],
				npcRelationships: [buildNpcRelationship()],
				inventoryEvents: [buildInventoryEvent()],
				savedAt: SAVED_AT,
			}),
		);

		expect(saved).toEqual({
			saveId: "primary",
			version: 9,
			savedAt: SAVED_AT,
			characterCount: 1,
			characterTraitSelectionCount: 0,
			worldStateCount: 1,
			clockCount: 1,
			campSessionCount: 1,
			campAssignmentCount: 1,
			factionStandingCount: 1,
			socialEncounterCount: 1,
			socialEncounterEventCount: 1,
			npcRelationshipCount: 1,
			inventoryEventCount: 1,
			equipmentLoadoutEventCount: 0,
			equipmentDurabilityEventCount: 0,
		});
		expect(bridge.requests).toEqual([
			{
				messageId: SAVE_MESSAGE_ID,
				type: "SAVE_GAME_SNAPSHOT",
				payload: {
					saveId: "primary",
					snapshot: {
						version: 9,
						savedAt: SAVED_AT,
						characters: [buildCharacter()],
						characterTraitSelections: [],
						worldState: [buildWorldStateFlag()],
						clocks: [buildClock()],
						campSessions: [buildCampSession()],
						campAssignments: [buildCampAssignment()],
						factionStandings: [buildFactionStanding()],
						socialEncounters: [buildSocialEncounter()],
						socialEncounterEvents: [buildSocialEncounterEvent()],
						npcRelationships: [buildNpcRelationship()],
						inventoryEvents: [buildInventoryEvent()],
						equipmentLoadoutEvents: [],
						equipmentDurabilityEvents: [],
					},
				},
			},
		]);
	});

	it("loads and validates a persisted snapshot before exposing it to the app", async () => {
		const bridge = new FakeWorkerBridge();
		bridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 9,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					characterTraitSelections: [buildCharacterTraitSelection()],
					worldState: [buildWorldStateFlag()],
					clocks: [buildClock()],
					campSessions: [buildCampSession()],
					campAssignments: [buildCampAssignment()],
					factionStandings: [buildFactionStanding()],
					socialEncounters: [buildSocialEncounter()],
					socialEncounterEvents: [buildSocialEncounterEvent()],
					npcRelationships: [buildNpcRelationship()],
					inventoryEvents: [buildInventoryEvent()],
					equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
					equipmentDurabilityEvents: [buildEquipmentDurabilityEvent()],
				},
			}),
		);
		const service = createService(bridge, [LOAD_MESSAGE_ID]);

		const loaded = expectLoadSuccess(await service.loadSession());

		expect(loaded).toEqual({
			version: 9,
			savedAt: SAVED_AT,
			characters: [buildCharacter()],
			characterTraitSelections: [buildCharacterTraitSelection()],
			worldState: [buildWorldStateFlag()],
			clocks: [buildClock()],
			campSessions: [buildCampSession()],
			campAssignments: [buildCampAssignment()],
			factionStandings: [buildFactionStanding()],
			socialEncounters: [buildSocialEncounter()],
			socialEncounterEvents: [buildSocialEncounterEvent()],
			npcRelationships: [buildNpcRelationship()],
			inventoryEvents: [buildInventoryEvent()],
			equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
			equipmentDurabilityEvents: [buildEquipmentDurabilityEvent()],
		});
		expect(bridge.requests).toEqual([
			{
				messageId: LOAD_MESSAGE_ID,
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			},
		]);
	});

	it("rejects invalid save input before asking the Worker", async () => {
		const bridge = new FakeWorkerBridge();
		const service = createService(bridge);

		const failure = expectFailure(
			await service.saveSession({
				characters: [{ ...buildCharacter(), level: 0 }],
				worldState: [buildWorldStateFlag()],
				savedAt: SAVED_AT,
			}),
		);
		const rootFailure = expectFailure(await service.saveSession(undefined));

		expect(failure.code).toBe("INVALID_SAVE_SESSION_INPUT");
		expect(rootFailure).toMatchObject({
			code: "INVALID_SAVE_SESSION_INPUT",
			details: {
				issues: expect.arrayContaining([expect.stringContaining("root:")]),
			},
		});
		expect(bridge.requests).toEqual([]);
	});

	it("maps Worker transport and failure responses to typed save/load failures", async () => {
		const saveTransportBridge = new FakeWorkerBridge();
		const saveTransportFailure = expectFailure(
			await createService(saveTransportBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				savedAt: SAVED_AT,
			}),
		);
		const saveFailureBridge = new FakeWorkerBridge();
		saveFailureBridge.queueResponse(
			createRpcFailureResponse({
				messageId: SAVE_MESSAGE_ID,
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "falha de escrita",
			}),
		);
		const saveFailure = expectFailure(
			await createService(saveFailureBridge).saveSession({
				characters: [buildCharacter()],
				worldState: [],
				savedAt: SAVED_AT,
			}),
		);
		const loadTransportBridge = new FakeWorkerBridge();
		const loadTransportFailure = expectFailure(
			await createService(loadTransportBridge, [LOAD_MESSAGE_ID]).loadSession(),
		);
		const loadFailureBridge = new FakeWorkerBridge();
		loadFailureBridge.queueResponse(
			createRpcFailureResponse({
				messageId: LOAD_MESSAGE_ID,
				code: "SAVE_NOT_FOUND",
				message: "save ausente",
			}),
		);
		const loadFailure = expectFailure(
			await createService(loadFailureBridge, [LOAD_MESSAGE_ID]).loadSession(),
		);

		expect(saveTransportFailure.code).toBe("SAVE_WORKER_FAILED");
		expect(saveFailure).toMatchObject({
			code: "SAVE_WORKER_FAILED",
			details: { workerCode: "DATABASE_FILE_WRITE_FAILED" },
		});
		expect(loadTransportFailure.code).toBe("LOAD_WORKER_FAILED");
		expect(loadFailure).toMatchObject({
			code: "LOAD_WORKER_FAILED",
			details: { workerCode: "SAVE_NOT_FOUND" },
		});
	});

	it("rejects corrupted loaded snapshots and pending save migrations", async () => {
		const corruptedBridge = new FakeWorkerBridge();
		corruptedBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 6,
					savedAt: SAVED_AT,
					characters: [{ ...buildCharacter(), level: 0 }],
					worldState: [buildWorldStateFlag()],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
					inventoryEvents: [],
					equipmentLoadoutEvents: [],
				},
			}),
		);
		const malformedVersionBridge = new FakeWorkerBridge();
		malformedVersionBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: "legacy",
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					worldState: [buildWorldStateFlag()],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
				},
			}),
		);
		const pendingMigrationBridge = new FakeWorkerBridge();
		pendingMigrationBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: {
					version: 10,
					savedAt: SAVED_AT,
					characters: [buildCharacter()],
					worldState: [buildWorldStateFlag()],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
					inventoryEvents: [],
					equipmentLoadoutEvents: [],
				},
			}),
		);

		expect(
			expectFailure(
				await createService(corruptedBridge, [LOAD_MESSAGE_ID]).loadSession(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(malformedVersionBridge, [
					LOAD_MESSAGE_ID,
				]).loadSession(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(pendingMigrationBridge, [
					LOAD_MESSAGE_ID,
				]).loadSession(),
			).code,
		).toBe("PENDING_SAVE_MIGRATION");
	});

	it("rejects non-object successful Worker responses", async () => {
		const stringBridge = new FakeWorkerBridge();
		stringBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: "not-a-snapshot",
			}),
		);
		const nullBridge = new FakeWorkerBridge();
		nullBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: null,
			}),
		);
		const arrayBridge = new FakeWorkerBridge();
		arrayBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: LOAD_MESSAGE_ID,
				data: [],
			}),
		);

		expect(
			expectFailure(
				await createService(stringBridge, [LOAD_MESSAGE_ID]).loadSession(),
			).code,
		).toBe("INVALID_SAVE_WORKER_RESPONSE");
		expect(
			expectFailure(
				await createService(nullBridge, [LOAD_MESSAGE_ID]).loadSession(),
			).code,
		).toBe("INVALID_SAVE_WORKER_RESPONSE");
		expect(
			expectFailure(
				await createService(arrayBridge, [LOAD_MESSAGE_ID]).loadSession(),
			).code,
		).toBe("INVALID_SAVE_WORKER_RESPONSE");
	});
});

function createService(
	bridge: FakeWorkerBridge,
	ids: readonly string[] = [SAVE_MESSAGE_ID, LOAD_MESSAGE_ID],
): SaveLoadService {
	return new SaveLoadService(bridge, new SequenceMessageIdProvider(ids));
}

function buildCharacter() {
	return {
		...CharacterBuilder.valid().buildCreateInput(),
		id: "session-character-1",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildWorldStateFlag() {
	return {
		key: "location:morden:gate-open",
		value: true,
		updatedAt: SAVED_AT,
	};
}

function buildClock() {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		currentSlices: 1,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildCampSession() {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 1,
		status: "resolved",
		fortifyClockId: "fortify-perimeter",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildCampAssignment() {
	return {
		id: "camp-assignment-1",
		sessionId: "camp-session-1",
		characterId: "session-character-1",
		activityId: "fortify-perimeter",
		hour: 1,
		createdAt: SAVED_AT,
	};
}

function buildFactionStanding() {
	return {
		...TRAINING_FACTION_STANDINGS[0],
		bloodDebt: 1,
		intriguePoints: 1,
	};
}

function buildSocialEncounter() {
	return {
		id: "social-encounter-one",
		npcId: "training-broker",
		actorId: "session-character-1",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 5,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 1,
		persuasionTarget: 3,
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildSocialEncounterEvent() {
	return {
		id: "social-encounter-one-event-one",
		encounterId: "social-encounter-one",
		sequence: 0,
		type: "social-encounter-started",
		message: "Negociação iniciada com Corretora de Treino.",
		createdAt: SAVED_AT,
		commandId: null,
	};
}

function buildNpcRelationship() {
	return {
		npcId: "training-broker",
		attitude: "neutral",
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: SAVED_AT,
	};
}

function buildInventoryEvent() {
	return {
		id: "inventory-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "inventory-item-added",
		entryId: "inventory-entry-1",
		catalogKind: "equipment",
		catalogItemId: "dagger",
		quantity: 1,
		createdAt: SAVED_AT,
	};
}

function buildEquipmentLoadoutEvent() {
	return {
		id: "equipment-loadout-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-loadout-slot-equipped",
		slot: "mainHand",
		inventoryEntryId: "inventory-entry-1",
		createdAt: SAVED_AT,
	};
}

function buildEquipmentDurabilityEvent() {
	return {
		id: "equipment-durability-event-1",
		characterId: "session-character-1",
		sequence: 1,
		inventoryEntryId: "inventory-entry-1",
		type: "equipment-durability-condition-set",
		condition: "damaged",
		createdAt: SAVED_AT,
	};
}

function buildCharacterTraitSelection() {
	return {
		id: "character-trait-selection-1",
		characterId: "session-character-1",
		sequence: 1,
		traitId: "human-diligencia-erudita",
		createdAt: SAVED_AT,
	};
}

function expectSaveSuccess(
	result: Result<SaveSessionResult, SaveLoadFailure>,
): SaveSessionResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectLoadSuccess(
	result: Result<LoadedSessionState, SaveLoadFailure>,
): LoadedSessionState {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<Success>(
	result: Result<Success, SaveLoadFailure>,
): SaveLoadFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class SequenceMessageIdProvider implements SaveLoadMessageIdProvider {
	private nextIndex = 0;

	public constructor(private readonly ids: readonly string[]) {}

	public generate(): string {
		const id = this.ids[this.nextIndex] ?? LOAD_MESSAGE_ID;
		this.nextIndex += 1;
		return id;
	}
}
it("migrates legacy v1 snapshots to v9 with empty structured data", async () => {
	const bridge = new FakeWorkerBridge();
	bridge.queueResponse(
		createRpcSuccessResponse({
			messageId: LOAD_MESSAGE_ID,
			data: {
				version: 1,
				savedAt: SAVED_AT,
				characters: [buildCharacter()],
				worldState: [buildWorldStateFlag()],
			},
		}),
	);

	const loaded = expectLoadSuccess(
		await createService(bridge, [LOAD_MESSAGE_ID]).loadSession(),
	);

	expect(loaded).toEqual({
		version: 9,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		characterTraitSelections: [],
		worldState: [buildWorldStateFlag()],
		clocks: [],
		campSessions: [],
		campAssignments: [],
		factionStandings: [],
		socialEncounters: [],
		socialEncounterEvents: [],
		npcRelationships: [],
		inventoryEvents: [],
		equipmentLoadoutEvents: [],
		equipmentDurabilityEvents: [],
	});
});

it("migrates legacy v2 snapshots to v9 with empty social data", async () => {
	const bridge = new FakeWorkerBridge();
	bridge.queueResponse(
		createRpcSuccessResponse({
			messageId: LOAD_MESSAGE_ID,
			data: {
				version: 2,
				savedAt: SAVED_AT,
				characters: [buildCharacter()],
				worldState: [buildWorldStateFlag()],
				clocks: [buildClock()],
				campSessions: [buildCampSession()],
				campAssignments: [buildCampAssignment()],
			},
		}),
	);

	const loaded = expectLoadSuccess(
		await createService(bridge, [LOAD_MESSAGE_ID]).loadSession(),
	);

	expect(loaded).toEqual({
		version: 9,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		characterTraitSelections: [],
		worldState: [buildWorldStateFlag()],
		clocks: [buildClock()],
		campSessions: [buildCampSession()],
		campAssignments: [buildCampAssignment()],
		factionStandings: [],
		socialEncounters: [],
		socialEncounterEvents: [],
		npcRelationships: [],
		inventoryEvents: [],
		equipmentLoadoutEvents: [],
		equipmentDurabilityEvents: [],
	});
});

it("migrates legacy v3 snapshots to v9 with empty social encounter state", async () => {
	const bridge = new FakeWorkerBridge();
	bridge.queueResponse(
		createRpcSuccessResponse({
			messageId: LOAD_MESSAGE_ID,
			data: {
				version: 3,
				savedAt: SAVED_AT,
				characters: [buildCharacter()],
				worldState: [buildWorldStateFlag()],
				clocks: [buildClock()],
				campSessions: [buildCampSession()],
				campAssignments: [buildCampAssignment()],
				factionStandings: [buildFactionStanding()],
			},
		}),
	);

	const loaded = expectLoadSuccess(
		await createService(bridge, [LOAD_MESSAGE_ID]).loadSession(),
	);

	expect(loaded).toEqual({
		version: 9,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		characterTraitSelections: [],
		worldState: [buildWorldStateFlag()],
		clocks: [buildClock()],
		campSessions: [buildCampSession()],
		campAssignments: [buildCampAssignment()],
		factionStandings: [buildFactionStanding()],
		socialEncounters: [],
		socialEncounterEvents: [],
		npcRelationships: [],
		inventoryEvents: [],
		equipmentLoadoutEvents: [],
		equipmentDurabilityEvents: [],
	});
});

it("migrates legacy v4 snapshots to v9 with empty NPC relationships", async () => {
	const bridge = new FakeWorkerBridge();
	bridge.queueResponse(
		createRpcSuccessResponse({
			messageId: LOAD_MESSAGE_ID,
			data: {
				version: 4,
				savedAt: SAVED_AT,
				characters: [buildCharacter()],
				worldState: [buildWorldStateFlag()],
				clocks: [buildClock()],
				campSessions: [buildCampSession()],
				campAssignments: [buildCampAssignment()],
				factionStandings: [buildFactionStanding()],
				socialEncounters: [buildSocialEncounter()],
				socialEncounterEvents: [buildSocialEncounterEvent()],
			},
		}),
	);

	const loaded = expectLoadSuccess(
		await createService(bridge, [LOAD_MESSAGE_ID]).loadSession(),
	);

	expect(loaded).toEqual({
		version: 9,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		characterTraitSelections: [],
		worldState: [buildWorldStateFlag()],
		clocks: [buildClock()],
		campSessions: [buildCampSession()],
		campAssignments: [buildCampAssignment()],
		factionStandings: [buildFactionStanding()],
		socialEncounters: [buildSocialEncounter()],
		socialEncounterEvents: [buildSocialEncounterEvent()],
		npcRelationships: [],
		inventoryEvents: [],
		equipmentLoadoutEvents: [],
		equipmentDurabilityEvents: [],
	});
});
