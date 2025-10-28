# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ CRITICAL RULES

**ALWAYS USE DESIGN TOKENS - NEVER HARDCODE VALUES**

- This site uses the tangerine-theme design system built on CSS custom properties
- ALWAYS use tokens for colors, spacing, typography, etc.
- NEVER hardcode pixel values, hex colors, or font weights in templates or styles
- Theme tokens are defined in `tangerine-theme/static/css/main.css` lines 11-107
- Examples:
  - ✅ `font-size: var(--font-lg);`
  - ❌ `font-size: 18px;`
  - ✅ `margin-top: var(--space-xl);`
  - ❌ `margin-top: 32px;`
  - ✅ `color: var(--text-primary);`
  - ❌ `color: #1a1a1a;`
- If a value doesn't have a token, ask before creating overrides
- Site-specific overrides should be minimal - prefer theme changes

---

## Overview

**shawnyeager.com** - "The Gallery" for finished essays and professional content. Built with Hugo, using a shared theme module. Sister site to notes.shawnyeager.com (the "Workshop" for notes).

## Development Commands

```bash
# Local development with drafts
hugo server -D -p 1313

# Build for production
hugo --minify

# Create new essay
hugo new content/essays/essay-slug.md

# Update Hugo modules (theme)
hugo mod get -u
hugo mod tidy
```

## One-time Setup After Cloning

After cloning this repo on a new machine, run:

```bash
./scripts/setup.sh
```

This configures:
- Git hooks path (for pre-commit auto-fixing)
- Verifies mise tools are installed (node, hugo-extended, markdownlint-cli2)

**What the pre-commit hook fixes automatically:**

*Markdown formatting (via markdownlint-cli2):*
- MD009: Trailing spaces
- MD010: Hard tabs
- MD012: Multiple blank lines
- MD018/019: Heading spacing
- MD023: Indented headings
- MD047: Missing trailing newline
- Plus 25+ other fixable rules (respects `.markdownlint.json`)

*Smart punctuation (custom cleanup):*
- Curly apostrophes (') → straight apostrophes (')
- Curly quotes ("") → straight quotes ("")
- Em dashes (---) → triple hyphens (---)
- En dashes (--) → double hyphens (--)
- Ellipsis (...) → three periods (...)

The hook runs on staged `.md` files only, shows what it fixed, and re-stages changes. This prevents CI failures while keeping full visibility into changes.

**Note:** If you paste content from external sources (Google Docs, Medium, etc.), the hook will clean it up automatically before the commit completes.

## Architecture

### Hugo Module Theme Pattern

This site uses Hugo Modules to import a shared theme:

```toml
[module]
  [[module.imports]]
    path = "github.com/shawnyeager/tangerine-theme"  # Production
    # path = "/home/shawn/Work/tangerine-theme"      # Local development
```

**Critical:** Switch between GitHub URL (production) and local path (development) in `hugo.toml`. Local development requires the tangerine-theme repo to be at `/home/shawn/Work/tangerine-theme`.

The theme module contains:
- Base layouts in `layouts/`
- Design system CSS in `assets/css/`
- Shared partials and shortcodes

### Template Override Strategy

This site overrides specific theme templates in `layouts/`:

- **`index.html`**: Custom homepage (bio, latest essay, podcast feature, topics, recent essays)
- **`essays/single.html`**: Individual essay page with reading time
- **`essays/list.html`**: Essays index page
- **`page/single.html`**: Generic pages (now, media, connect, etc.)
- **`_default/now.html`**: Special layout for /now page
- **`_default/podcast.html`**: Special layout for /podcast page
- **`partials/topic-list.html`**: Topics navigation component
- **`shortcodes/contact-method.html`**: Contact link component

Templates fall back to theme module if not overridden locally.

### Content Architecture

```
content/
├── essays/              # Type: essays, section: essays
│   └── *.md            # Frontmatter: title, description, date, topics, tags
├── now.md              # Type: page, updated monthly
├── media.md            # Type: page, press/media info
├── podcast.md          # Type: podcast
├── connect.md          # Type: page, contact methods
├── encrypt.md          # Type: page, PGP keys
└── subscribed.md       # Type: page, newsletter confirmation
```

