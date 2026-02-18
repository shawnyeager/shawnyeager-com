# llms.txt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate `/llms.txt` and `/llms-full.txt` at build time from content source files, following the [llms.txt spec](https://llmstxt.org/).

**Architecture:** Node.js build script reads content markdown via gray-matter, generates two static files. Wired into Netlify build pipeline alongside existing generate-essays and generate-og scripts.

**Tech Stack:** Node.js, gray-matter (already a dependency), glob (already a dependency)

---

### Task 1: Create generate-llms-txt.js

**Files:**
- Create: `scripts/generate-llms-txt.js`

**Step 1: Create the script**

```javascript
#!/usr/bin/env node
/**
 * Generate static/llms.txt and static/llms-full.txt from content.
 * Follows the llms.txt spec: https://llmstxt.org/
 */

import { glob } from 'glob';
import matter from 'gray-matter';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const baseURL = 'https://shawnyeager.com';

// Strip Hugo shortcodes: {{< name >}}...{{< /name >}} and {{< name >}}
function stripShortcodes(content) {
  // Block shortcodes: {{< name ... >}}...{{< /name >}}
  content = content.replace(/\{\{<\s*\/?\s*[\w-]+(?:\s[^>]*)?\s*>\}\}/g, '');
  // Clean up excessive blank lines left behind
  content = content.replace(/\n{3,}/g, '\n\n');
  return content.trim();
}

async function loadContent(pattern, slugPrefix, indexFile) {
  const files = await glob(pattern, { cwd: rootDir, ignore: [indexFile] });
  const items = [];

  for (const file of files) {
    const filePath = join(rootDir, file);
    const raw = readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    if (data.draft === true) continue;
    if (!data.title) continue;

    const slug = data.slug || file.replace(/.*\//, '').replace(/\.md$/, '');
    const url = slugPrefix
      ? `${baseURL}/${slugPrefix}/${slug}/`
      : `${baseURL}/${slug}/`;

    items.push({
      title: data.title,
      description: data.description || '',
      url,
      date: data.date ? new Date(data.date) : new Date(0),
      body: stripShortcodes(content),
    });
  }

  // Newest first
  items.sort((a, b) => b.date - a.date);
  return items;
}

function loadPage(filePath, url) {
  const raw = readFileSync(join(rootDir, filePath), 'utf-8');
  const { data, content } = matter(raw);
  return {
    title: data.title,
    description: data.description || '',
    url: `${baseURL}${url}`,
    body: stripShortcodes(content),
  };
}

async function generate() {
  const essays = await loadContent(
    'content/essays/*.md', null, 'content/essays/_index.md'
  );
  const notes = await loadContent(
    'content/notes/*.md', 'notes', 'content/notes/_index.md'
  );

  const pages = [
    loadPage('content/advisory.md', '/advisory/'),
    loadPage('content/now.md', '/now/'),
    loadPage('content/contact.md', '/contact/'),
  ];

  // --- llms.txt (summaries + links) ---
  const lines = [
    '# Shawn Yeager',
    '',
    '> Go-to-market advisory for frontier tech founders — Bitcoin, AI, distributed systems. Essays and notes on sales, positioning, and revenue strategy.',
    '',
    'Shawn Yeager helps post-seed founders build repeatable revenue through fractional GTM advisory. 30 years commercializing products the market didn\'t understand. $300M+ in revenue across Microsoft, Exodus, ANKR, Dataswift, Bottlepay, NYDIG, and Amboss.',
    '',
  ];

  if (essays.length) {
    lines.push('## Essays', '');
    for (const e of essays) {
      lines.push(`- [${e.title}](${e.url}): ${e.description}`);
    }
    lines.push('');
  }

  if (notes.length) {
    lines.push('## Notes', '');
    for (const n of notes) {
      lines.push(`- [${n.title}](${n.url}): ${n.description}`);
    }
    lines.push('');
  }

  lines.push('## Pages', '');
  for (const p of pages) {
    lines.push(`- [${p.title}](${p.url}): ${p.description}`);
  }
  lines.push('');

  // --- llms-full.txt (full content inlined) ---
  const full = [
    '# Shawn Yeager',
    '',
    '> Go-to-market advisory for frontier tech founders — Bitcoin, AI, distributed systems. Essays and notes on sales, positioning, and revenue strategy.',
    '',
    'Shawn Yeager helps post-seed founders build repeatable revenue through fractional GTM advisory. 30 years commercializing products the market didn\'t understand. $300M+ in revenue across Microsoft, Exodus, ANKR, Dataswift, Bottlepay, NYDIG, and Amboss.',
    '',
  ];

  if (essays.length) {
    full.push('## Essays', '');
    for (const e of essays) {
      full.push(`### ${e.title}`, '');
      full.push(`URL: ${e.url}`, '');
      full.push(e.body, '');
    }
  }

  if (notes.length) {
    full.push('## Notes', '');
    for (const n of notes) {
      full.push(`### ${n.title}`, '');
      full.push(`URL: ${n.url}`, '');
      full.push(n.body, '');
    }
  }

  full.push('## Pages', '');
  for (const p of pages) {
    full.push(`### ${p.title}`, '');
    full.push(`URL: ${p.url}`, '');
    full.push(p.body, '');
  }

  mkdirSync(join(rootDir, 'static'), { recursive: true });
  writeFileSync(join(rootDir, 'static/llms.txt'), lines.join('\n'));
  writeFileSync(join(rootDir, 'static/llms-full.txt'), full.join('\n'));

  console.log(`Generated llms.txt (${essays.length} essays, ${notes.length} notes, ${pages.length} pages)`);
  console.log(`Generated llms-full.txt`);
}

