import { z } from "zod/v4";
import {
	worldStateKeySchema,
	worldStateListPrefixSchema,
	worldStateValueSchema,
} from "$lib/entities/world-state/model/worldStateSchema";
import type {
	JsonObject,
	JsonValue,
	RpcBridgeFailure,
	RpcBridgeFailureCode,
	RpcCommandType,
} from "./rpcTypes";

const isoTimestamp = z.string().trim().datetime({ offset: true });
const primarySaveId = z.literal("primary");

export const rpcMessageIdSchema = z.string().uuid();
export const rpcCommandTypeSchema = z.enum([
	"INIT_DATABASE",
	"SAVE_GAME_SNAPSHOT",
	"LOAD_GAME_SNAPSHOT",
	"SAVE_CHARACTER",
	"FIND_CHARACTER",
	"SAVE_STATUS_EFFECT",
	"FIND_STATUS_EFFECTS",
	"DELETE_STATUS_EFFECT",
	"CAST_SPELL",
	"SAVE_BASTION",
	"FIND_BASTION",
	"SAVE_BASTION_MODULE",
	"FIND_BASTION_MODULES",
	"DELETE_BASTION_MODULE",
	"SAVE_FACTION",
	"FIND_FACTION",
	"LIST_FACTIONS",
	"SAVE_REPUTATION",
	"FIND_REPUTATION",
	"LIST_REPUTATIONS",
	"SAVE_BLOOD_DEBT",
	"LIST_BLOOD_DEBTS",
	"SAVE_SOCIAL_LEDGER",
	"FIND_SOCIAL_LEDGER",
	"SAVE_CLOCK",
	"FIND_CLOCK",
	"LIST_CLOCKS",
	"DELETE_CLOCK",
	"SAVE_DIALOGUE_STATE",
	"FIND_DIALOGUE_STATE",
	"DELETE_DIALOGUE_STATE",
	"SAVE_QUEST",
	"FIND_QUEST",
	"LIST_QUESTS",
	"DELETE_QUEST",
	"SAVE_QUEST_OBJECTIVE",
	"FIND_QUEST_OBJECTIVE",
	"LIST_QUEST_OBJECTIVES_BY_QUEST",
	"DELETE_QUEST_OBJECTIVE",
	"SAVE_LORE_ENCOUNTER",
	"FIND_LORE_ENCOUNTER",
	"LIST_LORE_ENCOUNTERS_BY_TILE",
	"LIST_ALL_LORE_ENCOUNTERS",
	"SAVE_CAMPAIGN_RUMOR",
	"FIND_CAMPAIGN_RUMOR",
	"LIST_CAMPAIGN_RUMORS_BY_TILE",
	"LIST_ALL_CAMPAIGN_RUMORS",
	"SAVE_COHESION",
	"FIND_COHESION",
	"SAVE_SIGNATURE",
	"FIND_SIGNATURE",
	"LIST_SIGNATURES",
	"DELETE_SIGNATURE",
	"SAVE_TRAP",
	"FIND_TRAP",
	"LIST_TRAPS",
	"DELETE_TRAP",
	"SAVE_COMPANION",
	"FIND_COMPANION",
	"LIST_COMPANIONS",
	"SAVE_INVESTIGATION",
	"FIND_INVESTIGATION",
	"LIST_INVESTIGATIONS_BY_TARGET",
	"LIST_ACTIVE_INVESTIGATIONS",
	"SAVE_REGIONAL_DOMAIN",
	"FIND_REGIONAL_DOMAIN",
	"LIST_REGIONAL_DOMAINS",
	"SAVE_CAMP_SESSION",
	"FIND_CAMP_SESSION",
	"LIST_CAMP_SESSIONS",
	"DELETE_CAMP_SESSION",
	"SAVE_MERCENARY_COMPANY",
	"FIND_MERCENARY_COMPANY",
	"LIST_MERCENARY_COMPANIES",
	"SAVE_MERCENARY_SQUAD",
	"FIND_MERCENARY_SQUAD",
	"LIST_MERCENARY_SQUADS_BY_COMPANY",
	"DISMANTLE_CRAFTED_ITEM",
	"SCRAP_EQUIPMENT",
	"LIST_SAVE_SLOTS",
	"CREATE_SAVE_SLOT",
	"CLONE_SAVE_SLOT",
	"DELETE_SAVE_SLOT",
	"MUTATE_WORLD_STATE",
	"SET_WORLD_STATE_FLAG",
	"GET_WORLD_STATE_FLAG",
	"LIST_WORLD_STATE_FLAGS",
	"TICK_CLOCK_MANUAL",
	"FORCE_SPAWN_ACTOR",
	"APPLY_LEVEL_UP",
	"SAVE_COMBAT_ENCOUNTER",
	"FIND_COMBAT_ENCOUNTER",
	"SAVE_COMBAT_MONSTER",
	"FIND_COMBAT_MONSTERS_BY_ENCOUNTER",
	"SAVE_ACTIVE_SESSION",
	"FIND_ACTIVE_SESSION",
	"GET_ANCESTRY_CATALOG",
	"GET_BACKGROUND_CATALOG",
	"GET_CHARACTER_CLASS_CATALOG",
	"GET_SPELL_CATALOG",
	"SAVE_DUNGEON_DELVE",
	"FIND_DUNGEON_DELVE",
	"LIST_DUNGEON_DELVES",
	"SAVE_DUNGEON_ROOM",
	"FIND_DUNGEON_ROOMS",
	"FIND_DUNGEON_ROOM_BY_COORDS",
	"UPDATE_DUNGEON_ROOM_STATUS",
	"UPDATE_DUNGEON_DELVE_STATUS",
	"GET_CAMPAIGN_TIMELINE",
	"RECORD_CAMPAIGN_EVENT",
]);

