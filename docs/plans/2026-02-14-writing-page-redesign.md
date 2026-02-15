# /writing Page Redesign — "Rhythm Break"

## Problem

The current /writing page is a flat chronological stream where essays and notes are visually identical (same date + title row format). Topics are buried at the bottom. Nothing communicates the conceptual distinction: essays are finished pieces, notes are working ideas.

## Design Decisions

### Content Model
- **Essays** = finished, polished pieces
- **Notes** = working ideas, rougher, in-progress thinking

### Topic Navigation
- **Placement**: Top of page, below intro text, above content stream
- **Style**: Typographic text links (Satoshi, uppercase, letterspaced) — not pill buttons
- **Behavior**: Each topic links to `/topics/{topic}/` for SEO value
- **Separator**: Subtle border-bottom below topic nav to separate from content

### Content Differentiation: Rhythm Break Pattern
The page has two distinct visual rhythms that alternate based on content type.

**Essays (full blocks — breathe):**
- Title: Satoshi, `--font-xl`, `--font-weight-semibold`, links to essay
- Description: Inter, `--font-base`, `--text-secondary` (from frontmatter)
- Meta line: date (Jan 2026 format) + reading time, Satoshi `--font-sm`, `--text-meta`
- Topic indicators: small inline labels, Satoshi uppercase `--font-xs`, `--text-meta`, link to topic pages
- Spacing: `--space-xl` margin-bottom
- No hero images on /writing page (hero lives on essay single page and /essays/ list)

**Notes (compact rows — cluster):**
- Single line: date + title inline
- Date: Satoshi, `--font-sm`, `--text-meta`, format "Jan 2026"
- Title: Satoshi, `--font-base`, `--font-weight-list-title`
- No description, no topic indicators
- Spacing: `--space-sm` margin-bottom
- Hover interaction: 2px brand-orange left border with subtle padding-left

### What's NOT Changing
- Page URL: /writing/
- Pagination: existing prev/next pattern
- Content source: union of essays + notes, sorted by date desc
- No client-side JavaScript filtering
- No type toggle (All/Essays/Notes)

## Files to Modify

1. `layouts/writing/list.html` — Template rewrite for new structure
2. `tangerine-theme/assets/css/main.css` — New styles for rhythm break pattern (or site-local CSS override)

## Files NOT to Modify

- Content frontmatter (no new fields needed)
- hugo.toml (no config changes)
- Other templates (homepage, essay single, note single)
