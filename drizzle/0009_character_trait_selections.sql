CREATE TABLE `character_trait_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`trait_id` text NOT NULL,
	`created_at` text NOT NULL
);