export const jsonSerializableValueSchema = z.custom<JsonValue>(
	(value) => isJsonSerializable(value),
	"Value must be JSON-serializable.",
);

export const jsonSerializableObjectSchema = z.custom<JsonObject>(
	(value) => isPlainJsonObject(value),
	"Value must be a JSON-serializable object.",
);

export const saveGameSnapshotSchema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
	characters: z.array(jsonSerializableObjectSchema),
	worldState: z.array(jsonSerializableObjectSchema),
	bastions: z.array(jsonSerializableObjectSchema).optional(),
	bastionModules: z.array(jsonSerializableObjectSchema).optional(),
	factions: z.array(jsonSerializableObjectSchema).optional(),
	characterReputation: z.array(jsonSerializableObjectSchema).optional(),
	bloodDebts: z.array(jsonSerializableObjectSchema).optional(),
	progressClocks: z.array(jsonSerializableObjectSchema).optional(),
	dialogueStates: z.array(jsonSerializableObjectSchema).optional(),
	quests: z.array(jsonSerializableObjectSchema).optional(),
	questObjectives: z.array(jsonSerializableObjectSchema).optional(),
	investigations: z.array(jsonSerializableObjectSchema).optional(),
	regionalDomains: z.array(jsonSerializableObjectSchema).optional(),
	campSessions: z.array(jsonSerializableObjectSchema).optional(),
	mercenaryCompanies: z.array(jsonSerializableObjectSchema).optional(),
	mercenarySquads: z.array(jsonSerializableObjectSchema).optional(),
	activeSessions: z.array(jsonSerializableObjectSchema).optional(),
	combatEncounters: z.array(jsonSerializableObjectSchema).optional(),
	combatMonsters: z.array(jsonSerializableObjectSchema).optional(),
	espionageCells: z.array(jsonSerializableObjectSchema).optional(),
	campaignEventsHistory: z.array(jsonSerializableObjectSchema).optional(),
});

export const initDatabaseRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("INIT_DATABASE"),
	payload: z.object({
		requestedAt: isoTimestamp,
		activeSaveFile: z.string().trim().optional(),
	}),
});

export const listSaveSlotsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_SAVE_SLOTS"),
	payload: z.object({}),
});

export const createSaveSlotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("CREATE_SAVE_SLOT"),
	payload: z.object({
		fileName: z.string().trim().min(1),
	}),
});

export const cloneSaveSlotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("CLONE_SAVE_SLOT"),
	payload: z.object({
		sourceFileName: z.string().trim().min(1),
		targetFileName: z.string().trim().min(1),
	}),
});

