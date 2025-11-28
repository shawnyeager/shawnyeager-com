import type { Context, Config } from "@netlify/functions";
import { WebSocket } from "ws";
import { webln } from "@getalby/sdk";

// Polyfill WebSocket for serverless environment
(globalThis as any).WebSocket = WebSocket;

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const paymentHash = url.searchParams.get('hash');
  const invoice = url.searchParams.get('invoice');

  if (!paymentHash && !invoice) {
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "Payment hash or invoice required"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const nwcUrl = Netlify.env.get('NWC_CONNECTION_STRING');

  if (!nwcUrl) {
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "Server configuration error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: nwcUrl
    });

    await nwc.enable();

    const lookupResult = await nwc.lookupInvoice({
      invoice: invoice || undefined,
      payment_hash: paymentHash || undefined
    });

    // NIP-47 returns state: "pending", "settled", "expired", or "failed"
    const paid = lookupResult.state === 'settled';

    return new Response(JSON.stringify({
      paid,
      preimage: lookupResult.preimage || null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Invoice lookup error:', errorMessage);

    return new Response(JSON.stringify({
      status: "ERROR",
      reason: `Lookup failed: ${errorMessage}`
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/invoice-status"
};
