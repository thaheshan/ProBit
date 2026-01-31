import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  users, customerProfiles, shopProfiles, addresses, requests, bids, 
  orders, reviews, favoriteShops, notifications, messages, transactions,
  analyticsSnapshots 
} from "../drizzle/schema";
import { eq, and, desc, asc, sql, gte, lte, like } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateRequestSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().max(1000),
  category: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  searchRadiusMiles: z.number().int().min(5).max(25).default(10),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  bidDurationHours: z.number().int().min(2).max(24).default(24),
  photos: z.array(z.string()).max(5).default([]),
  addressId: z.number().int().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const CreateBidSchema = z.object({
  requestId: z.number().int().positive(),
  price: z.number().positive().min(5).max(50000),
  availability: z.enum(["in_stock", "can_order", "limited"]).default("in_stock"),
  deliveryAvailable: z.boolean().default(false),
  deliveryPrice: z.number().nonnegative().default(0),
  notes: z.string().max(200).optional(),
  photos: z.array(z.string()).max(3).default([]),
});

const ShopProfileSchema = z.object({
  businessName: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  categories: z.array(z.string()).min(1).max(5),
  serviceRadiusMiles: z.number().int().min(5).max(25).default(10),
  businessLicense: z.string().optional(),
  taxId: z.string().optional(),
});

// ============================================================================
// CUSTOMER PROCEDURES
// ============================================================================

