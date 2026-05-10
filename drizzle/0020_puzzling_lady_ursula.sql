CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_id` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`summary` text,
	`url` varchar(1000),
	`image_url` text,
	`category` enum('hajj','umrah','general','official') NOT NULL DEFAULT 'general',
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`is_published` boolean NOT NULL DEFAULT true,
	`is_featured` boolean NOT NULL DEFAULT false,
	`published_at` bigint NOT NULL,
	`created_at` bigint NOT NULL,
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`type` enum('rss','scrape','manual') NOT NULL DEFAULT 'rss',
	`url` varchar(1000) NOT NULL,
	`logo_url` text,
	`category` enum('hajj','umrah','general','official') NOT NULL DEFAULT 'general',
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`is_active` boolean NOT NULL DEFAULT true,
	`fetch_interval` int NOT NULL DEFAULT 30,
	`last_fetched_at` bigint,
	`articles_count` int NOT NULL DEFAULT 0,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `news_sources_id` PRIMARY KEY(`id`)
);
