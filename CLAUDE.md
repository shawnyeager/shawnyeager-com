# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## About

**shawnyeager.com** - "The Gallery" for finished essays and professional content.

This is the public-facing side of a two-site system:
- **shawnyeager.com** (this site) - Polished essays and published work
- **notes.shawnyeager.com** - Rough notes and explorations (The Workshop)

Built with Hugo using the tangerine-theme module. Content is indexed by search engines and represents the professional brand.

---

## Quick Start

```bash
# Local development with drafts
hugo server -D -p 1313

# Create new essay
hugo new content/essays/essay-slug.md

# Build for production
hugo --minify
```

---

## Design System

**Always use design tokens, never hardcode values:**

- ✅ `font-size: var(--font-lg);` ❌ `font-size: 18px;`
- ✅ `margin-top: var(--space-xl);` ❌ `margin-top: 32px;`
- ✅ `color: var(--text-primary);` ❌ `color: #1a1a1a;`

Theme tokens defined in tangerine-theme. If a value doesn't have a token, ask before hardcoding.

---

## Site Configuration

Key parameters in `hugo.toml`:

```toml
[params]
  content_type = "essays"         # Parameterizes theme templates
  favicon_style = "solid"         # Solid square (vs "outlined" on .notes)
  noindex = false                 # Allow search indexing (true on .notes)
  show_read_time = true           # Show reading time (false on .notes)
  show_email_signup = true        # Footer newsletter form

[taxonomies]
  topic = "topics"
  tag = "tags"

[outputFormats.RSS]
  baseName = "feed"               # Output: /feed.xml not /index.xml

[permalinks]
  essays = "/:contentbasename/"   # Clean URLs without dates
```

---

## Essay Frontmatter

```yaml
---
title: "Essay Title"
description: "SEO description for social sharing"  # REQUIRED
date: 2025-10-15
topics: ["Bitcoin", "Strategy"]  # Taxonomy for topic browsing
tags: ["go-to-market", "sales"]  # Taxonomy for tag filtering
---
```

**CRITICAL:** The `description` field is REQUIRED for all essays. Used for:
- Meta description tag (SEO)
- Open Graph og:description (social sharing)
- Twitter Card description
- Essays listing pages

**Special frontmatter flags:**
- `hide_footer_signup: true` - Hides newsletter form (utility pages)
- `show_title: true` - Forces H1 title to be visible
- `type: page` - Forces page layout instead of default

---

## Page Title Visibility

This site uses smart page title visibility. Individual essays show H1 titles, while utility pages hide them (sr-only for accessibility).

**Visible title pages:**
- Individual essays (automatic)
- /now (has `show_title: true`)
- /podcast (has `show_title: true`)

**Hidden title pages (sr-only):**
- /essays/ listing
- /media, /connect, /encrypt, /subscribed (utility pages)

To show a page title: add `show_title: true` to frontmatter.

---

## Template Overrides

This site overrides these theme templates in `layouts/`:

- `index.html` - Custom homepage (bio, latest essay, podcast, topics)
- `essays/single.html` - Individual essay page with reading time
- `essays/list.html` - Essays index page
- `page/single.html` - Generic pages (now, media, connect, etc.)
- `_default/now.html` - Special layout for /now page
- `_default/podcast.html` - Special layout for /podcast page
- `partials/page-title.html` - Page title visibility logic
- `partials/topic-list.html` - Topics navigation component
- `shortcodes/contact-method.html` - Contact link component

Templates fall back to tangerine-theme if not overridden locally.

---

## Deployment

**Platform:** Netlify

**Build:**
- Trigger: Push to `master` branch
- Command: `hugo --minify`
- Publish directory: `public/`
- Hugo version: 0.152.2 (set in `netlify.toml`)

**Verification checklist:**
- [ ] Build succeeds
- [ ] No broken links
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Reading time shown on essays
- [ ] Newsletter form in footer
- [ ] Solid orange favicon

---

## Content Structure

```
content/
├── essays/              # Main content (title, description, date, topics, tags)
├── now.md              # Updated monthly
├── media.md            # Press/media info
├── podcast.md          # Podcast feature page
├── connect.md          # Contact methods
├── encrypt.md          # PGP keys
└── subscribed.md       # Newsletter confirmation
```

---

## Critical Constraints

1. **Never commit `public/` directory** - Build artifact (in `.gitignore`)
2. **Preserve essay permalinks** - Changing `[permalinks]` breaks existing URLs
3. **Monthly /now updates** - Convention to keep /now page current
4. **Description required** - All essays must have `description` in frontmatter
5. **Design tokens only** - Never hardcode CSS values

---

## Related Sites

- **notes.shawnyeager.com** - The Workshop (notes, WIP content)
