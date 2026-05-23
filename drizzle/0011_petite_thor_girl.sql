CREATE TABLE `campaign_cohesion` (
	`id` text PRIMARY KEY NOT NULL,
	`cohesion_level` integer DEFAULT 1 NOT NULL,
	`cohesion_points` integer DEFAULT 1 NOT NULL,
	`active_players` integer DEFAULT 4 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registered_signatures` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`opening_tact_id` text NOT NULL,
	`reinforce_tact_id` text,
	`detonation_tact_id` text NOT NULL,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
