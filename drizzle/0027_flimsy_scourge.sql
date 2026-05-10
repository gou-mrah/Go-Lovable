CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int,
	`customerId` int NOT NULL,
	`providerId` int NOT NULL,
	`subject` varchar(255),
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`lastMessageAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupon_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`bookingId` int,
	`discountUSD` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`discountType` enum('percent','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`minOrderUSD` decimal(10,2) DEFAULT '0',
	`maxDiscountUSD` decimal(10,2),
	`usageLimit` int,
	`usagePerUser` int DEFAULT 1,
	`usedCount` int DEFAULT 0,
	`serviceTypes` json,
	`providerId` int,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderRole` enum('customer','provider','admin') NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `package_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceType` enum('hajj','umrah','hotel','flight','tour','transport') NOT NULL,
	`serviceId` int NOT NULL,
	`userId` int,
	`sessionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `package_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`moyasarPaymentId` varchar(100),
	`amount` decimal(10,2) NOT NULL,
	`amountHalala` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('initiated','paid','failed','authorized','captured','refunded') NOT NULL DEFAULT 'initiated',
	`paymentMethod` varchar(50),
	`description` text,
	`callbackUrl` varchar(500),
	`metadata` json,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(64),
	`eventType` enum('view_package','search','add_wishlist','start_booking','complete_booking','share') NOT NULL,
	`serviceType` varchar(50),
	`serviceId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceType` enum('hajj','umrah','hotel','flight','tour') NOT NULL,
	`serviceId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `paymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `bookings` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `bookings` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `stripePaymentIntentId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `stripePaymentIntentId`;