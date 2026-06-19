CREATE TABLE `equipment_durability_events` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`inventory_entry_id` text NOT NULL,
	`type` text NOT NULL,
	`condition` text NOT NULL,
	`created_at` text NOT NULL
);
