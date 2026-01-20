# AGENTS.md

Instructions for AI coding agents working in this repository.

---

## Build Commands

```bash
# Local development (with drafts)
hugo server -D -p 1313

# Production build
hugo --minify

# Full build (essays JSON + OG images + Hugo)
npm run build

# Individual scripts
npm run generate-essays    # Generate data/essays.json from frontmatter
npm run generate-og        # Generate Open Graph images for essays
```

**Netlify build command** (reference only):
```bash
rm -rf /opt/build/cache/hugo_cache/*/filecache/getresource && npm ci && npm run generate-essays && npm run generate-og && hugo --gc --minify
```

---

## Testing

**No formal test suite exists.** Quality is validated by:
- Successful Hugo build (`hugo --minify`)
- GitHub Actions content-quality workflow on push
- Netlify deploy preview on PRs

**Manual verification checklist:**
- Build succeeds without errors
- Dark mode works
- Mobile responsive
- Reading time shown on essays
- Newsletter form in footer

---

## Git Workflow

**CRITICAL: Always work in a branch:**
```bash
git checkout -b feature-name
```
Never commit directly to master. All changes go through PR with deploy preview.

**Essay commits:** Squash all commits before pushing. Final push must be a single clean commit (e.g., "Publish: Essay title").

**Pre-commit hooks block:**
- Commits on master branch
- `replace` directives in go.mod
- Commit messages revealing AI editing process

---

## Code Style: JavaScript/Node.js (ES Modules)

```javascript
// Imports: named imports, destructured
import satori from 'satori';
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

// Constants: SCREAMING_SNAKE_CASE
const LANDSCAPE = { width: 1200, height: 630 };
const COLORS = { bg: '#1a1a1a', title: '#f5f5f4' };

// Variables/functions: camelCase
const titleLen = title.length;
async function generateOG(title, outputPath) { ... }

// Async/await over callbacks
const data = await response.json();

// Template literals for string interpolation
console.log(`Generated: ${slug}`);
```

---

## Code Style: TypeScript/Deno (Edge Functions)

```typescript
// Type imports from @netlify/edge-functions
import type { Context, Config } from "@netlify/edge-functions";

// Relative imports with .ts extension
import { errorResponse, getCorsHeaders } from "./_shared/config.ts";

// Environment variables via Deno
const topic = Deno.env.get("NTFY_TOPIC");

// Export default for handlers
export default async (req: Request, context: Context) => {
  // Handle CORS preflight first
  const preflightResponse = handleCorsPreflightResponse(req);
  if (preflightResponse) return preflightResponse;
  
  // Early returns for errors
  if (!response.ok) {
    return errorResponse(502, "Upstream error", req);
  }
  
  // Return JSON response
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
};

// Named export for route config
export const config: Config = {
  path: "/.well-known/lnurlp/*"
};
```

---

## Code Style: Hugo Templates

```go-html-template
{{/*
  Block comment explaining template purpose
  Features: list key behaviors
*/}}

{{/* Whitespace control with hyphens */}}
{{- $title := .Title -}}

{{/* Conditionals */}}
{{ if .Params.show_title }}
  <h1>{{ .Title }}</h1>
{{ end }}

{{/* Partials for reusability */}}
{{ partial "topic-list.html" . }}

{{/* Design tokens - NEVER hardcode values */}}
{{/* ✅ var(--space-xl)  ❌ 32px */}}
```

---

## Content Style: Markdown/Frontmatter

```yaml
---
title: "Essay Title"
description: "SEO description for social sharing"  # REQUIRED
date: 2025-10-15
topics: ["Bitcoin", "Strategy"]  # Taxonomy
tags: ["go-to-market", "sales"]  # Taxonomy
slug: "custom-url-slug"          # Optional
---
```

**Required elements:**
- `description` field in frontmatter (SEO/social sharing)
- `<!--more-->` separator for RSS feed summary break
- Descriptive alt text on all images

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| JS/TS variables | camelCase | `titleLen`, `albyResponse` |
| JS/TS functions | camelCase | `generateOG`, `getCorsHeaders` |
| JS/TS constants | SCREAMING_SNAKE_CASE | `ALBY_TIMEOUT_MS`, `COLORS` |
| Hugo templates | kebab-case | `page-title.html`, `topic-list.html` |
| Content files | kebab-case | `my-essay-title.md` |
| CSS classes | kebab-case | `essay-content`, `topic-list` |

---

## Error Handling

**Edge functions:** Return structured JSON errors with appropriate status codes:
```typescript
return errorResponse(404, "User not found", req);
return errorResponse(502, "Upstream error", req);
return errorResponse(504, "Upstream timeout", req);
```

**Abort errors:** Check for AbortError by name:
```typescript
if (error instanceof Error && error.name === 'AbortError') {
  return errorResponse(504, "Upstream timeout", req);
}
```

---

## Critical Constraints

1. **Never commit `public/` directory** - Build artifact
2. **Never commit `replace` directives in go.mod** - Breaks Netlify builds
3. **Never hardcode CSS values** - Use design tokens from theme
4. **Never push to master** - Always use feature branches
5. **Never run `hugo mod get` manually** - GitHub Actions manages theme updates
6. **Description required** - All essays need `description` in frontmatter
7. **Preserve permalinks** - Changing `[permalinks]` breaks existing URLs

---

## Project Structure

```
content/
  essays/           # Main content
  now.md            # Updated monthly
  connect.md, media.md, etc.
layouts/
  essays/           # Essay templates (override theme)
  _default/         # Default templates
  index.html        # Homepage
netlify/
  edge-functions/   # V4V Lightning (TypeScript/Deno)
    _shared/        # Shared config/utilities
scripts/
  generate-og-images.js
  generate-essays-json.js
static/
  images/og-essays/ # Generated OG images
```

---

## Environment

- **Hugo**: 0.154.3
- **Node**: 20
- **Go**: 1.25.3
- **Deployment**: Netlify
- **Edge Runtime**: Deno

---

## Quick Reference

```bash
# Create new essay
hugo new content/essays/essay-slug.md

# Local dev
hugo server -D -p 1313

# Check for replace directive before commit
git diff go.mod | grep "replace"  # Must return nothing
```
