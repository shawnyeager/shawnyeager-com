# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## About

**shawnyeager.com** — Essays, notes, and advisory services for frontier tech founders.

All writing lives on one domain. Essays are longer, polished pieces at `/:slug/`. Notes are shorter observations at `/notes/:slug/`. A unified `/writing/` page shows everything chronologically. The nav has three items: Writing, Advisory, Contact.

Built with Hugo using the tangerine-theme module. Content is indexed by search engines.

---

## Quick Start

**⚠️ ALWAYS start work in a branch:**
```bash
git checkout -b feature-name
```
This ensures changes go through PR with deploy preview. Never work directly on master.

```bash
# Install git hooks (first time setup)
./scripts/install-hooks.sh

# Local development with drafts
hugo server -D -p 1313

# Create new essay
hugo new content/essays/essay-slug.md

# Build for production
hugo --minify
```

**Git Hooks:** This repo includes a pre-commit hook that blocks manual commits of go.mod theme updates. Theme updates must come via GitHub Actions workflow. If you freshly clone this repo, run `./scripts/install-hooks.sh` to install the hooks.

---

## Design System

**Always use design tokens, never hardcode values:**

- ✅ `font-size: var(--font-lg);` ❌ `font-size: 18px;`
- ✅ `margin-top: var(--space-xl);` ❌ `margin-top: 32px;`
- ✅ `color: var(--text-primary);` ❌ `color: #1a1a1a;`

Theme tokens defined in tangerine-theme. If a value doesn't have a token, ask before hardcoding.

**Complete documentation:**
- Design system specs: `tangerine-theme/docs/DESIGN_SYSTEM_SPECIFICATION.md`

---

## Site Configuration

**NOTE:** Some params are inherited from `tangerine-theme/hugo.toml`:
- `copyright`, `nostr`, `github`, `twitter_handle`, `params.author`
- Hugo automatically merges theme params with site params
- Site params override theme params when both define the same key

Key site-specific parameters in `hugo.toml`:

```toml
[params]
  content_type = "essays"         # Parameterizes theme templates (home RSS)
  favicon_style = "solid"         # Solid square favicon
  noindex = false                 # Allow search indexing
  show_read_time = true           # Show reading time on essays
  show_email_signup = true        # Footer newsletter form

[taxonomies]
  topic = "topics"

[outputFormats.RSS]
  baseName = "feed"               # Output: /feed.xml not /index.xml

[permalinks]
  essays = "/:slug/"              # Essays at root: /essay-slug/
  notes = "/notes/:slug/"         # Notes under /notes/: /notes/note-slug/
```

---

## Content Frontmatter

### Essays

```yaml
---
title: "Essay Title"
description: "SEO description for social sharing"  # REQUIRED
date: 2025-10-15
topics: ["Bitcoin", "Strategy"]
---
```

### Notes

```yaml
---
title: "Note Title"
description: "Brief summary for SEO and social"  # REQUIRED
date: 2025-10-15
slug: note-slug
topics: ["bitcoin", "sales"]
draft: false
---
```

**CRITICAL:** The `description` field is REQUIRED for all content. Used for meta tags, OG, and listing pages.

**Special frontmatter flags:**
- `hide_footer_signup: true` - Hides newsletter form (utility pages)
- `show_title: true` - Forces H1 title to be visible
- `type: page` - Forces page layout instead of default

**RSS Feed Requirement (essays only):**

All essays MUST include the `<!--more-->` separator to define the summary break point for RSS feeds.

```markdown
First paragraph introducing the topic.

<!--more-->

Rest of the essay content...
```

---

## Image Requirements

**CRITICAL:** All images MUST have descriptive alt text for accessibility and SEO.

**Markdown images:**
```markdown
![Descriptive alt text describing the image](image.jpg)
```

**Hugo image shortcode:**
```
{{< image src="image.jpg" alt="Descriptive alt text describing the image" >}}
```

**Alt text best practices:**
- Be descriptive and concise
- Describe what the image shows, not just "image of..."
- For decorative images, use empty `alt=""` (intentional)
- For complex diagrams, consider longer descriptions

**Validation:** The image-validator workflow automatically checks all images for missing alt text on every push.

---

## Page Title Visibility

This site uses smart page title visibility. Individual essays show H1 titles, while utility pages hide them (sr-only for accessibility).

**Visible title pages:**
- Individual essays and notes (automatic)
- /writing/ (has `show_title: true`)
- /now (has `show_title: true`)

**Hidden title pages (sr-only):**
- /essays/ and /notes/ section listings
- /media, /connect, /encrypt, /subscribed (utility pages)

To show a page title: add `show_title: true` to frontmatter.

---

## Template Overrides

This site overrides these theme templates in `layouts/`:

- `index.html` - Custom homepage (bio, featured essay, recent writing)
- `essays/single.html` - Individual essay page with hero, reading time, zap CTA
- `essays/list.html` - Essays section listing (redirects to /writing/ in production)
- `notes/single.html` - Individual note page (minimal, no hero/reading time)
- `notes/list.html` - Notes section listing
- `_default/writing.html` - Unified chronological listing of all essays + notes
- `page/single.html` - Generic pages (now, media, connect, etc.)
- `_default/now.html` - Special layout for /now page
- `_default/podcast.html` - Special layout for /podcast page
- `partials/topic-list.html` - Topics navigation component
- `shortcodes/contact-method.html` - Contact link component

