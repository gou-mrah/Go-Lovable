CREATE TABLE `waitlist_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`source` varchar(100) DEFAULT 'maintenance_page',
	`created_at` bigint NOT NULL,
	CONSTRAINT `waitlist_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_emails_email_unique` UNIQUE(`email`)
);
