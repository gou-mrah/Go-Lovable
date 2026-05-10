ALTER TABLE `bookings` MODIFY COLUMN `currency` varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `flexible_requests` MODIFY COLUMN `currency` varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `hajj_programs` MODIFY COLUMN `currency` varchar(10) NOT NULL DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `currency` varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `provider_bookings` MODIFY COLUMN `currency` varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `provider_programs` MODIFY COLUMN `currency` varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE `umrah_programs` MODIFY COLUMN `currency` varchar(10) NOT NULL DEFAULT 'SAR';