export const deleteSaveSlotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_SAVE_SLOT"),
	payload: z.object({
		fileName: z.string().trim().min(1),
	}),
});

export const saveGameSnapshotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_GAME_SNAPSHOT"),
	payload: z.object({
		saveId: primarySaveId,
		snapshot: saveGameSnapshotSchema,
	}),
});

export const loadGameSnapshotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LOAD_GAME_SNAPSHOT"),
	payload: z.object({
		saveId: primarySaveId,
	}),
});

export const saveCharacterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_CHARACTER"),
	payload: z.object({
		character: jsonSerializableObjectSchema,
	}),
});

export const findCharacterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_CHARACTER"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveStatusEffectRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_STATUS_EFFECT"),
	payload: z.object({
		effect: jsonSerializableObjectSchema,
	}),
});

export const findStatusEffectsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_STATUS_EFFECTS"),
	payload: z.object({
		characterId: z.string().min(1),
	}),
});

export const deleteStatusEffectRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_STATUS_EFFECT"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const castSpellRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("CAST_SPELL"),
	payload: z.object({
		casterId: z.string().min(1),
		targetId: z.string().min(1),
		spellId: z.string().min(1),
		upcastLevel: z.number().int().min(0).max(10),
	}),
});

export const saveBastionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_BASTION"),
	payload: z.object({
		bastion: jsonSerializableObjectSchema,
	}),
});

export const findBastionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_BASTION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveBastionModuleRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_BASTION_MODULE"),
	payload: z.object({
		module: jsonSerializableObjectSchema,
	}),
});

export const findBastionModulesRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_BASTION_MODULES"),
	payload: z.object({
		bastionId: z.string().min(1),
	}),
});

export const deleteBastionModuleRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_BASTION_MODULE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveFactionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_FACTION"),
	payload: z.object({
		faction: jsonSerializableObjectSchema,
	}),
});

export const findFactionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_FACTION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listFactionsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_FACTIONS"),
	payload: z.object({}),
});

export const saveFactionPatronageRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_FACTION_PATRONAGE"),
	payload: z.object({
		patronage: jsonSerializableObjectSchema,
	}),
});

export const findFactionPatronageRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_FACTION_PATRONAGE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const findFactionPatronageByFactionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_FACTION_PATRONAGE_BY_FACTION"),
	payload: z.object({
		factionId: z.string().min(1),
	}),
});

export const listFactionPatronagesRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_FACTION_PATRONAGES"),
	payload: z.object({}),
});

export const saveReputationRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_REPUTATION"),
	payload: z.object({
		reputation: jsonSerializableObjectSchema,
	}),
});

export const findReputationRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_REPUTATION"),
	payload: z.object({
		characterId: z.string().min(1),
		factionId: z.string().min(1),
	}),
});

export const listReputationsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_REPUTATIONS"),
	payload: z.object({
		characterId: z.string().min(1),
	}),
});

export const saveBloodDebtRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_BLOOD_DEBT"),
	payload: z.object({
		debt: jsonSerializableObjectSchema,
	}),
});

export const listBloodDebtsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_BLOOD_DEBTS"),
	payload: z.object({
		characterId: z.string().min(1),
	}),
});

export const saveSocialLedgerRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_SOCIAL_LEDGER"),
	payload: z.object({
		ledger: jsonSerializableObjectSchema,
	}),
});

export const findSocialLedgerRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_SOCIAL_LEDGER"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveClockRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_CLOCK"),
	payload: z.object({
		clock: jsonSerializableObjectSchema,
	}),
});

export const findClockRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_CLOCK"),
	payload: z.object({
		id: z.string().uuid("ID inválido para o relógio"),
	}),
});

export const listClocksRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_CLOCKS"),
	payload: z.object({}),
});

export const deleteClockRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_CLOCK"),
	payload: z.object({
		id: z.string().uuid("ID inválido para o relógio"),
	}),
});

export const saveDialogueStateRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_DIALOGUE_STATE"),
	payload: z.object({
		dialogueState: jsonSerializableObjectSchema,
	}),
});

