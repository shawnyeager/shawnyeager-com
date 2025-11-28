import type { Context, Config } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const username = pathParts[pathParts.length - 1];

  // Extract essay parameter for per-essay tracking
  const essaySlug = url.searchParams.get('essay') || 'general';

  // All aliases map to the same Alby account
  const validUsernames = ['sats', 'shawn', 'zap'];
  if (!validUsernames.includes(username)) {
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "User not found"
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Fetch from Alby to get min/max amounts
  const albyResponse = await fetch(
    "https://getalby.com/.well-known/lnurlp/shawnyeager"
  );

  if (!albyResponse.ok) {
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "Upstream error"
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  const data = await albyResponse.json();

  // Rewrite metadata to show vanity address instead of Alby address
  if (data.metadata) {
    data.metadata = data.metadata.replace(
      'shawnyeager@getalby.com',
      `${username}@shawnyeager.com`
    );
  }

  // Rewrite callback to our handler, preserve essay parameter
  // Use request host to work on deploy previews
  const host = req.headers.get('host') || 'shawnyeager.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  data.callback = `${protocol}://${host}/lnurl-callback?essay=${encodeURIComponent(essaySlug)}`;

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
