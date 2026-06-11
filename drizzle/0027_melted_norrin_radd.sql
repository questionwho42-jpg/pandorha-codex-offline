CREATE TABLE `quest_objectives` (
	`id` text PRIMARY KEY NOT NULL,
	`quest_id` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL,
	`current_amount` integer DEFAULT 0 NOT NULL,
	`required_amount` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `campaign_quests` ADD `scope` text DEFAULT 'campaign' NOT NULL;