export const findDialogueStateRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_DIALOGUE_STATE"),
	payload: z.object({
		characterId: z.string().uuid("ID do personagem inválido"),
		npcId: z.string().min(1, "NPC ID inválido"),
	}),
});

export const deleteDialogueStateRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_DIALOGUE_STATE"),
	payload: z.object({
		id: z.string().uuid("ID de estado de diálogo inválido"),
	}),
});

export const saveQuestRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_QUEST"),
	payload: z.object({
		quest: jsonSerializableObjectSchema,
	}),
});

export const findQuestRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_QUEST"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listQuestsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_QUESTS"),
	payload: z.object({}),
});

export const deleteQuestRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_QUEST"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveQuestObjectiveRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_QUEST_OBJECTIVE"),
	payload: z.object({
		objective: jsonSerializableObjectSchema,
	}),
});

export const findQuestObjectiveRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_QUEST_OBJECTIVE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listQuestObjectivesByQuestRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_QUEST_OBJECTIVES_BY_QUEST"),
	payload: z.object({
		questId: z.string().min(1),
	}),
});

export const deleteQuestObjectiveRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_QUEST_OBJECTIVE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveLoreEncounterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_LORE_ENCOUNTER"),
	payload: z.object({
		encounter: jsonSerializableObjectSchema,
	}),
});

export const findLoreEncounterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_LORE_ENCOUNTER"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listLoreEncountersByTileRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_LORE_ENCOUNTERS_BY_TILE"),
	payload: z.object({
		tileId: z.string().min(1),
	}),
});

export const listAllLoreEncountersRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_ALL_LORE_ENCOUNTERS"),
	payload: z.object({}),
});

export const saveCampaignRumorRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_CAMPAIGN_RUMOR"),
	payload: z.object({
		rumor: jsonSerializableObjectSchema,
	}),
});

export const findCampaignRumorRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_CAMPAIGN_RUMOR"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listCampaignRumorsByTileRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_CAMPAIGN_RUMORS_BY_TILE"),
	payload: z.object({
		tileId: z.string().min(1),
	}),
});

export const listAllCampaignRumorsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_ALL_CAMPAIGN_RUMORS"),
	payload: z.object({}),
});

export const saveCohesionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_COHESION"),
	payload: z.object({
		cohesion: jsonSerializableObjectSchema,
	}),
});

export const findCohesionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_COHESION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveSignatureRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_SIGNATURE"),
	payload: z.object({
		signature: jsonSerializableObjectSchema,
	}),
});

export const findSignatureRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_SIGNATURE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listSignaturesRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_SIGNATURES"),
	payload: z.object({}),
});

export const deleteSignatureRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_SIGNATURE"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveTrapRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_TRAP"),
	payload: z.object({
		trap: jsonSerializableObjectSchema,
	}),
});

export const findTrapRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_TRAP"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listTrapsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_TRAPS"),
	payload: z.object({
		tileId: z.string().min(1),
	}),
});

export const deleteTrapRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_TRAP"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveCompanionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_COMPANION"),
	payload: z.object({
		companion: jsonSerializableObjectSchema,
	}),
});

export const findCompanionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_COMPANION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listCompanionsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_COMPANIONS"),
	payload: z.object({
		characterId: z.string().min(1),
	}),
});

export const saveInvestigationRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_INVESTIGATION"),
	payload: z.object({
		investigation: jsonSerializableObjectSchema,
	}),
});

export const findInvestigationRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_INVESTIGATION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listInvestigationsByTargetRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_INVESTIGATIONS_BY_TARGET"),
	payload: z.object({
		targetId: z.string().min(1),
	}),
});

export const listActiveInvestigationsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_ACTIVE_INVESTIGATIONS"),
	payload: z.object({}),
});

export const saveRegionalDomainRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_REGIONAL_DOMAIN"),
	payload: z.object({
		regionalDomain: jsonSerializableObjectSchema,
	}),
});

export const findRegionalDomainRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_REGIONAL_DOMAIN"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listRegionalDomainsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_REGIONAL_DOMAINS"),
	payload: z.object({}),
});

export const saveCampSessionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_CAMP_SESSION"),
	payload: z.object({
		campSession: jsonSerializableObjectSchema,
	}),
});

