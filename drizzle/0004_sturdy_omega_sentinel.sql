CREATE TABLE `character_crafted_items` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`equipment_id` text NOT NULL,
	`label` text NOT NULL,
	`is_sharp` integer NOT NULL,
	`is_reinforced` integer NOT NULL,
	`is_runic` integer NOT NULL,
	`durability_current` integer NOT NULL,
	`durability_max` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crafting_recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`target_equipment_id` text NOT NULL,
	`difficulty_class` integer NOT NULL,
	`copper_cost` integer NOT NULL,
	`materials_required_json` text NOT NULL
);
