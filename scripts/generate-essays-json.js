#!/usr/bin/env node
/**
 * Generate data/essays.json from content/essays/*.md
 * Extracts slug and title from frontmatter for v4v page generation
 * Excludes drafts
 */

import { glob } from 'glob';
import matter from 'gray-matter';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function generateEssaysJson() {
  const essayFiles = await glob('content/essays/*.md', {
    cwd: rootDir,
    ignore: ['content/essays/_index.md']
  });

  const essays = [];

  for (const file of essayFiles) {
    const filePath = join(rootDir, file);
    const content = readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    // Skip drafts
    if (data.draft === true) continue;

    // Require slug and title
    if (!data.slug || !data.title) {
      console.warn(`Skipping ${file}: missing slug or title`);
      continue;
    }

    essays.push({
      slug: data.slug,
      title: data.title
    });
  }

  // Sort by title for consistent output
  essays.sort((a, b) => a.title.localeCompare(b.title));

  const dataDir = join(rootDir, 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = join(dataDir, 'essays.json');
  writeFileSync(outputPath, JSON.stringify(essays, null, 2) + '\n');

  console.log(`Generated data/essays.json with ${essays.length} essays`);
}

generateEssaysJson().catch(err => {
  console.error('Failed to generate essays.json:', err);
  process.exit(1);
});
