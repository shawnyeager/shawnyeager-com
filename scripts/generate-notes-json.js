#!/usr/bin/env node
/**
 * Generate data/notes.json from content/notes/*.md
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

async function generateNotesJson() {
  const noteFiles = await glob('content/notes/*.md', {
    cwd: rootDir,
    ignore: ['content/notes/_index.md']
  });

  const notes = [];

  for (const file of noteFiles) {
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

    notes.push({
      slug: data.slug,
      title: data.title
    });
  }

  // Sort by title for consistent output
  notes.sort((a, b) => a.title.localeCompare(b.title));

  const dataDir = join(rootDir, 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = join(dataDir, 'notes.json');
  writeFileSync(outputPath, JSON.stringify(notes, null, 2) + '\n');

  console.log(`Generated data/notes.json with ${notes.length} notes`);
}

generateNotesJson().catch(err => {
  console.error('Failed to generate notes.json:', err);
  process.exit(1);
});
