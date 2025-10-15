# shawnyeager.com - The Gallery

**Professional site for finished essays and public-facing content**

## Purpose

The Gallery: Polished, finished work. This is where completed essays, professional bio, media information, and podcast details live. Content here is indexed by search engines and represents the public-facing brand.

## Repository Structure

```
shawnyeager-com/
├── CLAUDE.md                    # This file
├── hugo.toml                    # Site configuration
├── go.mod                       # Hugo Modules config
├── content/
│   ├── essays/                  # Published essays
│   ├── now.md                   # Current focus page
│   ├── media.md                 # Press/media page
│   ├── connect.md               # Contact page
│   ├── encrypt.md               # PGP keys page
│   └── subscribed.md            # Newsletter confirmation
├── layouts/
│   ├── index.html               # Custom homepage
│   ├── essays/                  # Essay templates
│   ├── page/                    # Page templates
│   └── partials/
│       └── head.html            # Solid favicon override
├── static/
│   ├── css/
│   │   └── main.css             # Design system (copied from theme during dev)
│   ├── images/                  # Site images
│   └── assets/                  # Downloadable assets
└── public/                      # Built site (not committed)
```

## Theme Module

This site imports the shared theme:

```toml
[module]
  [[module.imports]]
    path = "github.com/shawnyeager/tangerine-theme"  # Production
    # path = "/home/shawn/Work/tangerine-theme"      # Local testing
```

**For local development:** Use local path
**For production:** Use GitHub URL

## Site Configuration

Key settings in `hugo.toml`:

```toml
baseURL = "https://shawnyeager.com/"
title = "Shawn Yeager"

[params]
  show_read_time = true           # Show reading time on essays
  description = "Bitcoin go-to-market and revenue leader..."

[taxonomies]
  topic = "topics"                # Browse essays by topic
  tag = "tags"                    # Browse essays by tag
```

## Content Structure

### Essays (`content/essays/`)

Markdown files with frontmatter:

```yaml
---
title: "Essay Title"
description: "SEO description"
date: 2025-10-15
topics: ["Bitcoin", "Strategy"]
tags: ["go-to-market", "sales"]
---

Essay content here...
```

### Special Pages

- **`now.md`**: Current focus (update monthly)
- **`media.md`**: Press/media info, bios, photos
- **`connect.md`**: Contact methods
- **`encrypt.md`**: PGP keys for secure communication
- **`subscribed.md`**: Newsletter confirmation (hide_footer_signup: true)

### Frontmatter Parameters

```yaml
hide_footer_signup: true  # Hide newsletter form on utility pages
type: page                # Use page layout instead of default
```

## Template Overrides

This site overrides these theme templates:

1. **`layouts/index.html`**: Custom homepage with:
   - Bio paragraph
   - Latest essay with excerpt
   - Podcast feature box
   - Topic tags section
   - Recent essays list

2. **`layouts/partials/head.html`**: Solid orange square favicon (The Gallery metaphor)

3. **`layouts/essays/`**: Essay-specific layouts:
   - `single.html`: Individual essay page
   - `list.html`: Essays index page

4. **`layouts/page/single.html`**: Generic page layout (now, media, etc.)

## Common Tasks

### Publishing a New Essay

```bash
cd ~/Work/shawnyeager-com

# Create new essay
hugo new content/essays/essay-slug.md

# Edit the file
# Add title, description, date, topics, tags
# Write content

# Preview locally
hugo server -D -p 1313
# View at http://localhost:1313

# Build
hugo --minify

# Deploy (push to GitHub, Netlify builds automatically)
git add content/essays/essay-slug.md
git commit -m "Add new essay: Title"
git push
```

### Updating Now Page

```bash
# Edit content/now.md
# Update date and current focus

hugo --minify
git add content/now.md
git commit -m "Update now page"
git push
```

### Adding Images

```bash
# Place in static/images/
cp ~/Downloads/image.webp static/images/

# Reference in markdown
![Alt text](/images/image.webp)

# Commit
git add static/images/image.webp
git commit -m "Add image"
git push
```

## Design System

### Colors
- **Brand**: Trust Revolution Orange (#F84200 light, #FF5733 dark)
- **Text**: #1a1a1a (light), #e8e8e8 (dark)
- **Secondary**: #555 (light), #d0d0d0 (dark)
- **Meta**: #777 (light), #999 (dark)

### Typography
- **System fonts**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto...
- **Base**: 16px, 1.6 line-height
- **Essay body**: 18px, 1.7 line-height
- **H1**: 2rem, 700 weight
- **H2**: 1.25rem, 600 weight

### Spacing
- **Section gaps**: 3rem (`var(--space-section)`)
- **Dividers**: 2rem (`var(--space-divider)`)
- **Elements**: 1.5rem (`var(--space-element)`)
- **Tight**: 1rem (`var(--space-tight)`)

## Key Differences from .org

| Feature | .com (Gallery) | .org (Workshop) |
|---------|----------------|-----------------|
| Purpose | Finished work | Work in progress |
| Date format | October 15, 2025 | 2025 · 10 |
| Reading time | Shown | Hidden |
| Homepage | Feature-rich | Simple |
| Newsletter | Shown in footer | Not shown |
| Search indexing | Allowed | Blocked |
| Favicon | Solid square | Outlined square |

## Testing Checklist

Before deploying:
- [ ] Build succeeds: `hugo --minify`
- [ ] No broken links
- [ ] Images load correctly
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Newsletter form works (test subscribe)
- [ ] RSS feed valid: `/feed.xml`
- [ ] Reading time accurate
- [ ] Topics/tags link correctly

## Deployment

**Platform:** Netlify

**Build settings:**
- Build command: `hugo --minify`
- Publish directory: `public`
- Hugo version: 0.151.0 (set in `netlify.toml` or environment)

**Custom domain:** shawnyeager.com

**Deploy:**
```bash
git push origin master
# Netlify automatically builds and deploys
```

## Related Repositories

- **tangerine-theme**: Shared theme module
  - `github.com/shawnyeager/tangerine-theme`
  - Contains layouts, CSS, partials

- **shawnyeager-org**: The Workshop (notes site)
  - `github.com/shawnyeager/shawnyeager-org`
  - Sister site for work-in-progress content

## Archived Monorepo

Original development happened in: `~/Work/hugo-sites-project`

Contains:
- Design system specification: `docs/design-system-specification.md`
- HTML mockups: `docs/shawnyeager-com-mockup.html`
- Original templates and CSS
- Full project history

**Reference for:** Design decisions, mockups, specifications

## Notes

- Never commit `public/` directory (in `.gitignore`)
- Newsletter uses Buttondown (form action in footer)
- Analytics: Plausible (script in head partial)
- Solid orange favicon differentiates from .org's outlined favicon
- Update now page monthly (set reminder)
