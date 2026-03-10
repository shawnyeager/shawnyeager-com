#!/usr/bin/env node
/**
 * Generate data/essays.json and data/notes.json from content files.
 * Extracts slug and title from frontmatter for v4v page generation.
 * Supports both flat .md files and page bundles (dir/index.md).
 * Excludes drafts.
 */

import { glob } from 'glob';
import matter from 'gray-matter';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function generateJson(section) {
  const files = await glob(`content/${section}/{*.md,*/index.md}`, {
    cwd: rootDir,
    ignore: [`content/${section}/_index.md`]
  });

  const items = [];

  for (const file of files) {
    const content = readFileSync(join(rootDir, file), 'utf-8');
    const { data } = matter(content);

    if (data.draft === true) continue;

    if (!data.slug || !data.title) {
      console.warn(`Skipping ${file}: missing slug or title`);
      continue;
    }

    items.push({ slug: data.slug, title: data.title });
  }

  items.sort((a, b) => a.title.localeCompare(b.title));

  const dataDir = join(rootDir, 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = join(dataDir, `${section}.json`);
  writeFileSync(outputPath, JSON.stringify(items, null, 2) + '\n');

  console.log(`Generated data/${section}.json with ${items.length} ${section}`);
}

try {
  await generateJson('essays');
  await generateJson('notes');
} catch (err) {
  console.error('Failed to generate v4v data:', err);
  process.exit(1);
}
