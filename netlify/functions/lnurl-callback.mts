import type { Context, Config } from "@netlify/functions";
import { WebSocket } from "ws";
import { nwc } from "@getalby/sdk";
import bolt11 from "bolt11";

// Polyfill WebSocket for serverless environment
(globalThis as any).WebSocket = WebSocket;

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const amount = url.searchParams.get('amount');
  const essaySlug = url.searchParams.get('essay') || '';

  // Validate amount parameter
  if (!amount) {
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "Amount parameter required"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const nwcUrl = Netlify.env.get('NWC_CONNECTION_STRING');

  if (!nwcUrl) {
    console.error('NWC_CONNECTION_STRING environment variable not set');
    return new Response(JSON.stringify({
      status: "ERROR",
      reason: "Server configuration error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  let client: nwc.NWCClient | null = null;

  try {
    // Initialize NWC connection
    client = new nwc.NWCClient({
      nostrWalletConnectUrl: nwcUrl
    });

    // Generate invoice with payment source in memo
    const memo = essaySlug
      ? `shawnyeager.com/${essaySlug}`
      : 'shawnyeager.com';

    const invoice = await client.makeInvoice({
      amount: parseInt(amount), // Amount is already in millisats from LNURL
      description: memo
    });

    // Extract payment hash from BOLT11 invoice
    let paymentHash = '';
    try {
      const decoded = bolt11.decode(invoice.invoice);
      const paymentHashTag = decoded.tags.find((t: any) => t.tagName === 'payment_hash');
      paymentHash = paymentHashTag?.data || '';
    } catch (e) {
      console.error('Failed to decode BOLT11:', e);
    }

    // Log for analytics
    console.log(`Invoice generated: source=${essaySlug || 'footer'}, amount=${amount}ms, hash=${paymentHash}`);

    // Return LNURL-pay callback response with payment hash for status polling
    return new Response(JSON.stringify({
      pr: invoice.invoice,
      paymentHash: paymentHash,
      routes: [],
      successAction: {
        tag: "message",
        message: essaySlug
          ? `Thank you for supporting "${essaySlug}"!`
          : 'Thank you for your support!'
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('NWC invoice generation error:', errorMessage, error);

    return new Response(JSON.stringify({
      status: "ERROR",
      reason: `Invoice generation failed: ${errorMessage}`
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    // Cleanup NWC client connection
    if (client) {
      client.close();
    }
  }
};

export const config: Config = {
  path: "/lnurl-callback"
};
