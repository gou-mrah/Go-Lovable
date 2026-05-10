ALTER TABLE `marketers` ADD `user_id` int;--> statement-breakpoint
ALTER TABLE `marketers` ADD `approval_status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketers` ADD `approved_at` bigint;