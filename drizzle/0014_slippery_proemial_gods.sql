CREATE TABLE `campaign_investigations` (
	`id` text PRIMARY KEY NOT NULL,
	`target_id` text NOT NULL,
	`target_name` text NOT NULL,
	`type` text NOT NULL,
	`tier` integer NOT NULL,
	`dc` integer NOT NULL,
	`successes_required` integer NOT NULL,
	`successes_accumulated` integer DEFAULT 0 NOT NULL,
	`failures_max` integer NOT NULL,
	`failures_accumulated` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`gold_cost_per_test` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
