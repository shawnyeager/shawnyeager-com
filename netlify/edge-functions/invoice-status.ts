import type { Config } from "@netlify/edge-functions";
import { errorResponse, jsonResponse, alertFailure, handleCorsPreflightResponse } from "./_shared/config.ts";
import { withNWCClient, NWCNotConfiguredError } from "./_shared/nwc.ts";

export default async (req: Request) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightResponse(req);
  if (preflightResponse) return preflightResponse;

  const url = new URL(req.url);
  const paymentHash = url.searchParams.get('hash');
  const invoice = url.searchParams.get('invoice');

  if (!paymentHash && !invoice) {
    return errorResponse(400, "Payment hash or invoice required", req);
  }

  try {
    const result = await withNWCClient(async (client) => {
      return client.lookupInvoice({
        invoice: invoice || undefined,
        payment_hash: paymentHash || undefined
      });
    });

    // Nip47Transaction has preimage field - only present when paid
    const paid = !!result.preimage;

    return jsonResponse({
      paid,
      preimage: result.preimage || null
    }, 200, req);

  } catch (error) {
    if (error instanceof NWCNotConfiguredError) {
      await alertFailure('Invoice Lookup', 'NWC not configured');
      return errorResponse(500, "Server configuration error", req);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Invoice lookup error:', errorMessage);
    await alertFailure('Invoice Lookup', errorMessage);
    return errorResponse(500, `Lookup failed: ${errorMessage}`, req);
  }
};

export const config: Config = {
  path: "/invoice-status"
};
