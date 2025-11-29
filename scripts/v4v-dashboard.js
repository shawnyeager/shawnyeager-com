#!/usr/bin/env node
/**
 * V4V Dashboard TUI
 * Interactive terminal dashboard for V4V payment analytics
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import {
  fetchV4VData,
  aggregateByEssay,
  aggregateByPeriod,
  formatNumber,
  satsToUsd,
} from './lib/v4v-data.js';

// Refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'V4V Dashboard',
});

// Create grid layout
const grid = new contrib.grid({ rows: 12, cols: 12, screen });

// Summary box (top left)
const summaryBox = grid.set(0, 0, 4, 6, blessed.box, {
  label: ' Summary ',
  tags: true,
  border: { type: 'line' },
  style: {
    border: { fg: 'cyan' },
    label: { fg: 'white', bold: true },
  },
  padding: { left: 1, right: 1 },
});

// Trend chart (top right)
const trendChart = grid.set(0, 6, 4, 6, contrib.line, {
  label: ' Monthly Trend (sats) ',
  showLegend: false,
  style: {
    line: 'yellow',
    text: 'white',
    baseline: 'white',
    border: { fg: 'cyan' },
  },
  xLabelPadding: 3,
  xPadding: 5,
  wholeNumbersOnly: true,
});

// By-essay table (bottom)
const essayTable = grid.set(4, 0, 8, 12, contrib.table, {
  label: ' By Essay (press s: sats, c: count, t: recent) ',
  keys: true,
  interactive: true,
  columnSpacing: 3,
  columnWidth: [45, 15, 10, 12],
  style: {
    border: { fg: 'cyan' },
    header: { fg: 'cyan', bold: true },
    cell: { fg: 'white', selected: { bg: 'blue' } },
  },
});

// Status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  content: ' Loading... | r: refresh | s/c/t: sort | q: quit',
  style: {
    fg: 'black',
    bg: 'cyan',
  },
});
screen.append(statusBar);

// State
let currentData = null;
let currentSort = 'sats';
let lastRefresh = null;
let refreshTimer = null;

/**
 * Format summary content
 */
function formatSummary(summary) {
  const lines = [];

  lines.push(`{bold}Total:{/bold} ${formatNumber(summary.totalSats)} sats`);
  if (summary.totalUsd) {
    lines.push(`       (~$${summary.totalUsd.toFixed(2)})`);
  }
  lines.push('');
  lines.push(`{bold}Payments:{/bold} ${formatNumber(summary.totalPayments)}`);
  lines.push(`{bold}Average:{/bold}  ${formatNumber(summary.avgSats)} sats`);
  lines.push('');
  lines.push(`Essays:  ${formatNumber(summary.essays.sats).padStart(10)} sats (${summary.essays.payments})`);
  lines.push(`General: ${formatNumber(summary.general.sats).padStart(10)} sats (${summary.general.payments})`);

  if (summary.btcPrice) {
    lines.push('');
    lines.push(`{bold}BTC:{/bold} $${formatNumber(summary.btcPrice)}`);
  }

  return lines.join('\n');
}

/**
 * Update trend chart with monthly data
 */
function updateTrendChart(transactions) {
  const byPeriod = aggregateByPeriod(transactions, 'monthly');
  const entries = [...byPeriod.entries()].reverse().slice(-12); // Last 12 months

  if (entries.length === 0) {
    trendChart.setData([{ title: 'Trend', x: ['N/A'], y: [0] }]);
    return;
  }

  const x = entries.map(([date]) => date.substring(5)); // MM only
  const y = entries.map(([, data]) => data.sats);

  trendChart.setData([{
    title: 'Sats',
    x,
    y,
    style: { line: 'yellow' },
  }]);
}

/**
 * Update essay table
 */
function updateEssayTable(transactions, sortBy = 'sats') {
  const byEssay = aggregateByEssay(transactions, sortBy);
  const entries = [...byEssay.entries()];

  const headers = ['Essay', 'Sats', 'Count', 'Last'];
  const data = entries.map(([slug, d]) => {
    const lastDate = d.lastPayment
      ? new Date(d.lastPayment * 1000).toISOString().split('T')[0]
      : 'N/A';
    return [slug, formatNumber(d.sats), String(d.count), lastDate];
  });

  essayTable.setData({ headers, data });

  const sortLabel = { sats: 'sats', count: 'count', recent: 'recent' }[sortBy];
  essayTable.setLabel(` By Essay (sorted by ${sortLabel}) | s: sats, c: count, t: recent `);
}

/**
 * Update status bar
 */
function updateStatus(message = null) {
  const time = lastRefresh ? lastRefresh.toLocaleTimeString() : 'never';
  const base = message || `Last refresh: ${time}`;
  statusBar.setContent(` ${base} | r: refresh | s/c/t: sort | q: quit`);
  screen.render();
}

/**
 * Refresh all data
 */
async function refresh() {
  updateStatus('Fetching...');

  try {
    currentData = await fetchV4VData({ usd: true });
    lastRefresh = new Date();

    // Update summary
    summaryBox.setContent(formatSummary(currentData.summary));

    // Update trend chart
    updateTrendChart(currentData.transactions);

    // Update essay table
    updateEssayTable(currentData.transactions, currentSort);

    updateStatus();
  } catch (error) {
    updateStatus(`Error: ${error.message}`);
  }

  screen.render();
}

/**
 * Change sort order
 */
function changeSort(sortBy) {
  if (!currentData) return;
  currentSort = sortBy;
  updateEssayTable(currentData.transactions, sortBy);
  screen.render();
}

// Key bindings
screen.key(['q', 'C-c'], () => {
  if (refreshTimer) clearInterval(refreshTimer);
  return process.exit(0);
});

screen.key(['r'], () => {
  refresh();
});

screen.key(['s'], () => changeSort('sats'));
screen.key(['c'], () => changeSort('count'));
screen.key(['t'], () => changeSort('recent'));

// Focus on table for scrolling
essayTable.focus();

// Initial load
refresh();

// Auto-refresh
refreshTimer = setInterval(refresh, REFRESH_INTERVAL);

// Render
screen.render();
