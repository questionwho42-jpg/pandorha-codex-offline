CREATE TABLE `clocks` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`current_slices` integer NOT NULL,
	`max_slices` integer NOT NULL,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
