ALTER TABLE `hajj_booking_requests` ADD `passportNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `passportExpiry` varchar(50);--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `nationality` varchar(100);--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `dateOfBirth` varchar(50);--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `passportImageUrl` text;--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `paymentStatus` enum('unpaid','paid','refunded') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `paymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `hajj_booking_requests` ADD `totalSAR` decimal(10,2);--> statement-breakpoint
ALTER TABLE `hajj_international_packages` ADD `packageLevel` varchar(100);--> statement-breakpoint
ALTER TABLE `hajj_international_packages` ADD `airline` varchar(255);--> statement-breakpoint
ALTER TABLE `hajj_international_packages` ADD `makkahPeriod` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `hajj_international_packages` ADD `trainHaramain` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `hajj_international_packages` ADD `packageNotes` text;--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `packageNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `isAvailable` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `minyaSleeping` varchar(500);--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `arafatSleeping` varchar(500);--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `packageNotes` text;--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `ownerName` varchar(255);--> statement-breakpoint
ALTER TABLE `hajj_programs` ADD `branches` json;