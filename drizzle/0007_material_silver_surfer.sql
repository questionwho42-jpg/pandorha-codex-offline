CREATE TABLE `bastion_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`bastion_id` text NOT NULL,
	`module_id` text NOT NULL,
	`tier` integer NOT NULL,
	`progress_current` integer DEFAULT 0 NOT NULL,
	`progress_max` integer NOT NULL,
	`is_broken` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`bastion_id`) REFERENCES `bastions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bastions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`chassis_id` text NOT NULL,
	`tier` integer DEFAULT 0 NOT NULL,
	`structure` integer NOT NULL,
	`vigilance` integer NOT NULL,
	`logistics` integer NOT NULL,
	`integrity_current` integer NOT NULL,
	`threat_current` integer DEFAULT 0 NOT NULL,
	`vault_gold` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
