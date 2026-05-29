CREATE TABLE `faction_patronages` (
	`id` text PRIMARY KEY NOT NULL,
	`faction_id` text NOT NULL,
	`fama_level` integer DEFAULT 1 NOT NULL,
	`blood_debt` integer DEFAULT 0 NOT NULL,
	`relics_count` integer DEFAULT 0 NOT NULL,
	`ultimatum_weeks_remaining` integer,
	`is_alma_pledged` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `espionage_cells` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`faction_id` text NOT NULL,
	`region_id` text NOT NULL,
	`tenente_companion_id` text NOT NULL,
	`specialized_axis` text NOT NULL,
	`tier` integer DEFAULT 1 NOT NULL,
	`is_lockdown` integer DEFAULT false NOT NULL,
	`lockdown_weeks_remaining` integer DEFAULT 0 NOT NULL,
	`vigilance_heat` integer DEFAULT 0 NOT NULL,
	`method_of_control` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenente_companion_id`) REFERENCES `summon_companions`(`id`) ON UPDATE no action ON DELETE no action
);
