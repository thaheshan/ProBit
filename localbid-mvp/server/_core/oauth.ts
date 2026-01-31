import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Decode state to get accountType
      let accountType: "customer" | "shop" = "customer";
      try {
        const decodedState = Buffer.from(state, "base64").toString("utf-8");
        // Try to parse as JSON (new format with accountType)
        try {
          const stateData = JSON.parse(decodedState);
          if (stateData.accountType && (stateData.accountType === "customer" || stateData.accountType === "shop")) {
            accountType = stateData.accountType;
          }
        } catch {
          // If JSON parse fails, it's the old format (just a URL string)
          // Keep default "customer" for backward compatibility
        }
      } catch {
        // If base64 decode fails, use default "customer"
      }

      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email || "",
        accountType: accountType,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect based on account type
      if (accountType === "shop") {
        res.redirect(302, "/shop/dashboard");
      } else {
        res.redirect(302, "/customer/dashboard");
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
