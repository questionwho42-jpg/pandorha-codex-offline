CREATE TABLE `campaign_social_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`fame_xp` integer DEFAULT 0 NOT NULL,
	`fame_level` integer DEFAULT 0 NOT NULL,
	`favor_points` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `summon_companions` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`sub_model` text NOT NULL,
	`tier` integer DEFAULT 1 NOT NULL,
	`hp_current` integer NOT NULL,
	`hp_max` integer NOT NULL,
	`is_share_sensory` integer DEFAULT false NOT NULL,
	`is_dissipated` integer DEFAULT false NOT NULL,
	`selected_traits_json` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action
);
