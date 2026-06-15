CREATE TABLE `inventory_events` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`type` text NOT NULL,
	`entry_id` text NOT NULL,
	`catalog_kind` text NOT NULL,
	`catalog_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` text NOT NULL
);
