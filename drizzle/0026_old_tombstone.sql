CREATE TABLE `booking_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingRef` varchar(36) NOT NULL,
	`providerId` int NOT NULL,
	`programId` int,
	`customerId` int,
	`customerName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`providerReply` text,
	`providerRepliedAt` timestamp,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provider_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`type` enum('new_booking','booking_cancelled','booking_completed','new_review','subscription_expiring','subscription_expired','upgrade_approved','upgrade_rejected','application_approved','application_rejected','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedId` int,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `provider_notifications_id` PRIMARY KEY(`id`)
);
