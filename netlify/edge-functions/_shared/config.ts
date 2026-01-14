/**
 * Shared configuration constants for edge functions
 */

export const ALBY_LNURL = "https://getalby.com/.well-known/lnurlp/shawnyeager";
export const ALBY_CALLBACK = "https://getalby.com/lnurlp/shawnyeager/callback";
export const ALBY_TIMEOUT_MS = 10000;
export const VALID_USERNAMES = ["sats", "shawn", "zap"] as const;

export function errorResponse(status: number, reason: string): Response {
  return new Response(JSON.stringify({ status: "ERROR", reason }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
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
