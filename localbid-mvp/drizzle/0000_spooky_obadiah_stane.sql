CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`addressType` enum('home','work','shop','other') NOT NULL,
	`street` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`zipCode` varchar(20) NOT NULL,
	`country` varchar(100) DEFAULT 'USA',
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`bidsSubmitted` int DEFAULT 0,
	`bidsWon` int DEFAULT 0,
	`totalRevenue` decimal(12,2) DEFAULT '0',
	`averageWinPrice` decimal(10,2),
	`winRate` decimal(5,2),
	`ordersCompleted` int DEFAULT 0,
	`averageRating` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`shopId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`availability` enum('in_stock','can_order','limited') DEFAULT 'in_stock',
	`deliveryAvailable` boolean DEFAULT false,
	`deliveryPrice` decimal(10,2) DEFAULT '0',
	`notes` text,
	`photos` json,
	`status` enum('active','accepted','rejected','withdrawn') DEFAULT 'active',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bids_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueBidPerShop` UNIQUE(`requestId`,`shopId`)
);
--> statement-breakpoint
CREATE TABLE `customerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bio` text,
	`averageRating` decimal(3,2) DEFAULT '0',
	`totalReviews` int DEFAULT 0,
	`requestsCreated` int DEFAULT 0,
	`ordersCompleted` int DEFAULT 0,
	`isPremium` boolean DEFAULT false,
	`premiumExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `favoriteShops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`shopId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoriteShops_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueFavorite` UNIQUE(`customerId`,`shopId`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('bid_received','bid_accepted','bid_rejected','order_ready','order_completed','review_received','message_received') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedEntityId` int,
	`relatedEntityType` varchar(50),
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`requestId` int NOT NULL,
	`bidId` int NOT NULL,
	`customerId` int NOT NULL,
	`shopId` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) DEFAULT '0',
	`shopAmount` decimal(10,2) NOT NULL,
	`paymentStatus` enum('pending','authorized','captured','failed','refunded') DEFAULT 'pending',
	`fulfillmentStatus` enum('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`pickupCode` varchar(10),
	`pickupCodeVerifiedAt` timestamp,
	`estimatedPickupDate` timestamp,
	`actualPickupDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`quantity` int DEFAULT 1,
	`searchRadiusMiles` int DEFAULT 10,
	`budgetMin` decimal(10,2),
	`budgetMax` decimal(10,2),
	`bidDurationHours` int DEFAULT 24,
	`photos` json,
	`status` enum('active','closed','expired','cancelled') DEFAULT 'active',
	`expiresAt` timestamp,
	`addressId` int,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`bidsCount` int DEFAULT 0,
	`lowestBidPrice` decimal(10,2),
	`averageBidPrice` decimal(10,2),
	`acceptedBidId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`revieweeId` int NOT NULL,
	`reviewType` enum('customer_to_shop','shop_to_customer') NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`photos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`businessLicense` varchar(255),
	`taxId` varchar(255),
	`description` text,
	`logo` text,
	`bannerImage` text,
	`categories` json,
	`operatingHoursJson` json,
	`serviceRadiusMiles` int DEFAULT 10,
	`averageRating` decimal(3,2) DEFAULT '0',
	`totalReviews` int DEFAULT 0,
	`bidsSubmitted` int DEFAULT 0,
	`bidsWon` int DEFAULT 0,
	`totalRevenue` decimal(12,2) DEFAULT '0',
	`subscription` enum('free','professional','enterprise') DEFAULT 'free',
	`subscriptionExpiresAt` timestamp,
	`isVerified` boolean DEFAULT false,
	`verifiedAt` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `shopProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`type` enum('payment','refund','payout') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`stripeTransactionId` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text,
	`phone` varchar(20),
	`accountType` enum('customer','shop','admin') NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`profileImage` text,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticsSnapshots` ADD CONSTRAINT `analyticsSnapshots_shopId_users_id_fk` FOREIGN KEY (`shopId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bids` ADD CONSTRAINT `bids_requestId_requests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bids` ADD CONSTRAINT `bids_shopId_users_id_fk` FOREIGN KEY (`shopId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerProfiles` ADD CONSTRAINT `customerProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteShops` ADD CONSTRAINT `favoriteShops_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoriteShops` ADD CONSTRAINT `favoriteShops_shopId_users_id_fk` FOREIGN KEY (`shopId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_requestId_requests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_bidId_bids_id_fk` FOREIGN KEY (`bidId`) REFERENCES `bids`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_shopId_users_id_fk` FOREIGN KEY (`shopId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `requests_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `requests_addressId_addresses_id_fk` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewerId_users_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_revieweeId_users_id_fk` FOREIGN KEY (`revieweeId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shopProfiles` ADD CONSTRAINT `shopProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `addresses` (`userId`);--> statement-breakpoint
CREATE INDEX `shopIdIdx` ON `analyticsSnapshots` (`shopId`);--> statement-breakpoint
CREATE INDEX `snapshotDateIdx` ON `analyticsSnapshots` (`snapshotDate`);--> statement-breakpoint
CREATE INDEX `requestIdIdx` ON `bids` (`requestId`);--> statement-breakpoint
CREATE INDEX `shopIdIdx` ON `bids` (`shopId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `bids` (`status`);--> statement-breakpoint
CREATE INDEX `customerIdIdx` ON `favoriteShops` (`customerId`);--> statement-breakpoint
CREATE INDEX `shopIdIdx` ON `favoriteShops` (`shopId`);--> statement-breakpoint
CREATE INDEX `orderIdIdx` ON `messages` (`orderId`);--> statement-breakpoint
CREATE INDEX `senderIdIdx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `recipientIdIdx` ON `messages` (`recipientId`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `typeIdx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `isReadIdx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `orderNumberIdx` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `customerIdIdx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `shopIdIdx` ON `orders` (`shopId`);--> statement-breakpoint
CREATE INDEX `paymentStatusIdx` ON `orders` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `fulfillmentStatusIdx` ON `orders` (`fulfillmentStatus`);--> statement-breakpoint
CREATE INDEX `customerIdIdx` ON `requests` (`customerId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `categoryIdx` ON `requests` (`category`);--> statement-breakpoint
CREATE INDEX `expiresAtIdx` ON `requests` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `orderIdIdx` ON `reviews` (`orderId`);--> statement-breakpoint
CREATE INDEX `reviewerIdIdx` ON `reviews` (`reviewerId`);--> statement-breakpoint
CREATE INDEX `revieweeIdIdx` ON `reviews` (`revieweeId`);--> statement-breakpoint
CREATE INDEX `subscriptionIdx` ON `shopProfiles` (`subscription`);--> statement-breakpoint
CREATE INDEX `verifiedIdx` ON `shopProfiles` (`isVerified`);--> statement-breakpoint
CREATE INDEX `orderIdIdx` ON `transactions` (`orderId`);--> statement-breakpoint
CREATE INDEX `typeIdx` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `emailIdx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `accountTypeIdx` ON `users` (`accountType`);