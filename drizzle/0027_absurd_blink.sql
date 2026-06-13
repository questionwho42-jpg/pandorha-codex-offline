CREATE TABLE `ancestries` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`epithet` text NOT NULL,
	`source_file` text NOT NULL,
	`initial_bonus` text NOT NULL,
	`primordial_ability_name` text NOT NULL,
	`primordial_ability_description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ancestry_trait_links` (
	`ancestry_id` text NOT NULL,
	`trait_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ancestry_traits` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`description` text NOT NULL,
	`source_file` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backgrounds` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`epithet` text NOT NULL,
	`source_file` text NOT NULL,
	`origin_ability_name` text NOT NULL,
	`origin_ability_description` text NOT NULL,
	`talent_choice_count` integer NOT NULL,
	`talent_options_text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`epithet` text NOT NULL,
	`source_file` text NOT NULL,
	`primary_attributes_text` text NOT NULL,
	`base_hp` integer NOT NULL,
	`resource_text` text NOT NULL,
	`equipment_text` text NOT NULL,
	`passive_ability_name` text NOT NULL,
	`passive_ability_description` text NOT NULL,
	`initial_talent_choice_count` integer NOT NULL,
	`initial_talent_options_text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `spells` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`circle` integer NOT NULL,
	`ether_cost` integer NOT NULL,
	`school` text NOT NULL,
	`casting_kind` text NOT NULL,
	`components` text NOT NULL,
	`requires_attack_roll` integer NOT NULL,
	`requires_saving_throw` integer NOT NULL,
	`damage_text` text,
	`tags` text NOT NULL,
	`source_file` text NOT NULL,
	`summary` text NOT NULL,
	`target_effects` text NOT NULL,
	`base_duration` integer NOT NULL,
	`upcast_formula` text NOT NULL
);