export const findCampSessionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_CAMP_SESSION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listCampSessionsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_CAMP_SESSIONS"),
	payload: z.object({}),
});

export const deleteCampSessionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_CAMP_SESSION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveMercenaryCompanyRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_MERCENARY_COMPANY"),
	payload: z.object({
		company: jsonSerializableObjectSchema,
	}),
});

export const findMercenaryCompanyRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_MERCENARY_COMPANY"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listMercenaryCompaniesRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_MERCENARY_COMPANIES"),
	payload: z.object({}),
});

export const saveMercenarySquadRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_MERCENARY_SQUAD"),
	payload: z.object({
		squad: jsonSerializableObjectSchema,
	}),
});

export const findMercenarySquadRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_MERCENARY_SQUAD"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listMercenarySquadsByCompanyRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_MERCENARY_SQUADS_BY_COMPANY"),
	payload: z.object({
		companyId: z.string().min(1),
	}),
});

export const saveEspionageCellRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_ESPIONAGE_CELL"),
	payload: z.object({
		cell: jsonSerializableObjectSchema,
	}),
});

export const findEspionageCellRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_ESPIONAGE_CELL"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const listEspionageCellsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_ESPIONAGE_CELLS"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const deleteEspionageCellRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_ESPIONAGE_CELL"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const dismantleCraftedItemRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DISMANTLE_CRAFTED_ITEM"),
	payload: z.object({
		characterId: z.string().min(1),
		itemId: z.string().min(1),
	}),
});

export const scrapEquipmentRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SCRAP_EQUIPMENT"),
	payload: z.object({
		equipmentId: z.string().min(1),
	}),
});

export const setWorldStateFlagRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SET_WORLD_STATE_FLAG"),
	payload: z.object({
		key: worldStateKeySchema,
		valueJson: z.string().min(1),
		updatedAt: isoTimestamp,
	}),
});

export const getWorldStateFlagRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_WORLD_STATE_FLAG"),
	payload: z.object({
		key: worldStateKeySchema,
	}),
});

export const listWorldStateFlagsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_WORLD_STATE_FLAGS"),
	payload: z.object({
		prefix: worldStateListPrefixSchema,
	}),
});

export const mutateWorldStateRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("MUTATE_WORLD_STATE"),
	payload: z.object({
		worldStateMutations: z
			.array(
				z.object({
					key: worldStateKeySchema,
					value: worldStateValueSchema,
				}),
			)
			.optional(),
		factionRenownMutations: z
			.array(
				z.object({
					characterId: z.string().min(1),
					factionId: z.string().min(1),
					value: z.number().int(),
				}),
			)
			.optional(),
	}),
});

export const tickClockManualRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("TICK_CLOCK_MANUAL"),
	payload: z.object({
		clockId: z.string().uuid("ID de relógio inválido"),
		delta: z.number().int(),
	}),
});

export const forceSpawnActorRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FORCE_SPAWN_ACTOR"),
	payload: z.object({
		actorId: z.string().min(1),
		label: z.string().min(1),
		profile: z.enum(["brute", "sniper", "controller"]),
		hitPoints: z.number().int().min(1),
		initiativeBase: z.number().int().min(0),
	}),
});

export const applyLevelUpRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("APPLY_LEVEL_UP"),
	payload: z.object({
		levelUpInput: jsonSerializableObjectSchema,
	}),
});

export const saveCombatEncounterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_COMBAT_ENCOUNTER"),
	payload: z.object({
		combatEncounter: jsonSerializableObjectSchema,
	}),
});

export const findCombatEncounterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_COMBAT_ENCOUNTER"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveCombatMonsterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_COMBAT_MONSTER"),
	payload: z.object({
		combatMonster: jsonSerializableObjectSchema,
	}),
});

export const findCombatMonstersByEncounterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_COMBAT_MONSTERS_BY_ENCOUNTER"),
	payload: z.object({
		combatEncounterId: z.string().min(1),
	}),
});

export const saveActiveSessionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_ACTIVE_SESSION"),
	payload: z.object({
		activeSession: jsonSerializableObjectSchema,
	}),
});