Templates fall back to tangerine-theme if not overridden locally.

---

## Edge Functions (V4V/Lightning)

**Functions:**
- `/.well-known/lnurlp/*` → `lnurlp.ts` - LNURL-pay metadata
- `/lnurl-callback` → `lnurl-callback.ts` - Invoice generation
- `/invoice-status` → `invoice-status.ts` - Payment status polling

**Environment Variables Required:**
- `NWC_CONNECTION_STRING` - Nostr Wallet Connect URL for invoice generation
- `NTFY_TOPIC` (optional) - ntfy.sh topic for failure alerts

**Files:**
- `netlify/edge-functions/_shared/config.ts` - CORS config, helpers
- `netlify/edge-functions/_shared/nwc.ts` - NWC client wrapper
- `netlify/edge-functions/lnurlp.ts`
- `netlify/edge-functions/lnurl-callback.ts`
- `netlify/edge-functions/invoice-status.ts`

---

## ⚠️ CRITICAL: Never Commit Replace Directives

**Replace directives break Netlify builds. NEVER commit them to go.mod:**

```toml
# ❌ NEVER COMMIT THIS LINE
replace github.com/shawnyeager/tangerine-theme => ../tangerine-theme
```

**Why:** Netlify can't access `../tangerine-theme` (parent directory outside repo). Build fails with "failed to download modules" error.

**Safe local testing workflow:**
1. Add replace directive to go.mod (DO NOT COMMIT)
2. Test changes with `hugo server -D -p 1313`
3. **Before committing:** Run `git restore go.mod` to remove replace
4. Commit ONLY template/content changes (not go.mod)
5. GitHub Actions manages go.mod automatically

**Pre-commit verification:**
```bash
git diff go.mod | grep "replace"  # Must return nothing before committing
```

**If accidentally committed:** Remove replace directive, commit fix, push immediately to unblock Netlify builds.

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
├── essays/              # Long-form essays (hero images, reading time)
├── notes/               # Shorter notes and observations
├── writing.md           # Unified /writing/ page (layout: writing)
├── now.md              # Updated monthly
├── media.md            # Press/media info
├── connect.md          # Contact methods
├── encrypt.md          # PGP keys
└── subscribed.md       # Newsletter confirmation
```

---

## Open Graph Image Generation

This site uses a Node.js script to generate OG images for essays and notes at build time.

**File:** `scripts/generate-og-images.js`

**Dependencies:** satori, sharp, gray-matter (installed via npm)

**Font files:** The script uses `assets/fonts/Satoshi-Bold.otf` for OG image generation (matches the site's header/title font). This is **separate from the theme's web font** (`tangerine-theme/static/fonts/Satoshi-Variable.woff2`) because:
- Satori (OG image generator) requires OTF/TTF format
- Satori doesn't support WOFF2 format
- The web font is optimized for browser delivery, not image generation

**Build integration:** `netlify.toml` runs `npm run generate-og` before Hugo build

**Output:** `static/images/og-essays/{slug}.png` and `static/images/og-notes/{slug}.png` (1200x630px landscape + 1200x1200px square)

---

## Critical Constraints

1. **Never commit `public/` directory** - Build artifact (in `.gitignore`)
2. **Preserve permalinks** - Essays at `/:slug/`, notes at `/notes/:slug/` — changing breaks indexed URLs
3. **Monthly /now updates** - Convention to keep /now page current
4. **Description required** - All essays and notes must have `description` in frontmatter
5. **Design tokens only** - Never hardcode CSS values

---

## ⚠️ CRITICAL: Essay Commit Rules

**ALWAYS squash essay commits before pushing to origin.** Essay development may involve many edits, but the final push must be a single clean commit.

**Workflow:**
1. Develop essay with as many local commits as needed
2. Before pushing: `git reset --soft <base-commit>` to squash
3. Create single commit with clean message (e.g., "Publish: Essay title")
4. Push to origin

---

## Theme Updates (PR-Based Workflow)

This site uses a **PR-based workflow** for theme updates to save Netlify credits.

**How it works:**
1. Theme pushed to master → manual workflow trigger (or daily cron)
2. GitHub Actions creates PR with theme updates
3. Netlify builds FREE deploy preview
4. Review preview, merge PR when ready
5. Production build (15 credits)

**After theme push, wait for PR:**

```bash
# Check for new PR
gh pr list --repo shawnyeager/shawnyeager-com --label theme-update

# Review deploy preview in PR
# Merge when satisfied
```

**DO NOT manually run `hugo mod get`** - GitHub Actions handles everything.

**Manual update only if workflow fails:**

```bash
hugo mod get -u github.com/shawnyeager/tangerine-theme
git add go.mod go.sum
git commit -m "chore: update theme"
git push origin master
```

**Theme is public and tracks master branch.**

---

## Related Sites

- **notes.shawnyeager.com** - Redirect-only; all content migrated to this site's `/notes/` section
- **share.shawnyeager.com** - Private deliverables portal (unguessable URLs, noindex)