const customerRouter = router({
  // Get or create customer profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    let profile = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) {
      await db.insert(customerProfiles).values({
        userId: ctx.user.id,
      });
      profile = await db
        .select()
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, ctx.user.id))
        .limit(1);
    }

    return profile[0];
  }),

  // Create product request
  createRequest: protectedProcedure
    .input(CreateRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const expiresAt = new Date(Date.now() + input.bidDurationHours * 60 * 60 * 1000);

      const result = await db.insert(requests).values({
        customerId: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        searchRadiusMiles: input.searchRadiusMiles,
        budgetMin: input.budgetMin ? String(input.budgetMin) : undefined,
        budgetMax: input.budgetMax ? String(input.budgetMax) : undefined,
        bidDurationHours: input.bidDurationHours,
        photos: input.photos,
        status: "active",
        expiresAt,
        addressId: input.addressId,
        latitude: input.latitude ? String(input.latitude) : undefined,
        longitude: input.longitude ? String(input.longitude) : undefined,
      });

      return { id: result[0].insertId, expiresAt };
    }),

  // Get customer's requests
  getRequests: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(requests)
      .where(eq(requests.customerId, ctx.user.id))
      .orderBy(desc(requests.createdAt));
  }),

  // Get request details with bids
  getRequestDetail: protectedProcedure
    .input(z.object({ requestId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const request = await db
        .select()
        .from(requests)
        .where(eq(requests.id, input.requestId))
        .limit(1);

      if (request.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const requestBids = await db
        .select()
        .from(bids)
        .where(eq(bids.requestId, input.requestId))
        .orderBy(asc(bids.price));

      return { request: request[0], bids: requestBids };
    }),

  // Accept a bid and create order
  acceptBid: protectedProcedure
    .input(z.object({ bidId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const bid = await db
        .select()
        .from(bids)
        .where(eq(bids.id, input.bidId))
        .limit(1);

      if (bid.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const request = await db
        .select()
        .from(requests)
        .where(eq(requests.id, bid[0].requestId))
        .limit(1);

      if (request.length === 0 || request[0].customerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Update bid status
      await db
        .update(bids)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(bids.id, input.bidId));

      // Update request status
      await db
        .update(requests)
        .set({ status: "closed", acceptedBidId: input.bidId })
        .where(eq(requests.id, bid[0].requestId));

      // Create order
      const orderNumber = `ORD-${nanoid(10).toUpperCase()}`;
      const pickupCode = Math.random().toString().slice(2, 8);
      const totalAmount = Number(bid[0].price);

      const orderResult = await db.insert(orders).values({
        orderNumber,
        requestId: bid[0].requestId,
        bidId: input.bidId,
        customerId: ctx.user.id,
        shopId: bid[0].shopId,
        totalAmount: String(totalAmount),
        platformFee: String(totalAmount * 0.05),
        shopAmount: String(totalAmount * 0.95),
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
        pickupCode,
      });

      return { orderId: orderResult[0].insertId, orderNumber, pickupCode };
    }),

  // Get customer's orders
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  // Add shop to favorites
  addFavoriteShop: protectedProcedure
    .input(z.object({ shopId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(favoriteShops).values({
        customerId: ctx.user.id,
        shopId: input.shopId,
      });

      return { success: true };
    }),

  // Get favorite shops
  getFavoriteShops: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const favorites = await db
      .select()
      .from(favoriteShops)
      .where(eq(favoriteShops.customerId, ctx.user.id));

    const shopIds = favorites.map((f) => f.shopId);
    if (shopIds.length === 0) return [];

    return await db
      .select()
      .from(shopProfiles)
      .where(sql`${shopProfiles.userId} IN (${shopIds})`);
  }),

  // Remove favorite shop
  removeFavoriteShop: protectedProcedure
    .input(z.object({ shopId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(favoriteShops)
        .where(
          and(
            eq(favoriteShops.customerId, ctx.user.id),
            eq(favoriteShops.shopId, input.shopId)
          )
        );

      return { success: true };
    }),
});

// ============================================================================
// SHOP PROCEDURES
// ============================================================================

const shopRouter = router({
  // List all shops
  listShops: publicProcedure
    .input(z.object({}).optional())
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await db
        .select()
        .from(shopProfiles)
        .orderBy(desc(shopProfiles.averageRating));
    }),

  // Create or update shop profile
  setupProfile: protectedProcedure
    .input(ShopProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db
        .select()
        .from(shopProfiles)
        .where(eq(shopProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(shopProfiles).values({
          userId: ctx.user.id,
          businessName: input.businessName,
          description: input.description,
          categories: input.categories,
          serviceRadiusMiles: input.serviceRadiusMiles,
          businessLicense: input.businessLicense,
          taxId: input.taxId,
        });
      } else {
        await db
          .update(shopProfiles)
          .set({
            businessName: input.businessName,
            description: input.description,
            categories: input.categories,
            serviceRadiusMiles: input.serviceRadiusMiles,
            businessLicense: input.businessLicense,
            taxId: input.taxId,
          })
          .where(eq(shopProfiles.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Get shop profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(shopProfiles)
      .where(eq(shopProfiles.userId, ctx.user.id))
      .limit(1);
  }),

  // Get feed of nearby requests
  getRequestFeed: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const shopProfile = await db
      .select()
      .from(shopProfiles)
      .where(eq(shopProfiles.userId, ctx.user.id))
      .limit(1);

    if (shopProfile.length === 0) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Shop profile not set up" });
    }

    // Get active requests within service radius
    return await db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.status, "active"),
          gte(requests.expiresAt, new Date())
        )
      )
      .orderBy(desc(requests.createdAt));
  }),

  // Submit bid
  submitBid: protectedProcedure
    .input(CreateBidSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if shop already bid on this request
      const existingBid = await db
        .select()
        .from(bids)
        .where(
          and(
            eq(bids.requestId, input.requestId),
            eq(bids.shopId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingBid.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already bid on this request",
        });
      }

      const result = await db.insert(bids).values({
        requestId: input.requestId,
        shopId: ctx.user.id,
        price: String(input.price),
        availability: input.availability,
        deliveryAvailable: input.deliveryAvailable,
        deliveryPrice: String(input.deliveryPrice),
        notes: input.notes,
        photos: input.photos,
        status: "active",
      });

      // Update request bid count and prices
      const allBids = await db
        .select()
        .from(bids)
        .where(eq(bids.requestId, input.requestId));

      const prices = allBids.map((b) => Number(b.price));
      const lowestPrice = Math.min(...prices);
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      await db
        .update(requests)
        .set({
          bidsCount: allBids.length,
          lowestBidPrice: String(lowestPrice),
          averageBidPrice: String(averagePrice),
        })
        .where(eq(requests.id, input.requestId));

      return { bidId: result[0].insertId };
    }),

  // Get shop's bids
  getBids: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(bids)
      .where(eq(bids.shopId, ctx.user.id))
      .orderBy(desc(bids.submittedAt));
  }),

  // Get shop's orders
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db
      .select()
      .from(orders)
      .where(eq(orders.shopId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  // Update order status
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number().int().positive(),
        status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (order.length === 0 || order[0].shopId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db
        .update(orders)
        .set({ fulfillmentStatus: input.status })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get analytics
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const shopProfile = await db
      .select()
      .from(shopProfiles)
      .where(eq(shopProfiles.userId, ctx.user.id))
      .limit(1);

    if (shopProfile.length === 0) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return {
      bidsSubmitted: shopProfile[0].bidsSubmitted,
      bidsWon: shopProfile[0].bidsWon,
      totalRevenue: shopProfile[0].totalRevenue,
      averageRating: shopProfile[0].averageRating,
      totalReviews: shopProfile[0].totalReviews,
    };
  }),
});

// ============================================================================
// UPLOAD PROCEDURES
// ============================================================================

const uploadRouter = router({
  // Upload image and return URL
  uploadImage: protectedProcedure
    .input(
      z.object({
        base64Data: z.string(),
        fileName: z.string(),
        mimeType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate mime type
      if (!input.mimeType.startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only images are allowed" });
      }

      // Extract base64 data (remove data URL prefix if present)
      let base64 = input.base64Data;
      if (base64.includes(",")) {
        base64 = base64.split(",")[1];
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64, "base64");

      // Validate file size (max 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File too large (max 5MB)" });
      }

      // Generate unique file key
      const ext = input.mimeType.split("/")[1] || "jpg";
      const fileKey = `uploads/${ctx.user.id}/${nanoid()}-${input.fileName}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      return { url, key: fileKey };
    }),
});

// ============================================================================
// SYSTEM PROCEDURES
// ============================================================================

const systemRouter = router({
  notifyOwner: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement owner notification
      return { success: true };
    }),
});

// ============================================================================
// AUTH PROCEDURES
// ============================================================================

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  // Switch account type
  switchAccountType: protectedProcedure
    .input(z.object({ accountType: z.enum(["customer", "shop"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(users)
        .set({ accountType: input.accountType })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  customer: customerRouter,
  shop: shopRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
