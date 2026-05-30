CREATE TABLE `npc_relationships` (
	`npc_id` text PRIMARY KEY NOT NULL,
	`attitude` text NOT NULL,
	`status` text NOT NULL,
	`pressure_damage` integer NOT NULL,
	`applied_pressure_keys_json` text NOT NULL,
	`updated_at` text NOT NULL
);
