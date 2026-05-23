import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignDialogueStates = sqliteTable("campaign_dialogue_states", {
	id: text("id").primaryKey(),
	characterId: text("character_id").notNull(),
	npcId: text("npc_id").notNull(),
	currentConversationNodeId: text("current_conversation_node_id").notNull(),
	dialogueTreeId: text("dialogue_tree_id").notNull(),
	historyJson: text("history_json").notNull(), // JSON stringificado de string[]
	unlockedCluesJson: text("unlocked_clues_json").notNull(), // JSON stringificado de string[]
	updatedAt: text("updated_at").notNull(),
});

// Zod validation schemas
export const dialogueStateSelectSchema = createSelectSchema(
	campaignDialogueStates,
).extend({
	id: z.string().uuid("ID inválido para o estado de diálogo"),
	characterId: z.string().uuid("ID inválido para o personagem"),
	npcId: z.string().min(1, "O ID do NPC é obrigatório"),
	currentConversationNodeId: z
		.string()
		.min(1, "O ID do nó atual é obrigatório"),
	dialogueTreeId: z.string().min(1, "O ID da árvore de diálogo é obrigatório"),
	historyJson: z.string().min(2, "Formato de histórico inválido"),
	unlockedCluesJson: z.string().min(2, "Formato de pistas inválido"),
	updatedAt: z.string(),
});

export const dialogueStateInsertSchema = createInsertSchema(
	campaignDialogueStates,
).extend({
	id: z.string().uuid("ID inválido para o estado de diálogo"),
	characterId: z.string().uuid("ID inválido para o personagem"),
	npcId: z.string().min(1, "O ID do NPC é obrigatório"),
	currentConversationNodeId: z
		.string()
		.min(1, "O ID do nó atual é obrigatório"),
	dialogueTreeId: z.string().min(1, "O ID da árvore de diálogo é obrigatório"),
	historyJson: z.string().default("[]"),
	unlockedCluesJson: z.string().default("[]"),
	updatedAt: z.string(),
});

export type DialogueStateData = z.infer<typeof dialogueStateSelectSchema>;
export type NewDialogueStateData = z.infer<typeof dialogueStateInsertSchema>;
