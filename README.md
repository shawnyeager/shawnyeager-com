# shawnyeager.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/345f9641-36ce-4cef-a6ce-d2f0b1e1de73/deploy-status)](https://app.netlify.com/sites/shawnyeager-com/deploys)

Professional site for finished essays and public-facing content. Built with Hugo using a shared theme module.

**Live site:** [shawnyeager.com](https://shawnyeager.com)

## Quick Start

```bash
# Local development with drafts
hugo server -D -p 1313

# Build for production
hugo --minify

# Create new essay
hugo new content/essays/essay-slug.md
```

## Architecture

This site uses [Hugo Modules](https://gohugo.io/hugo-modules/) to import the [tangerine-theme](https://github.com/shawnyeager/tangerine-theme), a shared theme module containing layouts, CSS, and partials.

**Key features:**
- Clean permalink structure (`/essay-title/` instead of `/essays/2025/10/essay-title/`)
- Topic and tag taxonomies for browsing essays
- Reading time display on essays
- Newsletter signup integration (Buttondown)
- RSS feed at `/feed.xml`

## Content Structure

```
content/
├── essays/          # Published essays with topics and tags
├── now.md           # Current focus page (update monthly)
├── media.md         # Press/media information
├── podcast.md       # Podcast subscription links
├── connect.md       # Contact methods
├── encrypt.md       # PGP keys
└── subscribed.md    # Newsletter confirmation
```

## Deployment

Automatic deployment via Netlify on push to `master`. Build command uses `GITHUB_TOKEN` environment variable to access the private theme module.

## Related

- **[tangerine-theme](https://github.com/shawnyeager/tangerine-theme)** - Shared Hugo theme module
- **[shawnyeager.org](https://github.com/shawnyeager/shawnyeager-org)** - Sister site for work-in-progress notes

## Documentation

See [CLAUDE.md](CLAUDE.md) for detailed architecture, configuration, and development guidance.
