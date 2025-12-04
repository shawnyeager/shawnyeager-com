# LNURL Proxy Flows

This document explains how the selective LNURL proxy handles both website tips and Nostr zaps.

## Flow 1: Website Tip (e.g., tipping an essay on shawnyeager.com)

```
1. User clicks tip button on essay page
   ↓
2. Website JS calls: /.well-known/lnurlp/sats?essay=my-essay&title=My%20Essay
   ↓
3. Edge function proxies Alby, returns:
   - callback: https://shawnyeager.com/lnurl-callback?essay=my-essay&title=My%20Essay
   - allowsNostr: true, nostrPubkey: (Alby's key)
   ↓
4. User's wallet calls callback with amount (NO nostr param)
   ↓
5. Your callback detects: no nostr param → local NWC path
   - Generates invoice via NWC with memo "shawnyeager.com/my-essay"
   - Logs: "Invoice generated: source=my-essay"
   - Returns invoice with successAction: "Thank you for supporting My Essay"
   ↓
6. User pays → sats arrive in your Alby wallet
   ↓
7. No zap receipt needed (not a Nostr context)
```

**Result:** Payment works, essay tracking works, you see which essays earn tips.

---

## Flow 2: Nostr Zap (e.g., zapping your note from Damus/Primal)

```
1. User views your note in Nostr client, clicks zap
   ↓
2. Client looks up your Lightning address: sats@shawnyeager.com
   ↓
3. Client calls: /.well-known/lnurlp/sats (no essay params)
   ↓
4. Edge function proxies Alby, returns:
   - callback: https://shawnyeager.com/lnurl-callback
   - allowsNostr: true
   - nostrPubkey: 79f00d3f... (Alby's key for signing zap receipts)
   ↓
5. Client creates zap request event (kind 9734), calls callback:
   /lnurl-callback?amount=21000&nostr={signed zap request event}
   ↓
6. Your callback detects: nostr param present → forward to Alby
   - Proxies request to https://getalby.com/lnurlp/shawnyeager/callback
   - Alby validates zap request, creates invoice with proper description_hash
   - Returns Alby's invoice response
   ↓
7. User pays invoice
   ↓
8. Alby detects payment, creates zap receipt (kind 9735), publishes to relays
   ↓
9. Nostr clients see zap receipt → zap displays on your note
```

**Result:** Payment works, zap receipt published, zap shows on your note in Nostr clients.

---

## Key Differences

| Aspect | Website Tip | Nostr Zap |
|--------|-------------|-----------|
| Has `nostr` param? | No | Yes |
| Invoice created by | Your NWC | Alby |
| Zap receipt published? | N/A | Yes (by Alby) |
| Essay tracking? | Yes | No (no essay context) |
| Shows on Nostr? | No | Yes |

---

## Implementation Files

- `netlify/edge-functions/lnurlp.ts` - Proxies Alby's LNURL-pay endpoint, rewrites callback URL
- `netlify/functions/lnurl-callback.mts` - Handles callback, routes based on `nostr` param presence
- `netlify/functions/_shared/config.ts` - Shared constants (ALBY_CALLBACK, ALBY_TIMEOUT_MS)
