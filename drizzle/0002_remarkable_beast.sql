CREATE TABLE `blood_debts` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`target_name` text NOT NULL,
	`debt_value` integer DEFAULT 1 NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `character_reputation` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`faction_id` text NOT NULL,
	`reputation_value` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `factions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`alignment` text NOT NULL
);
