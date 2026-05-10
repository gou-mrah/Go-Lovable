ALTER TABLE `visa_applications` ADD `feeSAR` decimal(10,2);--> statement-breakpoint
ALTER TABLE `visa_applications` ADD `paymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `visa_applications` ADD `paymentStatus` enum('unpaid','paid','refunded') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `visa_applications` ADD `paidAt` timestamp;