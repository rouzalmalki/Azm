/**
 * CORS headers — restrict to known origins only
 * Add any custom domain here alongside the default onspace origins.
 */

const ALLOWED_ORIGINS = [
  "https://wuzzjixykkmjpdcjwuzz.onspace.app",
  "https://wuzzjixykkmjpdcjwuzz.backend.onspace.ai",
  // Live Preview iframe origin (OnSpace editor)
  "https://wuzzjixykkmjpdcjwuzz.app.onspace.ai",
  // Add custom domain below when published, e.g.:
  // "https://azm.sa",
];

// Custom CORS headers must include x-admin-token so the browser allows it
const ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-admin-token";

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  // Allow any onspace subdomain (covers preview iframes with dynamic subdomains)
  const isOnspace = origin.endsWith(".onspace.app") ||
                    origin.endsWith(".onspace.ai") ||
                    origin.endsWith(".backend.onspace.ai");
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isOnspace)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

// Convenience: static headers for non-request contexts (OPTIONS pre-flight)
export const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": ALLOW_HEADERS,
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Vary": "Origin",
};