export const findActiveSessionRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_ACTIVE_SESSION"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const getAncestryCatalogRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_ANCESTRY_CATALOG"),
	payload: z.object({}),
});

export const getBackgroundCatalogRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_BACKGROUND_CATALOG"),
	payload: z.object({}),
});

export const getCharacterClassCatalogRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_CHARACTER_CLASS_CATALOG"),
	payload: z.object({}),
});

export const getSpellCatalogRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_SPELL_CATALOG"),
	payload: z.object({}),
});

export const saveDungeonDelveRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_DUNGEON_DELVE"),
	payload: z.object({
		delve: jsonSerializableObjectSchema,
	}),
});

export const findDungeonDelveRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_DUNGEON_DELVE"),
	payload: z.object({
		id: z.string().uuid(),
	}),
});

export const listDungeonDelvesRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_DUNGEON_DELVES"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const saveDungeonRoomRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_DUNGEON_ROOM"),
	payload: z.object({
		room: jsonSerializableObjectSchema,
	}),
});

export const findDungeonRoomsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_DUNGEON_ROOMS"),
	payload: z.object({
		delveId: z.string().uuid(),
	}),
});

export const findDungeonRoomByCoordsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_DUNGEON_ROOM_BY_COORDS"),
	payload: z.object({
		delveId: z.string().uuid(),
		coordinateX: z.number().int(),
		coordinateY: z.number().int(),
	}),
});

export const updateDungeonRoomStatusRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("UPDATE_DUNGEON_ROOM_STATUS"),
	payload: z.object({
		id: z.string(),
		status: z.enum(["hidden", "revealed", "cleared"]),
	}),
});

export const updateDungeonDelveStatusRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("UPDATE_DUNGEON_DELVE_STATUS"),
	payload: z.object({
		id: z.string().uuid(),
		status: z.enum(["active", "completed", "escaped", "failed"]),
		currentLevel: z.number().int(),
	}),
});

export const triggerSiegeRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("TRIGGER_SIEGE"),
	payload: z.object({
		campaignId: z.string().min(1),
		bastionId: z.string().min(1),
		factionId: z.string().min(1),
		dangerLevel: z.number().int().min(1),
		requestedAt: z.string().min(1),
		uuid: z.string().uuid().optional(),
	}),
});

export const resolveSiegeRoundRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("RESOLVE_SIEGE_ROUND"),
	payload: z.object({
		siegeId: z.string().uuid(),
		defenseRollBonus: z.number().int(),
		requestedAt: z.string().min(1),
		forcedAttackRoll: z.number().int().optional(),
		forcedDefenseRoll: z.number().int().optional(),
		squadIdsToDefend: z.array(z.string()).optional(),
	}),
});

export const findActiveSiegeRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_ACTIVE_SIEGE"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const listSiegeHistoryRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LIST_SIEGE_HISTORY"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const getCampaignRecessRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_CAMPAIGN_RECESS"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const addRecessDaysRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("ADD_RECESS_DAYS"),
	payload: z.object({
		campaignId: z.string().min(1),
		days: z.number().int(),
	}),
});

export const resolveDowntimeWeekRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("RESOLVE_DOWNTIME_WEEK"),
	payload: z.object({
		campaignId: z.string().min(1),
		location: z.enum(["city", "bastion"]),
		allocations: z.array(
			z.object({
				characterId: z.string().min(1),
				actionTag: z.string().min(1),
				params: jsonSerializableObjectSchema,
			}),
		),
	}),
});

export const getCampaignTimelineRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("GET_CAMPAIGN_TIMELINE"),
	payload: z.object({
		campaignId: z.string().min(1),
	}),
});

export const recordCampaignEventRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("RECORD_CAMPAIGN_EVENT"),
	payload: z.object({
		campaignId: z.string().min(1),
		eventType: z.string().min(1),
		description: z.string().min(1),
	}),
});

