CREATE TABLE `mercenary_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`bastion_id` text,
	`tier` integer DEFAULT 1 NOT NULL,
	`reputation` integer DEFAULT 0 NOT NULL,
	`hq_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mercenary_squads` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`name` text NOT NULL,
	`physical` integer DEFAULT 0 NOT NULL,
	`mental` integer DEFAULT 0 NOT NULL,
	`social` integer DEFAULT 0 NOT NULL,
	`cohesion_max` integer DEFAULT 10 NOT NULL,
	`cohesion_current` integer DEFAULT 10 NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`command_tactic` text DEFAULT 'honorable' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`assigned_mission_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `mercenary_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
