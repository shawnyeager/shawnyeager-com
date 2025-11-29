#!/usr/bin/env node
/**
 * V4V Dashboard Web Server
 * Local Express server for V4V payment analytics
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import matter from 'gray-matter';
import {
  fetchV4VData,
  aggregateByEssay,
  aggregateByPeriod,
  parseEssaySlug,
} from './lib/v4v-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Build slug-to-title mapping from essay frontmatter
function buildEssayTitles() {
  const essaysDir = join(__dirname, '..', 'content', 'essays');
  const titles = {};

  try {
    const files = readdirSync(essaysDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    for (const file of files) {
      const content = readFileSync(join(essaysDir, file), 'utf8');
      const { data } = matter(content);
      // Use explicit slug from frontmatter, fallback to slugified filename
      const slug = data.slug || file.replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-');
      titles[slug] = data.title || file.replace(/\.md$/, '');
    }
  } catch (err) {
    console.warn('Could not read essays directory:', err.message);
  }

  return titles;
}

const essayTitles = buildEssayTitles();

// Serve static files from dashboard directory
app.use(express.static(join(__dirname, 'dashboard')));

// API endpoint for fetching V4V data
app.get('/api/data', async (req, res) => {
  try {
    const data = await fetchV4VData({ usd: true });

    // Add aggregations for the frontend
    const byEssay = aggregateByEssay(data.transactions, 'sats');
    const byMonth = aggregateByPeriod(data.transactions, 'monthly');

    // Convert Maps to arrays for JSON serialization
    const essayData = [...byEssay.entries()].map(([slug, d]) => ({
      slug,
      sats: d.sats,
      count: d.count,
      lastPayment: d.lastPayment,
    }));

    const monthlyData = [...byMonth.entries()].map(([month, d]) => ({
      month,
      sats: d.sats,
      count: d.count,
    }));

    // Build transaction list with parsed essay info
    const transactions = data.transactions.map(tx => ({
      amount: Math.floor(tx.amount / 1000),
      timestamp: tx.settled_at || tx.created_at,
      description: tx.description,
      essay: parseEssaySlug(tx.description) || '(footer/general)',
    }));

    res.json({
      summary: data.summary,
      byEssay: essayData,
      byMonth: monthlyData,
      transactions,
      btcPrice: data.btcPrice,
      essayTitles,
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`V4V Dashboard running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
