import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * LOCALBID DATABASE SCHEMA
 * Two-sided marketplace connecting customers with local shops through competitive bidding
 */

// ============================================================================
// CORE USER TABLES
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }),
    name: text("name"),
    phone: varchar("phone", { length: 20 }),
    accountType: mysqlEnum("accountType", ["customer", "shop", "admin"]).notNull(),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    profileImage: text("profileImage"),
    isVerified: boolean("isVerified").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("emailIdx").on(table.email),
    accountTypeIdx: index("accountTypeIdx").on(table.accountType),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// CUSTOMER PROFILE
// ============================================================================

export const customerProfiles = mysqlTable(
  "customerProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    bio: text("bio"),
    averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
    totalReviews: int("totalReviews").default(0),
    requestsCreated: int("requestsCreated").default(0),
    ordersCompleted: int("ordersCompleted").default(0),
    isPremium: boolean("isPremium").default(false),
    premiumExpiresAt: timestamp("premiumExpiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;

// ============================================================================
// SHOP PROFILE
// ============================================================================

export const shopProfiles = mysqlTable(
  "shopProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    businessName: varchar("businessName", { length: 255 }).notNull(),
    businessLicense: varchar("businessLicense", { length: 255 }),
    taxId: varchar("taxId", { length: 255 }),
    description: text("description"),
    logo: text("logo"),
    bannerImage: text("bannerImage"),
    categories: json("categories").$type<string[]>(),
    operatingHoursJson: json("operatingHoursJson").$type<Record<string, { open: string; close: string }>>(),
    serviceRadiusMiles: int("serviceRadiusMiles").default(10),
    averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
    totalReviews: int("totalReviews").default(0),
    bidsSubmitted: int("bidsSubmitted").default(0),
    bidsWon: int("bidsWon").default(0),
    totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
    subscription: mysqlEnum("subscription", ["free", "professional", "enterprise"]).default("free"),
    subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
    isVerified: boolean("isVerified").default(false),
    verifiedAt: timestamp("verifiedAt"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    subscriptionIdx: index("subscriptionIdx").on(table.subscription),
    verifiedIdx: index("verifiedIdx").on(table.isVerified),
  })
);

export type ShopProfile = typeof shopProfiles.$inferSelect;
export type InsertShopProfile = typeof shopProfiles.$inferInsert;

// ============================================================================
// ADDRESSES (For customers and shops)
// ============================================================================

export const addresses = mysqlTable(
  "addresses",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    addressType: mysqlEnum("addressType", ["home", "work", "shop", "other"]).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    zipCode: varchar("zipCode", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).default("USA"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    isDefault: boolean("isDefault").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

// ============================================================================
// PRODUCT REQUESTS (Core feature)
// ============================================================================

export const requests = mysqlTable(
  "requests",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    quantity: int("quantity").default(1),
    searchRadiusMiles: int("searchRadiusMiles").default(10),
    budgetMin: decimal("budgetMin", { precision: 10, scale: 2 }),
    budgetMax: decimal("budgetMax", { precision: 10, scale: 2 }),
    bidDurationHours: int("bidDurationHours").default(24),
    photos: json("photos").$type<string[]>(),
    status: mysqlEnum("status", ["active", "closed", "expired", "cancelled"]).default("active"),
    expiresAt: timestamp("expiresAt"),
    addressId: int("addressId"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    bidsCount: int("bidsCount").default(0),
    lowestBidPrice: decimal("lowestBidPrice", { precision: 10, scale: 2 }),
    averageBidPrice: decimal("averageBidPrice", { precision: 10, scale: 2 }),
    acceptedBidId: int("acceptedBidId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    customerIdIdx: index("customerIdIdx").on(table.customerId),
    statusIdx: index("statusIdx").on(table.status),
    categoryIdx: index("categoryIdx").on(table.category),
    expiresAtIdx: index("expiresAtIdx").on(table.expiresAt),
    customerIdFk: foreignKey({ columns: [table.customerId], foreignColumns: [users.id] }).onDelete("cascade"),
    addressIdFk: foreignKey({ columns: [table.addressId], foreignColumns: [addresses.id] }).onDelete("set null"),
  })
);

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

// ============================================================================
// BIDS (Core feature)
// ============================================================================

export const bids = mysqlTable(
  "bids",
  {
    id: int("id").autoincrement().primaryKey(),
    requestId: int("requestId").notNull(),
    shopId: int("shopId").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    availability: mysqlEnum("availability", ["in_stock", "can_order", "limited"]).default("in_stock"),
    deliveryAvailable: boolean("deliveryAvailable").default(false),
    deliveryPrice: decimal("deliveryPrice", { precision: 10, scale: 2 }).default("0"),
    notes: text("notes"),
    photos: json("photos").$type<string[]>(),
    status: mysqlEnum("status", ["active", "accepted", "rejected", "withdrawn"]).default("active"),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
    acceptedAt: timestamp("acceptedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    requestIdIdx: index("requestIdIdx").on(table.requestId),
    shopIdIdx: index("shopIdIdx").on(table.shopId),
    statusIdx: index("statusIdx").on(table.status),
    uniqueBidPerShop: unique("uniqueBidPerShop").on(table.requestId, table.shopId),
    requestIdFk: foreignKey({ columns: [table.requestId], foreignColumns: [requests.id] }).onDelete("cascade"),
    shopIdFk: foreignKey({ columns: [table.shopId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;

// ============================================================================
// ORDERS (Completed transactions)
// ============================================================================

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    requestId: int("requestId").notNull(),
    bidId: int("bidId").notNull(),
    customerId: int("customerId").notNull(),
    shopId: int("shopId").notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal("platformFee", { precision: 10, scale: 2 }).default("0"),
    shopAmount: decimal("shopAmount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "authorized", "captured", "failed", "refunded"]).default("pending"),
    fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["pending", "preparing", "ready", "completed", "cancelled"]).default("pending"),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    pickupCode: varchar("pickupCode", { length: 10 }),
    pickupCodeVerifiedAt: timestamp("pickupCodeVerifiedAt"),
    estimatedPickupDate: timestamp("estimatedPickupDate"),
    actualPickupDate: timestamp("actualPickupDate"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderNumberIdx: index("orderNumberIdx").on(table.orderNumber),
    customerIdIdx: index("customerIdIdx").on(table.customerId),
    shopIdIdx: index("shopIdIdx").on(table.shopId),
    paymentStatusIdx: index("paymentStatusIdx").on(table.paymentStatus),
    fulfillmentStatusIdx: index("fulfillmentStatusIdx").on(table.fulfillmentStatus),
    requestIdFk: foreignKey({ columns: [table.requestId], foreignColumns: [requests.id] }).onDelete("cascade"),
    bidIdFk: foreignKey({ columns: [table.bidId], foreignColumns: [bids.id] }).onDelete("cascade"),
    customerIdFk: foreignKey({ columns: [table.customerId], foreignColumns: [users.id] }).onDelete("cascade"),
    shopIdFk: foreignKey({ columns: [table.shopId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    reviewerId: int("reviewerId").notNull(),
    revieweeId: int("revieweeId").notNull(),
    reviewType: mysqlEnum("reviewType", ["customer_to_shop", "shop_to_customer"]).notNull(),
    rating: int("rating").notNull(), // 1-5
    comment: text("comment"),
    photos: json("photos").$type<string[]>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderIdIdx").on(table.orderId),
    reviewerIdIdx: index("reviewerIdIdx").on(table.reviewerId),
    revieweeIdIdx: index("revieweeIdIdx").on(table.revieweeId),
    orderIdFk: foreignKey({ columns: [table.orderId], foreignColumns: [orders.id] }).onDelete("cascade"),
    reviewerIdFk: foreignKey({ columns: [table.reviewerId], foreignColumns: [users.id] }).onDelete("cascade"),
    revieweeIdFk: foreignKey({ columns: [table.revieweeId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================================
// FAVORITE SHOPS
// ============================================================================

export const favoriteShops = mysqlTable(
  "favoriteShops",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    shopId: int("shopId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueFavorite: unique("uniqueFavorite").on(table.customerId, table.shopId),
    customerIdIdx: index("customerIdIdx").on(table.customerId),
    shopIdIdx: index("shopIdIdx").on(table.shopId),
    customerIdFk: foreignKey({ columns: [table.customerId], foreignColumns: [users.id] }).onDelete("cascade"),
    shopIdFk: foreignKey({ columns: [table.shopId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type FavoriteShop = typeof favoriteShops.$inferSelect;
export type InsertFavoriteShop = typeof favoriteShops.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", [
      "bid_received",
      "bid_accepted",
      "bid_rejected",
      "order_ready",
      "order_completed",
      "review_received",
      "message_received",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    relatedEntityId: int("relatedEntityId"),
    relatedEntityType: varchar("relatedEntityType", { length: 50 }),
    isRead: boolean("isRead").default(false),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
    typeIdx: index("typeIdx").on(table.type),
    isReadIdx: index("isReadIdx").on(table.isRead),
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// MESSAGES (In-app chat between customer and shop)
// ============================================================================

export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    senderId: int("senderId").notNull(),
    recipientId: int("recipientId").notNull(),
    content: text("content").notNull(),
    isRead: boolean("isRead").default(false),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderIdIdx").on(table.orderId),
    senderIdIdx: index("senderIdIdx").on(table.senderId),
    recipientIdIdx: index("recipientIdIdx").on(table.recipientId),
    orderIdFk: foreignKey({ columns: [table.orderId], foreignColumns: [orders.id] }).onDelete("cascade"),
    senderIdFk: foreignKey({ columns: [table.senderId], foreignColumns: [users.id] }).onDelete("cascade"),
    recipientIdFk: foreignKey({ columns: [table.recipientId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// TRANSACTIONS (Payment records)
// ============================================================================

export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    type: mysqlEnum("type", ["payment", "refund", "payout"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
    stripeTransactionId: varchar("stripeTransactionId", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderIdIdx").on(table.orderId),
    typeIdx: index("typeIdx").on(table.type),
    statusIdx: index("statusIdx").on(table.status),
    orderIdFk: foreignKey({ columns: [table.orderId], foreignColumns: [orders.id] }).onDelete("cascade"),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ============================================================================
// ANALYTICS (Shop performance metrics)
// ============================================================================

export const analyticsSnapshots = mysqlTable(
  "analyticsSnapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    shopId: int("shopId").notNull(),
    snapshotDate: timestamp("snapshotDate").notNull(),
    bidsSubmitted: int("bidsSubmitted").default(0),
    bidsWon: int("bidsWon").default(0),
    totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
    averageWinPrice: decimal("averageWinPrice", { precision: 10, scale: 2 }),
    winRate: decimal("winRate", { precision: 5, scale: 2 }),
    ordersCompleted: int("ordersCompleted").default(0),
    averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    shopIdIdx: index("shopIdIdx").on(table.shopId),
    snapshotDateIdx: index("snapshotDateIdx").on(table.snapshotDate),
    shopIdFk: foreignKey({ columns: [table.shopId], foreignColumns: [users.id] }).onDelete("cascade"),
  })
);

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type InsertAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;