generate().catch(err => {
  console.error('Failed to generate llms.txt:', err);
  process.exit(1);
});
```

**Step 2: Run the script to verify output**

Run: `cd /home/shawn/Work/shawnyeager/shawnyeager-com && node scripts/generate-llms-txt.js`

Expected: Creates `static/llms.txt` and `static/llms-full.txt`. Inspect both files for correct structure.

**Step 3: Commit**

```bash
git add scripts/generate-llms-txt.js static/llms.txt static/llms-full.txt
git commit -m "feat: add llms.txt generation script"
```

---

### Task 2: Wire into build pipeline

**Files:**
- Modify: `package.json` (line 8, scripts section)
- Modify: `netlify.toml` (line 3, build command)

**Step 1: Add npm script to package.json**

In the `scripts` section, add:
```json
"generate-llms-txt": "node scripts/generate-llms-txt.js"
```

**Step 2: Add to netlify.toml build command**

Change the build command from:
```
command = "npm ci && npm run generate-essays && npm run generate-og && hugo --gc --minify"
```
to:
```
command = "npm ci && npm run generate-essays && npm run generate-og && npm run generate-llms-txt && hugo --gc --minify"
```

The script must run before `hugo` so the generated files in `static/` are included in the Hugo build output.

**Step 3: Verify build locally**

Run: `cd /home/shawn/Work/shawnyeager/shawnyeager-com && npm run generate-llms-txt`

Expected: Same output as Task 1 Step 2.

**Step 4: Commit**

```bash
git add package.json netlify.toml
git commit -m "build: wire llms.txt generation into deploy pipeline"
```

---

### Task 3: Verify with local Hugo build

**Step 1: Run full local build**

Run: `cd /home/shawn/Work/shawnyeager/shawnyeager-com && npm run generate-llms-txt && hugo`

**Step 2: Verify files in build output**

Run: `head -20 public/llms.txt && echo "---" && head -20 public/llms-full.txt`

Expected: Both files present in `public/` with correct content. Hugo copies `static/*` to `public/` during build.

**Step 3: Clean up build output**

Run: `rm -rf public/`
