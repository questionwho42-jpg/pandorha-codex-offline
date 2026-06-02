CREATE TABLE `social_encounter_events` (
	`id` text PRIMARY KEY NOT NULL,
	`encounter_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	`command_id` text
);
--> statement-breakpoint
CREATE TABLE `social_encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`npc_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`status` text NOT NULL,
	`attitude` text NOT NULL,
	`mental_hp_current` integer NOT NULL,
	`mental_hp_max` integer NOT NULL,
	`patience_current` integer NOT NULL,
	`patience_max` integer NOT NULL,
	`persuasion_progress` integer NOT NULL,
	`persuasion_target` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
