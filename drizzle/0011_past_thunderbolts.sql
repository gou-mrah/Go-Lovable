CREATE TABLE `hero_ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`subtitle` varchar(500),
	`media_url` varchar(1000) NOT NULL,
	`media_type` enum('image','video') NOT NULL DEFAULT 'image',
	`link_url` varchar(500),
	`link_label` varchar(100),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `hero_ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_fields_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service_tab` varchar(50) NOT NULL,
	`field_key` varchar(100) NOT NULL,
	`label_ar` varchar(200) NOT NULL,
	`label_en` varchar(200) NOT NULL,
	`field_type` enum('text','select','date','number','city') NOT NULL DEFAULT 'text',
	`placeholder` varchar(200),
	`options` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`created_at` bigint NOT NULL,
	CONSTRAINT `search_fields_config_id` PRIMARY KEY(`id`)
);
