# shawnyeager.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/345f9641-36ce-4cef-a6ce-d2f0b1e1de73/deploy-status)](https://app.netlify.com/sites/shawnyeager-com/deploys)

**The Gallery** — Finished essays and professional content.

## About

This is the public-facing side of a two-site system:
- **shawnyeager.com** (this site) — Polished essays and published work
- **[notes.shawnyeager.com](https://notes.shawnyeager.com)** — Rough notes and explorations

Content here is indexed by search engines and represents the professional brand. Essays are organized by topics and tags for browsing.

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
- **Satoshi + Inter variable fonts** — Provided by theme

## Configuration

Key parameters in `hugo.toml`:

```toml
[params]
  content_type = "essays"
  favicon_style = "solid"
  noindex = false                 # Optional: set to true to block search engines
  show_read_time = true
  show_email_signup = true
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
./theme-dev.sh        # Start both sites
./theme-dev.sh com    # Start only this site (port 1313)
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

1. Create essay: `hugo new content/essays/essay-slug.md`
2. Write content with frontmatter (title, description, date, topics, tags)
3. Preview locally: `hugo server -D -p 1313`
4. Push to master — Netlify builds and deploys automatically

## Key Features

- **Clean permalinks** — `/essay-title/` instead of `/essays/2025/10/essay-title/`
- **Reading time** — Displayed on all essays
- **Topics & tags** — Taxonomy-based browsing
- **Newsletter signup** — Buttondown integration in footer
- **RSS feed** — Available at `/feed.xml`
- **Solid favicon** — Orange square distinguishes from notes.shawnyeager.com outlined square

## Philosophy

The Gallery is for finished work. Essays here are polished, professional, and public. This is where ideas that started rough in the Workshop get refined and published for broader audiences.
