CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`concept` text NOT NULL,
	`ancestry_id` text NOT NULL,
	`class_id` text NOT NULL,
	`background_id` text NOT NULL,
	`level` integer NOT NULL,
	`physical` integer NOT NULL,
	`mental` integer NOT NULL,
	`social` integer NOT NULL,
	`conflict` integer NOT NULL,
	`interaction` integer NOT NULL,
	`resistance` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
