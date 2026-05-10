CREATE TABLE `media_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('news','alert','article','announcement') NOT NULL DEFAULT 'news',
	`category` enum('hajj','umrah','hotels','flights','visa','store','tours','transport','general') NOT NULL DEFAULT 'general',
	`title` varchar(500) NOT NULL,
	`summary` text,
	`content` text,
	`image_url` varchar(1000),
	`author` varchar(200),
	`is_published` boolean NOT NULL DEFAULT false,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`is_breaking` boolean NOT NULL DEFAULT false,
	`views` int NOT NULL DEFAULT 0,
	`published_at` bigint,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `media_posts_id` PRIMARY KEY(`id`)
);