**Essay frontmatter template:**
```yaml
---
title: "Essay Title"
description: "SEO description for social sharing"  # REQUIRED: Used for meta description and Open Graph tags
date: 2025-10-15
topics: ["Bitcoin", "Strategy"]  # Taxonomy for topic browsing
tags: ["go-to-market", "sales"]  # Taxonomy for tag filtering
---
```

**IMPORTANT:** The `description` field is REQUIRED for all essays. It's used for:
- Meta description tag (SEO)
- Open Graph og:description (social sharing)
- Twitter Card description
- Essays listing pages

Without it, the page will fall back to the site-wide description (homepage bio), which is inappropriate for individual essays.

**Special frontmatter flags:**
- `hide_footer_signup: true` - Hides newsletter form (use on utility pages)
- `type: page` - Forces page layout instead of default

### Permalinks

Essays use clean URLs without dates:
```toml
[permalinks]
  essays = "/:contentbasename/"
```

Result: `/why-bitcoin-sales-is-different-from-saas/` instead of `/essays/2025/10/why-bitcoin-sales-is-different-from-saas/`

### Static Assets

```
static/
├── images/              # Site images (webp preferred)
├── assets/              # Downloadable files (PDFs, media kits)
└── _redirects           # Netlify redirects config
```

**Important:** CSS is NOT in `static/css/`. The theme module handles CSS via Hugo Pipes in `assets/css/`. Do not create `static/css/main.css` unless explicitly copying from theme for debugging.

## Configuration

### Key hugo.toml Parameters

```toml
# Theme behavior
[params]
  content_type = "essays"         # Parameterizes theme templates
  favicon_style = "solid"         # Solid square (vs "outlined" on .org)
  noindex = false                 # Allow search indexing (true on .org)
  show_read_time = true           # Show reading time (false on .org)
  show_email_signup = true        # Footer newsletter form

# Taxonomies
[taxonomies]
  topic = "topics"                # Frontmatter: topics: [...]
  tag = "tags"                    # Frontmatter: tags: [...]

# RSS feed
[outputFormats.RSS]
  baseName = "feed"               # Output: /feed.xml not /index.xml
```

### Theme Configuration Differences

| Parameter | .com (Gallery) | .org (Workshop) |
|-----------|----------------|-----------------|
| `favicon_style` | `"solid"` | `"outlined"` |
| `noindex` | `false` | `true` |
| `show_read_time` | `true` | `false` |
| `show_email_signup` | `true` | `false` |

## Deployment

**Platform:** Netlify
**Deploy trigger:** Push to `master` branch
**Build command:** `hugo --minify` (with GITHUB_TOKEN for private theme module)
**Publish directory:** `public/`
**Hugo version:** 0.151.0 (set in `netlify.toml`)

### Netlify Build Configuration

`netlify.toml` configures GitHub token for private module access:
```toml
[build]
  command = 'git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/" && hugo --minify'
```

Environment variable `GITHUB_TOKEN` must be set in Netlify dashboard.

## Related Repositories

- **tangerine-theme** (`github.com/shawnyeager/tangerine-theme`): Shared theme module with layouts, CSS, partials
- **shawnyeager-org** (`github.com/shawnyeager/shawnyeager-org`): Sister site for work-in-progress notes
- **hugo-sites-project** (`~/Work/hugo-sites-project`): Archived monorepo with design specs and mockups

## Critical Constraints

1. **Never commit `public/` directory** - Build artifact, in `.gitignore`
2. **Match theme module path** - Switch between GitHub URL (prod) and local path (dev) in `hugo.toml`
3. **Update go.mod** - Run `hugo mod tidy` after theme changes
4. **Preserve essay permalinks** - Changing `[permalinks]` breaks existing URLs
5. **Monthly now page updates** - Convention to keep /now current
