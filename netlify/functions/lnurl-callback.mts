import type { Context, Config } from "@netlify/functions";
import { webln } from "@getalby/sdk";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const amount = url.searchParams.get('amount');
  const essaySlug = url.searchParams.get('essay') || 'general';

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

  try {
    // Initialize NWC connection
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: nwcUrl
    });

    await nwc.enable();

    // Generate invoice with essay metadata
    const invoice = await nwc.makeInvoice({
      amount: Math.floor(parseInt(amount) / 1000), // Convert millisats to sats
      defaultMemo: `Essay: ${essaySlug} | shawnyeager.com`
    });

    // Log for analytics
    console.log(`Invoice generated: essay=${essaySlug}, amount=${amount}ms`);

    // Return LNURL-pay callback response
    return new Response(JSON.stringify({
      pr: invoice.paymentRequest,
      routes: [],
      successAction: {
        tag: "message",
        message: `Thank you for supporting "${essaySlug}"!`
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
  }
};

export const config: Config = {
  path: "/lnurl-callback"
};
