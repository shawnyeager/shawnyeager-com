# shawnyeager.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/345f9641-36ce-4cef-a6ce-d2f0b1e1de73/deploy-status)](https://app.netlify.com/sites/shawnyeager-com/deploys)

Essays, notes, and advisory services for frontier tech founders.

## About

All writing lives on one domain. Essays are longer, polished pieces at `/:slug/`. Notes are shorter observations at `/notes/:slug/`. A unified `/writing/` page shows everything chronologically.

Content is indexed by search engines and organized by topics for browsing.

## Quick Start

```bash
# Local development
hugo server -D -p 1313

# Create new essay
hugo new content/essays/essay-slug.md

# Build for production
hugo --minify
```

## Tech Stack

- **Hugo** 0.152.2 — Static site generator
- **Hugo Modules** — Theme imported from public [tangerine-theme](https://github.com/shawnyeager/tangerine-theme)
- **Netlify** — Automatic deployment on push to master
- **Netlify Edge Functions** — V4V Lightning payments (LNURL-pay)
- **Satoshi + Inter variable fonts** — Provided by theme

## Configuration

Key parameters in `hugo.toml`:

```toml
[params]
  content_type = "essays"
  favicon_style = "solid"
  noindex = false
  show_read_time = true
  show_email_signup = true

[permalinks]
  essays = "/:slug/"
  notes = "/notes/:slug/"
```

## Theme

Uses the [tangerine-theme](https://github.com/shawnyeager/tangerine-theme) public Hugo module for layouts, CSS, and shared components.

### Local Theme Development

**One-time setup:**
Clone theme as sibling directory:
```bash
cd ~/Work/shawnyeager
git clone git@github.com:shawnyeager/tangerine-theme.git
```

**Daily workflow:**

Use the `theme-dev.sh` script from the workspace root:
```bash
cd ~/Work/shawnyeager
./theme-dev.sh com    # Start this site (port 1313)
```

The script handles replace directives and cleanup automatically.

### Deploy Theme Changes

**Automatic.** Push theme to master → PRs appear in ~3 min.

```bash
# Push theme
git -C ~/Work/shawnyeager/tangerine-theme push origin master

# Wait for PR, review deploy preview, merge when ready
gh pr list --label theme-update
```

**DO NOT manually run `hugo mod get`** - workflow handles everything.

## Publishing Workflow

1. Create content: `hugo new content/essays/essay-slug.md` or `hugo new content/notes/note-slug.md`
2. Write content with frontmatter (title, description, date, topics)
3. Preview locally: `hugo server -D -p 1313`
4. Push to master — Netlify builds and deploys automatically

## Key Features

- **Clean permalinks** — `/essay-title/` for essays, `/notes/note-title/` for notes
- **Unified /writing/ page** — Chronological stream of all content
- **Reading time** — Displayed on essays
- **Topics** — Taxonomy-based browsing across both content types
- **Newsletter signup** — Buttondown integration in footer
- **RSS feeds** — `/feed.xml` (essays), `/notes/feed.xml` (notes)
- **V4V Lightning payments** — Edge functions for LNURL-pay
