CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`page` varchar(255) NOT NULL DEFAULT '/',
	`referrer` varchar(500),
	`user_agent` varchar(500),
	`device` enum('desktop','mobile','tablet') DEFAULT 'desktop',
	`ip` varchar(64),
	`country` varchar(100),
	`country_code` varchar(10),
	`city` varchar(100),
	`user_id` int,
	`created_at` bigint NOT NULL,
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
