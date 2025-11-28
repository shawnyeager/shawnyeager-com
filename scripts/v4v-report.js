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
function aggregateByEssay(transactions) {
  const byEssay = new Map();

  for (const tx of transactions) {
    const slug = parseEssaySlug(tx.description) || '(footer/general)';
    const existing = byEssay.get(slug) || { sats: 0, count: 0 };
    existing.sats += Math.floor(tx.amount / 1000);
    existing.count += 1;
    byEssay.set(slug, existing);
  }

  // Sort by total sats descending
  return new Map([...byEssay.entries()].sort((a, b) => b[1].sats - a[1].sats));
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
function printSummary(transactions, fromDate, toDate) {
  const totalSats = transactions.reduce((sum, tx) => sum + Math.floor(tx.amount / 1000), 0);
  const avgSats = transactions.length > 0 ? Math.round(totalSats / transactions.length) : 0;

  console.log('\nV4V Payment Report');
  console.log('==================');

  if (fromDate || toDate) {
    const from = fromDate ? fromDate.toISOString().split('T')[0] : 'beginning';
    const to = toDate ? toDate.toISOString().split('T')[0] : 'now';
    console.log(`Period: ${from} to ${to}`);
  } else {
    console.log('Period: All time');
  }

  console.log(`Total received: ${formatNumber(totalSats)} sats (${formatNumber(transactions.length)} payments)`);
  console.log(`Average: ${formatNumber(avgSats)} sats`);
}

/**
 * Print by-essay breakdown
 */
function printByEssay(transactions) {
  const byEssay = aggregateByEssay(transactions);

  console.log('\nBy Essay:');
  for (const [slug, data] of byEssay) {
    const paddedSlug = slug.padEnd(40);
    console.log(`  ${paddedSlug} ${formatNumber(data.sats).padStart(10)} sats (${data.count} payments)`);
  }
}

/**
 * Print time series
 */
function printTimeSeries(transactions, period) {
  const byPeriod = aggregateByPeriod(transactions, period);

  console.log(`\n${period.charAt(0).toUpperCase() + period.slice(1)} Trend:`);
  for (const [date, data] of byPeriod) {
    console.log(`  ${date}  ${formatNumber(data.sats).padStart(10)} sats (${data.count} payments)`);
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
 * Main CLI
 */
program
  .name('v4v-report')
  .description('Analyze V4V payments received via Alby Hub')
  .option('--by-essay', 'Show breakdown by essay')
  .option('--time-series [period]', 'Show time series (daily, weekly, monthly)', 'monthly')
  .option('--from <date>', 'Start date (YYYY-MM-DD)')
  .option('--to <date>', 'End date (YYYY-MM-DD)')
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
      // Fetch and filter transactions
      console.log('Fetching transactions...');
      const allTransactions = await fetchTransactions(client);
      let v4vPayments = filterV4VPayments(allTransactions);

      // Apply date range filter
      const fromDate = options.from ? new Date(options.from) : null;
      const toDate = options.to ? new Date(options.to + 'T23:59:59') : null;

      if (fromDate || toDate) {
        v4vPayments = filterByDateRange(v4vPayments, fromDate, toDate);
      }

      // Print summary
      printSummary(v4vPayments, fromDate, toDate);

      // Print by-essay breakdown
      if (options.byEssay) {
        printByEssay(v4vPayments);
      }

      // Print time series
      if (options.timeSeries) {
        const period = typeof options.timeSeries === 'string' ? options.timeSeries : 'monthly';
        printTimeSeries(v4vPayments, period);
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
