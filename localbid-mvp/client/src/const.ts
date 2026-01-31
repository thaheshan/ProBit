export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Validate environment variables
  if (!oauthPortalUrl) {
    console.error("VITE_OAUTH_PORTAL_URL is not set");
    return "#";
  }
  
  if (!appId) {
    console.error("VITE_APP_ID is not set");
    return "#";
  }

  // Ensure window is available (client-side only)
  if (typeof window === "undefined") {
    return "#";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Error constructing login URL:", error);
    return "#";
  }
};

// Generate signup URL at runtime
export const getSignupUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Validate environment variables
  if (!oauthPortalUrl) {
    console.error("VITE_OAUTH_PORTAL_URL is not set");
    return "#";
  }
  
  if (!appId) {
    console.error("VITE_APP_ID is not set");
    return "#";
  }

  // Ensure window is available (client-side only)
  if (typeof window === "undefined") {
    return "#";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signUp");

    return url.toString();
  } catch (error) {
    console.error("Error constructing signup URL:", error);
    return "#";
  }
};
