CREATE TABLE `faction_standings` (
	`faction_id` text PRIMARY KEY NOT NULL,
	`fame_level` integer NOT NULL,
	`fame_xp` integer NOT NULL,
	`infamy_level` integer NOT NULL,
	`blood_debt` integer NOT NULL,
	`favor_points` integer NOT NULL,
	`intrigue_points` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `factions` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`kind` text NOT NULL,
	`source_file` text NOT NULL,
	`summary` text NOT NULL
);
