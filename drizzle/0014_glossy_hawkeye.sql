ALTER TABLE `suppliers` MODIFY COLUMN `code` varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` MODIFY COLUMN `type` enum('individual','company') NOT NULL DEFAULT 'company';--> statement-breakpoint
ALTER TABLE `suppliers` MODIFY COLUMN `country` varchar(100);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `company_name` varchar(255);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `license_number` varchar(100);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `commercial_register_number` varchar(100);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `license_file_url` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `commercial_register_url` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `whatsapp` varchar(30);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `website` varchar(500);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `country_code` varchar(10);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `address` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `approval_status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `approval_notes` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `approved_at` bigint;