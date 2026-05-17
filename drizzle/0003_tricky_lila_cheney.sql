CREATE TABLE `character_status_effects` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
