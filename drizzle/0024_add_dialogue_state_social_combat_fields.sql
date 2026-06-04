ALTER TABLE `campaign_dialogue_states` ADD `patience_current` integer NOT NULL DEFAULT 0;
ALTER TABLE `campaign_dialogue_states` ADD `patience_max` integer NOT NULL DEFAULT 0;
ALTER TABLE `campaign_dialogue_states` ADD `persuasion_current` integer NOT NULL DEFAULT 0;
ALTER TABLE `campaign_dialogue_states` ADD `persuasion_max` integer NOT NULL DEFAULT 0;
ALTER TABLE `campaign_dialogue_states` ADD `attitude` text NOT NULL DEFAULT 'neutral';
ALTER TABLE `campaign_dialogue_states` ADD `fatigue_counters_json` text NOT NULL DEFAULT '{}';
