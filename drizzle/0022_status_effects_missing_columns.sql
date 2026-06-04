ALTER TABLE `character_status_effects` ADD `severity` integer DEFAULT 1 NOT NULL;
ALTER TABLE `character_status_effects` ADD `severity_max` integer DEFAULT 3 NOT NULL;
ALTER TABLE `character_status_effects` ADD `is_aggravated` integer DEFAULT 0 NOT NULL;
ALTER TABLE `character_status_effects` ADD `metadata` text;
ALTER TABLE `character_status_effects` ADD `updated_at` text DEFAULT '' NOT NULL;
