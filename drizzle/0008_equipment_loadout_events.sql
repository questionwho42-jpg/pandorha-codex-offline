CREATE TABLE `equipment_loadout_events` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`type` text NOT NULL,
	`slot` text NOT NULL,
	`inventory_entry_id` text,
	`created_at` text NOT NULL
);
