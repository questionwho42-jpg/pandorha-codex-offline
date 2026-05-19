CREATE TABLE `camp_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`character_id` text NOT NULL,
	`activity_id` text NOT NULL,
	`hour` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `camp_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`current_hour` integer NOT NULL,
	`danger` integer NOT NULL,
	`status` text NOT NULL,
	`fortify_clock_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