export const rpcRequestSchema = z.discriminatedUnion("type", [
	getCampaignTimelineRequestSchema,
	recordCampaignEventRequestSchema,
	getCampaignRecessRequestSchema,
	addRecessDaysRequestSchema,
	resolveDowntimeWeekRequestSchema,
	getAncestryCatalogRequestSchema,
	getBackgroundCatalogRequestSchema,
	getCharacterClassCatalogRequestSchema,
	getSpellCatalogRequestSchema,
	saveDungeonDelveRequestSchema,
	findDungeonDelveRequestSchema,
	listDungeonDelvesRequestSchema,
	saveDungeonRoomRequestSchema,
	findDungeonRoomsRequestSchema,
	findDungeonRoomByCoordsRequestSchema,
	updateDungeonRoomStatusRequestSchema,
	updateDungeonDelveStatusRequestSchema,
	setWorldStateFlagRequestSchema,
	getWorldStateFlagRequestSchema,
	listWorldStateFlagsRequestSchema,
	initDatabaseRequestSchema,
	saveGameSnapshotRequestSchema,
	loadGameSnapshotRequestSchema,
	saveCharacterRequestSchema,
	findCharacterRequestSchema,
	saveStatusEffectRequestSchema,
	findStatusEffectsRequestSchema,
	deleteStatusEffectRequestSchema,
	castSpellRequestSchema,
	saveBastionRequestSchema,
	findBastionRequestSchema,
	saveBastionModuleRequestSchema,
	findBastionModulesRequestSchema,
	deleteBastionModuleRequestSchema,
	saveFactionRequestSchema,
	findFactionRequestSchema,
	listFactionsRequestSchema,
	saveFactionPatronageRequestSchema,
	findFactionPatronageRequestSchema,
	findFactionPatronageByFactionRequestSchema,
	listFactionPatronagesRequestSchema,
	saveReputationRequestSchema,
	findReputationRequestSchema,
	listReputationsRequestSchema,
	saveBloodDebtRequestSchema,
	listBloodDebtsRequestSchema,
	saveSocialLedgerRequestSchema,
	findSocialLedgerRequestSchema,
	saveClockRequestSchema,
	findClockRequestSchema,
	listClocksRequestSchema,
	deleteClockRequestSchema,
	saveDialogueStateRequestSchema,
	findDialogueStateRequestSchema,
	deleteDialogueStateRequestSchema,
	saveQuestRequestSchema,
	findQuestRequestSchema,
	listQuestsRequestSchema,
	deleteQuestRequestSchema,
	saveQuestObjectiveRequestSchema,
	findQuestObjectiveRequestSchema,
	listQuestObjectivesByQuestRequestSchema,
	deleteQuestObjectiveRequestSchema,
	saveCohesionRequestSchema,
	findCohesionRequestSchema,
	saveSignatureRequestSchema,
	findSignatureRequestSchema,
	listSignaturesRequestSchema,
	deleteSignatureRequestSchema,
	saveTrapRequestSchema,
	findTrapRequestSchema,
	listTrapsRequestSchema,
	deleteTrapRequestSchema,
	saveCompanionRequestSchema,
	findCompanionRequestSchema,
	listCompanionsRequestSchema,
	saveInvestigationRequestSchema,
	findInvestigationRequestSchema,
	listInvestigationsByTargetRequestSchema,
	listActiveInvestigationsRequestSchema,
	saveRegionalDomainRequestSchema,
	findRegionalDomainRequestSchema,
	listRegionalDomainsRequestSchema,
	saveCampSessionRequestSchema,
	findCampSessionRequestSchema,
	listCampSessionsRequestSchema,
	deleteCampSessionRequestSchema,
	saveMercenaryCompanyRequestSchema,
	findMercenaryCompanyRequestSchema,
	listMercenaryCompaniesRequestSchema,
	saveMercenarySquadRequestSchema,
	findMercenarySquadRequestSchema,
	listMercenarySquadsByCompanyRequestSchema,
	saveEspionageCellRequestSchema,
	findEspionageCellRequestSchema,
	listEspionageCellsRequestSchema,
	deleteEspionageCellRequestSchema,
	dismantleCraftedItemRequestSchema,
	scrapEquipmentRequestSchema,
	listSaveSlotsRequestSchema,
	createSaveSlotRequestSchema,
	cloneSaveSlotRequestSchema,
	deleteSaveSlotRequestSchema,
	saveLoreEncounterRequestSchema,
	findLoreEncounterRequestSchema,
	listLoreEncountersByTileRequestSchema,
	listAllLoreEncountersRequestSchema,
	saveCampaignRumorRequestSchema,
	findCampaignRumorRequestSchema,
	listCampaignRumorsByTileRequestSchema,
	listAllCampaignRumorsRequestSchema,
	mutateWorldStateRequestSchema,
	tickClockManualRequestSchema,
	forceSpawnActorRequestSchema,
	applyLevelUpRequestSchema,
	saveCombatEncounterRequestSchema,
	findCombatEncounterRequestSchema,
	saveCombatMonsterRequestSchema,
	findCombatMonstersByEncounterRequestSchema,
	saveActiveSessionRequestSchema,
	findActiveSessionRequestSchema,
	triggerSiegeRequestSchema,
	resolveSiegeRoundRequestSchema,
	findActiveSiegeRequestSchema,
	listSiegeHistoryRequestSchema,
]);

