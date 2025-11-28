import type { Context, Config } from "@netlify/edge-functions";
import { ALBY_LNURL, ALBY_TIMEOUT_MS, VALID_USERNAMES, errorResponse } from "./_shared/config.ts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const username = pathParts[pathParts.length - 1];

  // Extract essay parameter for per-essay tracking (empty string if not provided)
  const essaySlug = url.searchParams.get('essay') || '';

  // All aliases map to the same Alby account
  if (!VALID_USERNAMES.includes(username as typeof VALID_USERNAMES[number])) {
    return errorResponse(404, "User not found");
  }

  // Fetch from Alby to get min/max amounts (with timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ALBY_TIMEOUT_MS);

  let albyResponse: Response;
  try {
    albyResponse = await fetch(ALBY_LNURL, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return errorResponse(504, "Upstream timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!albyResponse.ok) {
    return errorResponse(502, "Upstream error");
  }

  const data = await albyResponse.json();

  // Rewrite metadata to show vanity address instead of Alby address
  if (data.metadata) {
    data.metadata = data.metadata.replace(
      'shawnyeager@getalby.com',
      `${username}@shawnyeager.com`
    );
  }

  // Rewrite callback to our handler, include essay parameter only if present
  // Use request host to work on deploy previews
  const host = req.headers.get('host') || 'shawnyeager.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  data.callback = essaySlug
    ? `${protocol}://${host}/lnurl-callback?essay=${encodeURIComponent(essaySlug)}`
    : `${protocol}://${host}/lnurl-callback`;

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
};

export const config: Config = {
  path: "/.well-known/lnurlp/*"
};
