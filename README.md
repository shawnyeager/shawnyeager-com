# shawnyeager.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/345f9641-36ce-4cef-a6ce-d2f0b1e1de73/deploy-status)](https://app.netlify.com/sites/shawnyeager-com/deploys)
![Version](https://img.shields.io/badge/version-v1.0.0-orange)

**The Gallery** — Finished essays and professional content.

## About

This is the public-facing side of a two-site system:
- **shawnyeager.com** (this site) — Polished essays and published work
- **[shawnyeager.org](https://shawnyeager.org)** — Rough notes and explorations

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

- **Hugo** 0.151.0 — Static site generator
- **Hugo Modules** — Theme imported from [tangerine-theme](https://github.com/shawnyeager/tangerine-theme)
- **Netlify** — Automatic deployment on push to master
- **System fonts** — No external dependencies

## Configuration

Key parameters in `hugo.toml`:

```toml
[params]
  content_type = "essays"
  favicon_style = "solid"
  noindex = false
  show_read_time = true
  show_email_signup = true
```

## Project Structure

```
shawnyeager-com/
├── content/
│   ├── essays/
│   ├── now.md
│   ├── media.md
│   ├── podcast.md
│   ├── connect.md
│   ├── encrypt.md
│   └── subscribed.md
├── layouts/
│   ├── index.html
│   ├── essays/
│   ├── page/
│   ├── _default/
│   ├── partials/
│   └── shortcodes/
├── static/
│   ├── images/
│   └── assets/
├── hugo.toml
├── go.mod
└── netlify.toml
```

## Theme Module

Uses Hugo Modules to import the shared [tangerine-theme](https://github.com/shawnyeager/tangerine-theme):

```toml
[module]
  [[module.imports]]
    path = "github.com/shawnyeager/tangerine-theme"
```

**Local development:** The `~/Work/hugo.work` file automatically redirects to your local theme directory. No config changes needed! Just edit the theme and changes appear immediately.

**Production (Netlify):** Fetches from GitHub at the version locked in `go.mod`.

**Update theme version:**
```bash
hugo mod get github.com/shawnyeager/tangerine-theme@v1.10.7
git add go.mod go.sum && git commit -m "Update theme to v1.10.7" && git push
```

## Publishing Workflow

1. Create essay: `hugo new content/essays/essay-slug.md`
2. Write content with frontmatter (title, description, date, topics, tags)
3. Preview locally: `hugo server -D -p 1313`
4. Build: `hugo --minify`
5. Push to master — Netlify deploys automatically

## Key Features

- **Clean permalinks** — `/essay-title/` instead of `/essays/2025/10/essay-title/`
- **Reading time** — Displayed on all essays
- **Topics & tags** — Taxonomy-based browsing
- **Newsletter signup** — Buttondown integration in footer
- **RSS feed** — Available at `/feed.xml`
- **Solid favicon** — Orange square distinguishes from .org's outlined square

## Philosophy

The Gallery is for finished work. Essays here are polished, professional, and public. This is where ideas that started rough in the Workshop get refined and published for broader audiences.

---

**Shawn Yeager**
Essays: [shawnyeager.com](https://shawnyeager.com)
Notes: [shawnyeager.org](https://shawnyeager.org)
Nostr: [shawnyeager.com/connect](https://shawnyeager.com/connect)
GitHub: [@shawnyeager](https://github.com/shawnyeager)
