import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Create mock user
const mockUser = {
  id: 1,
  openId: "test-user-123",
  email: "customer@example.com",
  name: "Test Customer",
  accountType: "customer" as const,
  role: "user" as const,
  phone: null,
  profileImage: null,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Create mock context
function createMockContext(user: typeof mockUser | null = mockUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("Auth Router", () => {
  describe("auth.me", () => {
    it("should return current user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toEqual(mockUser);
    });

    it("should return null if not authenticated", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("auth.logout", () => {
    it("should clear session cookie", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("auth.switchAccountType", () => {
    it("should switch account type to shop", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.switchAccountType({
        accountType: "shop",
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("Customer Router - Validation", () => {
  describe("customer.createRequest - Input Validation", () => {
    it("should reject title that is too short", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.customer.createRequest({
          title: "a", // Too short (min 5)
          description: "Test",
          category: "Electronics",
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject negative budget", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.customer.createRequest({
          title: "Valid Title",
          description: "Test",
          category: "Electronics",
          budgetMin: -100,
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject search radius outside bounds", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.customer.createRequest({
          title: "Valid Title",
          description: "Test",
          category: "Electronics",
          searchRadiusMiles: 50, // Max is 25
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Shop Router - Validation", () => {
  describe("shop.setupProfile - Input Validation", () => {
    it("should reject business name that is too short", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.setupProfile({
          businessName: "ab", // Too short (min 3)
          categories: ["Electronics"],
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject empty categories", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.setupProfile({
          businessName: "Tech Store",
          categories: [], // Empty (min 1)
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject too many categories", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.setupProfile({
          businessName: "Tech Store",
          categories: ["A", "B", "C", "D", "E", "F"], // Max is 5
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("shop.submitBid - Input Validation", () => {
    it("should reject bid price below minimum", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.submitBid({
          requestId: 1,
          price: 1, // Min is 5
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject bid price above maximum", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.submitBid({
          requestId: 1,
          price: 100000, // Max is 50000
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject negative delivery price", async () => {
      const mockShopUser = {
        ...mockUser,
        id: 2,
        accountType: "shop" as const,
      };

      const ctx = createMockContext(mockShopUser);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.shop.submitBid({
          requestId: 1,
          price: 100,
          deliveryPrice: -50, // Must be non-negative
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Authorization Tests", () => {
  it("should prevent unauthenticated access to protected procedures", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.customer.getProfile();
      expect.fail("Should have thrown unauthorized error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should prevent shop procedures for non-shop users", async () => {
    const ctx = createMockContext(mockUser); // Customer user
    const caller = appRouter.createCaller(ctx);

    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // No shop profile
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    try {
      await caller.shop.getRequestFeed();
      expect.fail("Should have thrown forbidden error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
