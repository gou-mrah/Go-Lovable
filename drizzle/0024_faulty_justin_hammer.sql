CREATE TABLE `customer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewerName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`reviewText` text,
	`productName` varchar(500),
	`productSku` varchar(100),
	`status` enum('approved','pending','hidden') NOT NULL DEFAULT 'approved',
	`source` varchar(50) DEFAULT 'zid',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_reviews_id` PRIMARY KEY(`id`)
);
