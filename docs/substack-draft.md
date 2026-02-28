# substack-draft

Creates a Substack draft from a Hugo markdown file. Reads frontmatter for title, subtitle, hero image, and draft status. Uploads the hero image and creates the draft on Substack with the formatted post body.

## Usage

```bash
./scripts/substack-draft content/notes/my-post.md
./scripts/substack-draft content/essays/my-essay.md
./scripts/substack-draft content/notes/my-post.md --dry-run
./scripts/substack-draft content/notes/my-post.md --hero path/to/image.png
```

`--dry-run` parses and validates without creating anything on Substack.

`--hero` overrides the hero image from frontmatter.

## Setup

Set credentials as env vars (or in `.env` at repo root):

```bash
export SUBSTACK_PUBLICATION_URL="https://sideband.substack.com"

# Option A: Cookie (more reliable, expires every few weeks)
export SUBSTACK_COOKIE="substack.sid=..."

# Option B: Email/password (simpler, can hit CAPTCHAs)
export SUBSTACK_EMAIL="you@example.com"
export SUBSTACK_PASSWORD="yourpassword"
```

To get the cookie: log into substack.com, open DevTools (F12), go to Network tab, refresh, click any request, copy the full Cookie header value.

Requires `uv` (provided by mise.toml in this repo).

## Frontmatter

```yaml
---
title: My post title            # required
subtitle: A short subtitle      # optional, used as Substack subtitle
draft: true                     # blocks publishing when true
hero_image: images/essays/x.png # resolved from assets/, static/, or repo root
---
```

## What it does

1. Parses frontmatter and body from the markdown file
2. Refuses to publish if `draft: true`
3. Checks Substack for an existing draft with the same title (aborts if found)
4. Uploads hero image to Substack's CDN (if present)
5. Converts markdown body to Substack's document format
6. Creates the draft with hero inline at top and as social preview image
7. Prints the draft URL for review

Always creates a draft — never publishes directly. Review and publish from Substack's editor.

## Limitations

- Lists (bullet and ordered) render as flat paragraphs — fix manually in Substack editor
- No tag support (Substack's API doesn't expose tags)
- Cookie auth expires every few weeks
