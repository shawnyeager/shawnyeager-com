#!/usr/bin/env node
/**
 * V4V Payment Report CLI
 * Analyze Bitcoin payments received via Alby Hub using NWC list_transactions
 */

import { program } from 'commander';
import { config } from 'dotenv';
import { WebSocket } from 'ws';
import { nwc } from '@getalby/sdk';
import fs from 'fs';
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
 * Fetch current BTC price in USD from CoinGecko
 */
async function fetchBtcPrice() {
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
function satsToUsd(sats, btcPrice) {
  if (!btcPrice) return null;
  return (sats / 100_000_000) * btcPrice;
}

/**
 * Format USD amount
 */
function formatUsd(usd) {
  if (usd === null) return '';
  if (usd < 0.01) return ' (~$0.01)';
  return ` (~$${usd.toFixed(2)})`;
}

/**
 * Fetch all V4V transactions from NWC
 */
async function fetchTransactions(client) {
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
function filterV4VPayments(transactions) {
  return transactions.filter(tx =>
    tx.description && tx.description.includes('shawnyeager.com')
  );
}

/**
 * Parse essay slug from description
 * Handles multiple formats:
 * - "shawnyeager.com/essay-slug" (current)
 * - "Essay: essay-slug | shawnyeager.com" (legacy)
 * - "shawnyeager.com" (footer/general)
 */
function parseEssaySlug(description) {
  if (!description) return null;

  // Current format: shawnyeager.com/essay-slug
  const currentMatch = description.match(/shawnyeager\.com\/([a-z0-9-]+)$/);
  if (currentMatch) return currentMatch[1];

  // Legacy format: Essay: essay-slug | shawnyeager.com
  const legacyMatch = description.match(/^Essay:\s*([a-z0-9-]+)\s*\|/);
  if (legacyMatch && legacyMatch[1] !== 'general') return legacyMatch[1];

  return null;
}

/**
 * Filter transactions by date range
 */
function filterByDateRange(transactions, from, to) {
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
function aggregateByEssay(transactions, sortBy = 'sats') {
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
function aggregateByPeriod(transactions, period = 'monthly') {
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
 * Format number with commas
 */
function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Print summary report
 */
function printSummary(transactions, fromDate, toDate, btcPrice = null) {
  const totalSats = transactions.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const avgSats = transactions.length > 0 ? Math.round(totalSats / transactions.length) : 0;

  // Split by essay vs general
  const essayTxs = transactions.filter(tx => parseEssaySlug(tx.description));
  const generalTxs = transactions.filter(tx => !parseEssaySlug(tx.description));
  const essaySats = essayTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const generalSats = generalTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);

  console.log('\nV4V Payment Report');
  console.log('==================');

  if (fromDate || toDate) {
    const from = fromDate ? fromDate.toISOString().split('T')[0] : 'beginning';
    const to = toDate ? toDate.toISOString().split('T')[0] : 'now';
    console.log(`Period: ${from} to ${to}`);
  } else {
    console.log('Period: All time');
  }

  const totalUsd = formatUsd(satsToUsd(totalSats, btcPrice));
  const avgUsd = formatUsd(satsToUsd(avgSats, btcPrice));

  console.log(`Total received: ${formatNumber(totalSats)} sats${totalUsd} (${formatNumber(transactions.length)} payments)`);
  console.log(`  Essays:  ${formatNumber(essaySats).padStart(10)} sats${formatUsd(satsToUsd(essaySats, btcPrice))} (${essayTxs.length} payments)`);
  console.log(`  General: ${formatNumber(generalSats).padStart(10)} sats${formatUsd(satsToUsd(generalSats, btcPrice))} (${generalTxs.length} payments)`);
  console.log(`Average: ${formatNumber(avgSats)} sats${avgUsd}`);

  if (btcPrice) {
    console.log(`BTC price: $${formatNumber(btcPrice)}`);
  }
}

/**
 * Print by-essay breakdown
 */
function printByEssay(transactions, { sortBy = 'sats', top = null, btcPrice = null } = {}) {
  const byEssay = aggregateByEssay(transactions, sortBy);
  let entries = [...byEssay.entries()];

  if (top) {
    entries = entries.slice(0, top);
  }

  const sortLabel = { sats: 'by sats', count: 'by count', recent: 'by recent' }[sortBy];
  console.log(`\nBy Essay (${sortLabel}):`);

  for (const [slug, data] of entries) {
    const paddedSlug = slug.padEnd(40);
    const usd = formatUsd(satsToUsd(data.sats, btcPrice));
    console.log(`  ${paddedSlug} ${formatNumber(data.sats).padStart(10)} sats${usd} (${data.count} payments)`);
  }

  if (top && byEssay.size > top) {
    console.log(`  ... and ${byEssay.size - top} more`);
  }
}

/**
 * Print time series
 */
function printTimeSeries(transactions, period, btcPrice = null) {
  const byPeriod = aggregateByPeriod(transactions, period);

  console.log(`\n${period.charAt(0).toUpperCase() + period.slice(1)} Trend:`);
  for (const [date, data] of byPeriod) {
    const usd = formatUsd(satsToUsd(data.sats, btcPrice));
    console.log(`  ${date}  ${formatNumber(data.sats).padStart(10)} sats${usd} (${data.count} payments)`);
  }
}

/**
 * Print period comparison (this period vs last period)
 */
function printComparison(transactions, period, btcPrice = null) {
  const byPeriod = aggregateByPeriod(transactions, period);
  const periods = [...byPeriod.entries()];

  if (periods.length < 2) {
    console.log('\nComparison: Not enough data (need at least 2 periods)');
    return;
  }

  const [currentKey, current] = periods[0];
  const [previousKey, previous] = periods[1];

  const satsDelta = current.sats - previous.sats;
  const satsPercent = previous.sats > 0 ? ((satsDelta / previous.sats) * 100).toFixed(1) : 'N/A';
  const countDelta = current.count - previous.count;
  const countPercent = previous.count > 0 ? ((countDelta / previous.count) * 100).toFixed(1) : 'N/A';

  const satsSign = satsDelta >= 0 ? '+' : '';
  const countSign = countDelta >= 0 ? '+' : '';

  console.log(`\nComparison (${currentKey} vs ${previousKey}):`);
  console.log(`  Sats:     ${formatNumber(current.sats).padStart(10)} vs ${formatNumber(previous.sats).padStart(10)}  (${satsSign}${satsPercent}%)`);
  console.log(`  Payments: ${formatNumber(current.count).padStart(10)} vs ${formatNumber(previous.count).padStart(10)}  (${countSign}${countPercent}%)`);

  if (btcPrice) {
    const currentUsd = satsToUsd(current.sats, btcPrice);
    const previousUsd = satsToUsd(previous.sats, btcPrice);
    console.log(`  USD:      $${currentUsd.toFixed(2).padStart(9)} vs $${previousUsd.toFixed(2).padStart(9)}`);
  }
}

/**
 * Export to CSV
 */
function exportCSV(transactions, filename) {
  const headers = ['date', 'amount_sats', 'essay_slug', 'description'];
  const rows = transactions.map(tx => {
    const timestamp = tx.settled_at || tx.created_at;
    const date = timestamp ? new Date(timestamp * 1000).toISOString() : '';
    const sats = Math.floor(tx.amount / 1000);
    const slug = parseEssaySlug(tx.description) || '';
    const desc = (tx.description || '').replace(/"/g, '""');
    return `${date},${sats},"${slug}","${desc}"`;
  });

  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filename, csv);
  console.log(`\nExported ${transactions.length} transactions to ${filename}`);
}

/**
 * Build JSON report data
 */
function buildJsonReport(transactions, options, btcPrice) {
  const totalSats = transactions.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const avgSats = transactions.length > 0 ? Math.round(totalSats / transactions.length) : 0;

  // Split by essay vs general
  const essayTxs = transactions.filter(tx => parseEssaySlug(tx.description));
  const generalTxs = transactions.filter(tx => !parseEssaySlug(tx.description));
  const essaySats = essayTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const generalSats = generalTxs.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);

  const report = {
    summary: {
      totalSats,
      totalPayments: transactions.length,
      averageSats: avgSats,
      essays: { sats: essaySats, payments: essayTxs.length },
      general: { sats: generalSats, payments: generalTxs.length },
      period: {
        from: options.fromDate?.toISOString().split('T')[0] || null,
        to: options.toDate?.toISOString().split('T')[0] || null,
      },
    },
  };

  if (btcPrice) {
    report.summary.btcPrice = btcPrice;
    report.summary.totalUsd = satsToUsd(totalSats, btcPrice);
    report.summary.essays.usd = satsToUsd(essaySats, btcPrice);
    report.summary.general.usd = satsToUsd(generalSats, btcPrice);
  }

  if (options.byEssay) {
    const byEssay = aggregateByEssay(transactions, options.sort);
    let entries = [...byEssay.entries()];
    if (options.top) entries = entries.slice(0, options.top);

    report.byEssay = entries.map(([slug, data]) => ({
      slug,
      sats: data.sats,
      payments: data.count,
      ...(btcPrice && { usd: satsToUsd(data.sats, btcPrice) }),
    }));
  }

  if (options.timeSeries) {
    const period = typeof options.timeSeries === 'string' ? options.timeSeries : 'monthly';
    const byPeriod = aggregateByPeriod(transactions, period);

    report.timeSeries = {
      period,
      data: [...byPeriod.entries()].map(([date, data]) => ({
        date,
        sats: data.sats,
        payments: data.count,
        ...(btcPrice && { usd: satsToUsd(data.sats, btcPrice) }),
      })),
    };
  }

  if (options.compare) {
    const period = typeof options.timeSeries === 'string' ? options.timeSeries : 'monthly';
    const byPeriod = aggregateByPeriod(transactions, period);
    const periods = [...byPeriod.entries()];

    if (periods.length >= 2) {
      const [currentKey, current] = periods[0];
      const [previousKey, previous] = periods[1];

      report.comparison = {
        current: { period: currentKey, sats: current.sats, payments: current.count },
        previous: { period: previousKey, sats: previous.sats, payments: previous.count },
        delta: {
          sats: current.sats - previous.sats,
          satsPercent: previous.sats > 0 ? ((current.sats - previous.sats) / previous.sats) * 100 : null,
          payments: current.count - previous.count,
          paymentsPercent: previous.count > 0 ? ((current.count - previous.count) / previous.count) * 100 : null,
        },
      };
    }
  }

  return report;
}

/**
 * Main CLI
 */
program
  .name('v4v-report')
  .description('Analyze V4V payments received via Alby Hub')
  .option('--by-essay', 'Show breakdown by essay')
  .option('--time-series [period]', 'Show time series (daily, weekly, monthly)', 'monthly')
  .option('--from <date>', 'Start date (YYYY-MM-DD)')
  .option('--to <date>', 'End date (YYYY-MM-DD)')
  .option('--top <n>', 'Limit to top N essays', parseInt)
  .option('--sort <by>', 'Sort essays by: sats, count, recent (default: sats)')
  .option('--usd', 'Show USD values (fetches current BTC price)')
  .option('--compare', 'Compare current period vs previous period')
  .option('--format <type>', 'Output format: text, json (default: text)')
  .option('--export <filename>', 'Export to CSV file')
  .action(async (options) => {
    const nwcUrl = process.env.NWC_CONNECTION_STRING;
    if (!nwcUrl) {
      console.error('Error: NWC_CONNECTION_STRING not found');
      console.error('Ensure this project is linked to Netlify (netlify link)');
      process.exit(1);
    }

    const client = new nwc.NWCClient({ nostrWalletConnectUrl: nwcUrl });

    try {
      // Fetch BTC price if needed
      let btcPrice = null;
      if (options.usd) {
        btcPrice = await fetchBtcPrice();
        if (!btcPrice && options.format !== 'json') {
          console.log('Warning: Could not fetch BTC price');
        }
      }

      // Fetch and filter transactions
      if (options.format !== 'json') {
        console.log('Fetching transactions...');
      }
      const allTransactions = await fetchTransactions(client);
      let v4vPayments = filterV4VPayments(allTransactions);

      // Apply date range filter
      const fromDate = options.from ? new Date(options.from) : null;
      const toDate = options.to ? new Date(options.to + 'T23:59:59') : null;

      if (fromDate || toDate) {
        v4vPayments = filterByDateRange(v4vPayments, fromDate, toDate);
      }

      // JSON output
      if (options.format === 'json') {
        const report = buildJsonReport(v4vPayments, {
          ...options,
          fromDate,
          toDate,
        }, btcPrice);
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      // Print summary
      printSummary(v4vPayments, fromDate, toDate, btcPrice);

      // Print by-essay breakdown
      if (options.byEssay) {
        printByEssay(v4vPayments, {
          sortBy: options.sort || 'sats',
          top: options.top,
          btcPrice,
        });
      }

      // Print time series
      if (options.timeSeries) {
        const period = typeof options.timeSeries === 'string' ? options.timeSeries : 'monthly';
        printTimeSeries(v4vPayments, period, btcPrice);
      }

      // Print comparison
      if (options.compare) {
        const period = typeof options.timeSeries === 'string' ? options.timeSeries : 'monthly';
        printComparison(v4vPayments, period, btcPrice);
      }

      // Export to CSV
      if (options.export) {
        exportCSV(v4vPayments, options.export);
      }

    } finally {
      client.close();
    }
  });

program.parse();
