CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`roleId` int,
	`section` varchar(100) NOT NULL,
	`canView` boolean DEFAULT true,
	`canCreate` boolean DEFAULT false,
	`canEdit` boolean DEFAULT false,
	`canDelete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provider_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`companyNameAr` varchar(255),
	`companyType` varchar(100),
	`licenseNumber` varchar(100),
	`licenseExpiry` varchar(50),
	`licenseAuthority` varchar(255),
	`contactName` varchar(255) NOT NULL,
	`contactPhone` varchar(100) NOT NULL,
	`contactWhatsapp` varchar(100),
	`contactEmail` varchar(255) NOT NULL,
	`website` varchar(500),
	`country` varchar(100) DEFAULT 'SA',
	`city` varchar(100),
	`address` text,
	`serviceTypes` json DEFAULT ('[]'),
	`description` text,
	`licenseDocUrl` text,
	`commercialRegUrl` text,
	`status` enum('pending','under_review','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `provider_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100),
	`description` text,
	`color` varchar(20) DEFAULT '#6B7280',
	`isSystem` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
