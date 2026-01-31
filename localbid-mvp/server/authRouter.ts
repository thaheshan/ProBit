import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { customerProfiles, shopProfiles, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";

const PASSWORD_SALT_ROUNDS = 12;

const SignupSchema = z
  .object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8),
    accountType: z.enum(["customer", "shop"]),
    businessName: z
      .string()
      .trim()
      .min(2)
      .max(255)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((value, ctx) => {
    if (value.accountType === "shop" && !value.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name is required for shop accounts",
        path: ["businessName"],
      });
    }
  });

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRouter = router({
  // Signup with email/password
  signup: publicProcedure
    .input(SignupSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ENV.cookieSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "JWT_SECRET is not set in the server environment",
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
      const openId = `local_${crypto.randomBytes(16).toString("hex")}`;

      await db.insert(users).values({
        openId,
        email: input.email,
        name: input.name,
        accountType: input.accountType,
        passwordHash,
        isVerified: false,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Get the created user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      if (input.accountType === "customer") {
        await db.insert(customerProfiles).values({
          userId: user[0].id,
        });
      } else {
        await db.insert(shopProfiles).values({
          userId: user[0].id,
          businessName: input.businessName ?? "",
          categories: [],
        });
      }

      return {
        success: true,
        user: user[0],
      };
    }),

  // Login with email/password
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      if (!user[0].passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        user[0].passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const sessionToken = await sdk.createSessionToken(user[0].openId, {
        name: user[0].name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user[0].id));

      return {
        success: true,
        user: user[0],
      };
    }),

  // Get current user
  me: publicProcedure.query((opts) => opts.ctx.user),

  // Logout
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
