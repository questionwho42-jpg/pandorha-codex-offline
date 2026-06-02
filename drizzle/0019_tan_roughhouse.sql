CREATE TABLE `campaign_events_history` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`event_type` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `campaign_siege_events` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`bastion_id` text NOT NULL,
	`faction_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`danger_level` integer DEFAULT 1 NOT NULL,
	`damage_points` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`bastion_id`) REFERENCES `bastions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE cascade
);
