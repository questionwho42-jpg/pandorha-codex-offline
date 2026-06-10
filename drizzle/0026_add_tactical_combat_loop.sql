CREATE TABLE `active_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`combat_encounter_id` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`combat_encounter_id`) REFERENCES `combat_encounters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `combat_encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`turn` integer DEFAULT 1 NOT NULL,
	`round` integer DEFAULT 1 NOT NULL,
	`initiative_order_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `combat_monsters` (
	`id` text PRIMARY KEY NOT NULL,
	`combat_encounter_id` text NOT NULL,
	`monster_id` text NOT NULL,
	`name` text NOT NULL,
	`hp_current` integer NOT NULL,
	`hp_max` integer NOT NULL,
	`ee_current` integer NOT NULL,
	`ee_max` integer NOT NULL,
	`tactical_role` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`combat_encounter_id`) REFERENCES `combat_encounters`(`id`) ON UPDATE no action ON DELETE cascade
);
