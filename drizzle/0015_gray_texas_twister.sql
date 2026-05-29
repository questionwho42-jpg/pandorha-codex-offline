CREATE TABLE `campaign_regional_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`tier` integer NOT NULL,
	`physical_level` integer DEFAULT 0 NOT NULL,
	`mental_level` integer DEFAULT 0 NOT NULL,
	`social_level` integer DEFAULT 0 NOT NULL,
	`regent_id` text,
	`weeks_away` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `campaign_camp_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`total_time` integer NOT NULL,
	`sleep_hours` integer NOT NULL,
	`available_actions` integer NOT NULL,
	`danger_counter` integer DEFAULT 0 NOT NULL,
	`active_activities_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
