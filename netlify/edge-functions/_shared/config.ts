/**
 * Shared configuration constants for edge functions
 */

export const ALBY_LNURL = "https://getalby.com/.well-known/lnurlp/shawnyeager";
export const ALBY_CALLBACK = "https://getalby.com/lnurlp/shawnyeager/callback";
export const ALBY_TIMEOUT_MS = 10000;
export const VALID_USERNAMES = ["sats", "shawn", "zap"] as const;

// Origins allowed to make cross-origin requests to V4V endpoints
const CORS_ALLOWED_ORIGINS = [
  "https://notes.shawnyeager.com",
  "https://shawnyeager.com",
];

/**
 * Get CORS headers if the request origin is allowed
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  if (!origin) return {};

  // Allow deploy preview origins (e.g., deploy-preview-123--shawnyeager-notes.netlify.app)
  const isAllowed = CORS_ALLOWED_ORIGINS.includes(origin) ||
    origin.includes("--shawnyeager-com.netlify.app") ||
    origin.includes("--shawnyeager-notes.netlify.app");

  if (!isAllowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightResponse(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;

  const corsHeaders = getCorsHeaders(req);
  if (Object.keys(corsHeaders).length === 0) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function errorResponse(status: number, reason: string, req?: Request): Response {
  const corsHeaders = req ? getCorsHeaders(req) : {};
  return new Response(JSON.stringify({ status: "ERROR", reason }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

export function jsonResponse(data: object, status = 200, req?: Request): Response {
  const corsHeaders = req ? getCorsHeaders(req) : {};
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders
    }
  });
}

/**
 * V4V Payment Failure Alerts via ntfy.sh
 */
export async function alertFailure(
  context: string,
  error: string,
  details?: Record<string, string>
): Promise<void> {
  const topic = Deno.env.get("NTFY_TOPIC");
  if (!topic) return;

  const body = [
    `V4V Failure: ${context}`,
    `Error: ${error}`,
    details ? Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
  ].filter(Boolean).join('\n\n');

  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: { 'Title': 'shawnyeager.com V4V Alert' },
      body
    });
  } catch (e) {
    console.error('Alert send failed:', e);
  }
}
