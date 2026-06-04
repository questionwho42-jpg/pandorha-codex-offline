CREATE TABLE `campaign_rumors` (
	`id` text PRIMARY KEY NOT NULL,
	`tile_id` text NOT NULL,
	`faction_id` text,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_discovered` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tile_id`) REFERENCES `world_tiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `lore_encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`tile_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`faction_id_required` text,
	`reputation_required` integer DEFAULT 0,
	`required_clock_id` text,
	`required_clock_value` integer DEFAULT 0,
	`is_triggered` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tile_id`) REFERENCES `world_tiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faction_id_required`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE set null
);
