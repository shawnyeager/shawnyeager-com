import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const username = pathParts[pathParts.length - 1];

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

  // Fetch from Alby
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

  const data = await albyResponse.text();

  return new Response(data, {
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
