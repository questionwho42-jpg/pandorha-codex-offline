CREATE TABLE `traps` (
	`id` text PRIMARY KEY NOT NULL,
	`tile_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`dc` integer NOT NULL,
	`damage` integer NOT NULL,
	`is_detected` integer DEFAULT false NOT NULL,
	`is_disarmed` integer DEFAULT false NOT NULL,
	`is_triggered` integer DEFAULT false NOT NULL,
	`effects` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);