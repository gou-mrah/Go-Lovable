ALTER TABLE `users` ADD `verificationToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `googleId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `nationality` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `passportNumber` varchar(50);