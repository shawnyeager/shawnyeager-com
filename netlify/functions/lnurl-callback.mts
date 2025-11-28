import type { Context, Config } from "@netlify/functions";
import bolt11 from "bolt11";
import { errorResponse, jsonResponse } from "./_shared/responses.ts";
import { withNWCClient, NWCNotConfiguredError } from "./_shared/nwc.ts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const amount = url.searchParams.get('amount');
  const essaySlug = url.searchParams.get('essay') || '';

  if (!amount) {
    return errorResponse(400, "Amount parameter required");
  }

  try {
    const result = await withNWCClient(async (client) => {
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

      console.log(`Invoice generated: source=${essaySlug || 'footer'}, amount=${amount}ms, hash=${paymentHash}`);

      return { invoice: invoice.invoice, paymentHash };
    });

    return jsonResponse({
      pr: result.invoice,
      paymentHash: result.paymentHash,
      routes: [],
      successAction: {
        tag: "message",
        message: essaySlug
          ? `Thank you for supporting "${essaySlug}"!`
          : 'Thank you for your support!'
      }
    });

  } catch (error) {
    if (error instanceof NWCNotConfiguredError) {
      console.error('NWC_CONNECTION_STRING environment variable not set');
      return errorResponse(500, "Server configuration error");
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('NWC invoice generation error:', errorMessage, error);
    return errorResponse(500, `Invoice generation failed: ${errorMessage}`);
  }
};

export const config: Config = {
  path: "/lnurl-callback"
};
