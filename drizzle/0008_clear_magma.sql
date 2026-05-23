CREATE TABLE `progress_clocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`total_segments` integer NOT NULL,
	`filled_segments` integer DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`trigger_event` text
);
