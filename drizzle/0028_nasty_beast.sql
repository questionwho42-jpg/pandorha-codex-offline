CREATE TABLE `campaign_recess` (
	`id` text PRIMARY KEY NOT NULL,
	`recess_days` integer DEFAULT 7 NOT NULL,
	`current_date_days` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `downtime_action_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`week_index` integer NOT NULL,
	`action_tag` text NOT NULL,
	`roll_result` integer,
	`outcome_details` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