const rpcErrorSchema = z.object({
	code: z
		.string()
		.trim()
		.regex(/^[A-Z][A-Z0-9_]*$/),
	message: z.string().trim().min(1).max(500),
	details: jsonSerializableValueSchema.optional(),
});

export const rpcSuccessResponseSchema = z.object({
	messageId: rpcMessageIdSchema,
	success: z.literal(true),
	data: jsonSerializableValueSchema.optional(),
});

export const rpcFailureResponseSchema = z.object({
	messageId: rpcMessageIdSchema,
	success: z.literal(false),
	error: rpcErrorSchema,
});

export const rpcResponseSchema = z.discriminatedUnion("success", [
	rpcSuccessResponseSchema,
	rpcFailureResponseSchema,
]);

export interface CreateRpcSuccessResponseInput {
	readonly messageId: string;
	readonly data?: JsonValue;
}

export interface CreateRpcFailureResponseInput {
	readonly messageId: string;
	readonly code: string;
	readonly message: string;
	readonly details?: JsonValue;
}

export function createRpcSuccessResponse(
	input: CreateRpcSuccessResponseInput,
): RpcResponse {
	if (input.data === undefined) {
		return {
			messageId: input.messageId,
			success: true,
		};
	}

	return {
		messageId: input.messageId,
		success: true,
		data: input.data,
	};
}

export function createRpcFailureResponse(
	input: CreateRpcFailureResponseInput,
): RpcResponse {
	if (input.details === undefined) {
		return {
			messageId: input.messageId,
			success: false,
			error: {
				code: input.code,
				message: input.message,
			},
		};
	}

	return {
		messageId: input.messageId,
		success: false,
		error: {
			code: input.code,
			message: input.message,
			details: input.details,
		},
	};
}

export function createRpcBridgeFailure(
	code: RpcBridgeFailureCode,
	message: string,
	details?: unknown,
): RpcBridgeFailure {
	if (details === undefined) {
		return { code, message };
	}

	return { code, message, details };
}

function isJsonSerializable(value: unknown): value is JsonValue {
	if (value === null) {
		return true;
	}

	if (typeof value === "string" || typeof value === "boolean") {
		return true;
	}

	if (typeof value === "number") {
		return Number.isFinite(value);
	}

	if (Array.isArray(value)) {
		return value.every((entry) => isJsonSerializable(entry));
	}

	if (isPlainRecord(value)) {
		return Object.values(value).every((entry) => isJsonSerializable(entry));
	}

	return false;
}

function isPlainJsonObject(value: unknown): value is JsonObject {
	if (!isPlainRecord(value)) {
		return false;
	}

	return Object.values(value).every((entry) => isJsonSerializable(entry));
}

function isPlainRecord(
	value: unknown,
): value is Readonly<Record<string, unknown>> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value) as unknown;
	return prototype === Object.prototype || prototype === null;
}

export type RpcRequest = z.infer<typeof rpcRequestSchema>;
export type RpcResponse = z.infer<typeof rpcResponseSchema>;
export type SaveGameSnapshot = z.infer<typeof saveGameSnapshotSchema>;
export type {
	JsonObject,
	JsonValue,
	RpcBridgeFailure,
	RpcBridgeFailureCode,
	RpcCommandType,
};
