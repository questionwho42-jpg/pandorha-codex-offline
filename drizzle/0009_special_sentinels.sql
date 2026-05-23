CREATE TABLE `campaign_dialogue_states` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`npc_id` text NOT NULL,
	`current_conversation_node_id` text NOT NULL,
	`dialogue_tree_id` text NOT NULL,
	`history_json` text NOT NULL,
	`unlocked_clues_json` text NOT NULL,
	`updated_at` text NOT NULL
);
