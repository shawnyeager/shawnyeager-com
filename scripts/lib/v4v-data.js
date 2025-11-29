/**
 * V4V Data Library
 * Shared data fetching and processing for V4V analytics
 */

import { config } from 'dotenv';
import { WebSocket } from 'ws';
import { NWCClient } from '@getalby/sdk';
import { execSync } from 'child_process';
import https from 'https';

// Load environment variables from .env if present
config({ quiet: true });

// If NWC_CONNECTION_STRING not in env, fetch from Netlify
if (!process.env.NWC_CONNECTION_STRING) {
  try {
    const nwcUrl = execSync('netlify env:get NWC_CONNECTION_STRING 2>/dev/null', { encoding: 'utf8' }).trim();
    if (nwcUrl) {
      process.env.NWC_CONNECTION_STRING = nwcUrl;
    }
  } catch {
    // Will be handled later with proper error message
  }
}

// Polyfill WebSocket for Node.js
globalThis.WebSocket = WebSocket;

/**
 * Create NWC client
 */
export function createClient() {
  const nwcUrl = process.env.NWC_CONNECTION_STRING;
  if (!nwcUrl) {
    throw new Error('NWC_CONNECTION_STRING not found. Ensure this project is linked to Netlify (netlify link)');
  }
  return new NWCClient({ nostrWalletConnectUrl: nwcUrl });
}

/**
 * Fetch current BTC price in USD from CoinGecko
 */
export async function fetchBtcPrice() {
  return new Promise((resolve, reject) => {
    https.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.bitcoin?.usd || null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Convert sats to USD
 */
export function satsToUsd(sats, btcPrice) {
  if (!btcPrice) return null;
  return (sats / 100_000_000) * btcPrice;
}

/**
 * Format USD amount
 */
export function formatUsd(usd) {
  if (usd === null) return '';
  if (usd < 0.01) return ' (~$0.01)';
  return ` (~$${usd.toFixed(2)})`;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Fetch all V4V transactions from NWC
 */
export async function fetchTransactions(client) {
  const allTransactions = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await client.listTransactions({
      type: 'incoming',
      limit,
      offset,
    });

    if (!response.transactions || response.transactions.length === 0) {
      break;
    }

    allTransactions.push(...response.transactions);

    if (response.transactions.length < limit) {
      break;
    }

    offset += limit;
  }

  return allTransactions;
}

/**
 * Filter transactions for V4V payments (description contains shawnyeager.com)
 */
export function filterV4VPayments(transactions) {
  return transactions.filter(tx =>
    tx.description && tx.description.includes('shawnyeager.com')
  );
}

/**
 * Parse essay slug from description
 * Format: "shawnyeager.com/essay-slug" or just "shawnyeager.com" (footer)
 */
export function parseEssaySlug(description) {
  if (!description) return null;

  // Extract slug from shawnyeager.com/slug
  const match = description.match(/shawnyeager\.com\/([a-z0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(transactions, from, to) {
  return transactions.filter(tx => {
    const timestamp = tx.settled_at || tx.created_at;
    if (!timestamp) return false;

    const date = new Date(timestamp * 1000);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

/**
 * Aggregate transactions by essay
 */
export function aggregateByEssay(transactions, sortBy = 'sats') {
  const byEssay = new Map();

  for (const tx of transactions) {
    const slug = parseEssaySlug(tx.description) || '(footer/general)';
    const timestamp = tx.settled_at || tx.created_at;
    const existing = byEssay.get(slug) || { sats: 0, count: 0, lastPayment: 0 };
    existing.sats += Math.floor(tx.amount / 1000);
    existing.count += 1;
    if (timestamp > existing.lastPayment) {
      existing.lastPayment = timestamp;
    }
    byEssay.set(slug, existing);
  }

  // Sort based on option
  const sortFn = {
    sats: (a, b) => b[1].sats - a[1].sats,
    count: (a, b) => b[1].count - a[1].count,
    recent: (a, b) => b[1].lastPayment - a[1].lastPayment,
  }[sortBy] || ((a, b) => b[1].sats - a[1].sats);

  return new Map([...byEssay.entries()].sort(sortFn));
}

/**
 * Aggregate transactions by time period
 */
export function aggregateByPeriod(transactions, period = 'monthly') {
  const byPeriod = new Map();

  for (const tx of transactions) {
    const timestamp = tx.settled_at || tx.created_at;
    if (!timestamp) continue;

    const date = new Date(timestamp * 1000);
    let key;

    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      // Get ISO week start (Monday)
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay() + 1);
      key = d.toISOString().split('T')[0];
    } else {
      // Monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    const existing = byPeriod.get(key) || { sats: 0, count: 0 };
    existing.sats += Math.floor(tx.amount / 1000);
    existing.count += 1;
    byPeriod.set(key, existing);
  }

  // Sort by date descending
  return new Map([...byPeriod.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

/**
 * Build summary stats from transactions
 */
export function buildSummary(transactions, btcPrice = null) {
  const totalSats = transactions.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const avgSats = transactions.length > 0 ? Math.round(totalSats / transactions.length) : 0;

  // Split by essay vs general
  const essayTxs = transactions.filter(tx => parseEssaySlug(tx.description));
  const generalTxs = transactions.filter(tx => !parseEssaySlug(tx.description));
  const essaySats = essayTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const generalSats = generalTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);

  return {
    totalSats,
    totalPayments: transactions.length,
    avgSats,
    essays: {
      sats: essaySats,
      payments: essayTxs.length,
      usd: btcPrice ? satsToUsd(essaySats, btcPrice) : null,
    },
    general: {
      sats: generalSats,
      payments: generalTxs.length,
      usd: btcPrice ? satsToUsd(generalSats, btcPrice) : null,
    },
    totalUsd: btcPrice ? satsToUsd(totalSats, btcPrice) : null,
    avgUsd: btcPrice ? satsToUsd(avgSats, btcPrice) : null,
    btcPrice,
  };
}

/**
 * Fetch all V4V data in one call
 */
export async function fetchV4VData(options = {}) {
  const client = createClient();

  try {
    // Fetch BTC price if requested
    const btcPrice = options.usd ? await fetchBtcPrice() : null;

    // Fetch and filter transactions
    const allTransactions = await fetchTransactions(client);
    let v4vPayments = filterV4VPayments(allTransactions);

    // Apply date range filter
    if (options.from || options.to) {
      const fromDate = options.from ? new Date(options.from) : null;
      const toDate = options.to ? new Date(options.to + 'T23:59:59') : null;
      v4vPayments = filterByDateRange(v4vPayments, fromDate, toDate);
    }

    return {
      transactions: v4vPayments,
      summary: buildSummary(v4vPayments, btcPrice),
      btcPrice,
    };
  } finally {
    client.close();
  }
}
