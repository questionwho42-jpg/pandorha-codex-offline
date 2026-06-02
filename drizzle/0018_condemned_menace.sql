CREATE TABLE `dungeon_delves` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`seed` integer NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`danger_level` integer DEFAULT 1 NOT NULL,
	`biome` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dungeon_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`delve_id` text NOT NULL,
	`room_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'hidden' NOT NULL,
	`connections_csv` text NOT NULL,
	`coordinate_x` integer NOT NULL,
	`coordinate_y` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`delve_id`) REFERENCES `dungeon_delves`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `campaign_investigations` ADD `translated_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_investigations` ADD `discovered_secrets` text DEFAULT '' NOT NULL;