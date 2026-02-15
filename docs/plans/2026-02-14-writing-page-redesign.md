# /writing Page Redesign — "Rhythm Break" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign /writing to visually differentiate essays (finished pieces) from notes (working ideas) using a Rhythm Break pattern, with topic navigation moved to the top.

**Architecture:** Replace the flat chronological stream with two distinct visual treatments: essays as full blocks (title + description + meta), notes as compact single-line rows. Topics become typographic nav links at the top of the page, linking to Hugo taxonomy pages for SEO. All new CSS class names (`.writing-stream`, `.writing-essay`, `.writing-note`, `.writing-topics`) to avoid conflicts with existing base `.essay-item`/`.note-item` styles used elsewhere.

**Tech Stack:** Hugo templates (Go), CSS (design tokens from tangerine-theme)

---

### Task 1: Rewrite the writing page template

**Files:**
- Modify: `layouts/writing/list.html`

**Step 1: Replace the template**

Replace the entire contents of `layouts/writing/list.html` with:

```html
{{/*
Purpose: Unified writing page at /writing/

"Rhythm Break" pattern:
  - Essays: full blocks (title + description + meta) — breathe
  - Notes: compact single-line rows (date + title) — cluster
  - Topics: typographic nav at top, linking to /topics/ pages
*/}}

{{ define "main" }}
    {{ partial "page-title.html" . }}

    {{ with .Content }}
    <div class="page-intro">
        {{ . }}
    </div>
    {{ end }}

    {{/* Topic navigation — editorial section headers */}}
    {{ if .Site.Taxonomies.topics }}
    <nav class="writing-topics" aria-label="Browse by topic">
        {{ range .Site.Taxonomies.topics }}
        <a href="{{ .Page.RelPermalink }}">{{ .Page.Title }}</a>
        {{ end }}
    </nav>
    {{ end }}

    {{/* Collect all essays and notes, filter drafts in production */}}
    {{ $essays := where .Site.RegularPages "Type" "essays" }}
    {{ $notes := where .Site.RegularPages "Type" "notes" }}
    {{ if not hugo.IsServer }}
        {{ $essays = where $essays "Draft" false }}
        {{ $notes = where $notes "Draft" false }}
    {{ end }}

    {{/* Merge, sort by date descending, and paginate */}}
    {{ $allWriting := union $essays $notes }}
    {{ $allWriting = sort $allWriting "Date" "desc" }}
    {{ $paginator := .Paginate $allWriting }}

    <section class="writing-stream">
        {{ range $paginator.Pages }}
        {{ if eq .Type "essays" }}
        {{/* Essay block — title, description, meta line with reading time and topics */}}
        <article class="writing-essay">
            <a href="{{ .RelPermalink }}" class="writing-essay-title">{{ .Title }}</a>
            {{ with .Params.description }}<p class="writing-essay-desc">{{ . }}</p>{{ end }}
            <div class="writing-essay-meta">
                <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "Jan 2006" }}</time>
                {{ with .ReadingTime }}<span class="writing-essay-readtime">{{ . }} min</span>{{ end }}
                {{ with $.Params.topics }}{{ else }}
                {{ with .GetTerms "topics" }}
                <span class="writing-essay-topics">
                    {{ range . }}<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>{{ end }}
                </span>
                {{ end }}
                {{ end }}
            </div>
        </article>
        {{ else }}
        {{/* Note row — compact date + title */}}
        <article class="writing-note">
            <a href="{{ .RelPermalink }}">
                <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "Jan 2006" }}</time>
                <span class="writing-note-title">{{ .Title }}</span>
            </a>
        </article>
        {{ end }}
        {{ end }}
    </section>

    {{/* Pagination */}}
    {{ if or $paginator.HasPrev $paginator.HasNext }}
    <nav class="writing-pagination" aria-label="Browse writing">
        {{ if $paginator.HasPrev }}
        <a href="{{ $paginator.Prev.URL }}" class="pagination-prev" aria-label="Go to previous page: Recent"><span class="arrow" aria-hidden="true">←</span><span class="link-text">Recent</span></a>
        {{ end }}
        {{ if $paginator.HasNext }}
        <a href="{{ $paginator.Next.URL }}" class="pagination-next" aria-label="Go to next page: More"><span class="link-text">More</span><span class="arrow" aria-hidden="true">→</span></a>
        {{ end }}
    </nav>
    {{ end }}
{{ end }}
```

**Step 2: Verify template renders**

Run: Refresh `http://localhost:1313/writing/` (Hugo live reload should auto-rebuild)
Expected: Page renders with new structure but unstyled (no CSS yet for new classes)

**Step 3: Commit**

```bash
git add layouts/writing/list.html
git commit -m "Rewrite /writing template for Rhythm Break pattern"
```

---

### Task 2: Add Rhythm Break CSS styles

**Files:**
- Modify: `../tangerine-theme/assets/css/main.css` (lines 1155-1257)

**Step 1: Replace the old `.writing-list` CSS section**

In `tangerine-theme/assets/css/main.css`, replace lines 1155-1257 (from the `/* Writing list` comment through `.writing-nav-pagination` closing brace) with:

```css
/* Writing stream — Rhythm Break pattern (mixed essays + notes)
   Essays: full blocks (title + description + meta) — breathe
   Notes: compact single-line rows (date + title) — cluster
   -------------------------------------------------- */
.writing-stream {
    margin-top: var(--space-lg);
}

/* Topic navigation — editorial section headers */
.writing-topics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-lg);
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: var(--border-subtle);

    a {
        font-family: var(--font-heading);
        font-size: var(--font-sm);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
        color: var(--text-meta);
        text-decoration: none;
        transition: color var(--transition-fast);

        &:hover {
            color: var(--brand-orange);
        }
    }
}

/* Essay blocks — breathe */
.writing-essay {
    margin-bottom: var(--space-xl);
}

.writing-essay-title {
    display: block;
    font-family: var(--font-heading);
    font-size: var(--font-xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-heading);
    color: var(--text-primary);
    text-decoration: none;
    letter-spacing: var(--letter-spacing-tight-md);

    &:hover {
        color: var(--brand-orange);
    }
}

.writing-essay-desc {
    margin-top: var(--space-xs);
    font-family: var(--font-body);
    font-size: var(--font-base);
    font-weight: var(--font-weight-body);
    line-height: var(--line-height-body);
    color: var(--text-secondary);
}

.writing-essay-meta {
    margin-top: var(--space-xs);
    font-family: var(--font-heading);
    font-size: var(--font-sm);
    color: var(--text-meta);
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-sm);
    align-items: baseline;
}

.writing-essay-readtime::before {
    content: "·";
    margin-right: var(--space-sm);
}

.writing-essay-topics {
    display: inline-flex;
    gap: var(--space-xs);

    &::before {
        content: "·";
        margin-right: var(--space-xs);
    }

    a {
        font-size: var(--font-xs);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
        color: var(--text-meta);
        text-decoration: none;

        &:hover {
            color: var(--brand-orange);
        }
    }
}

/* Note rows — compact cluster */
.writing-note {
    margin-bottom: var(--space-sm);

    a {
        display: flex;
        align-items: baseline;
        gap: var(--space-sm);
        text-decoration: none;
        padding-left: var(--space-xs);
        border-left: 2px solid transparent;
        transition: border-color var(--transition-fast);

        &:hover {
            border-color: var(--brand-orange);
        }
    }

    time {
        font-family: var(--font-heading);
        font-size: var(--font-sm);
        color: var(--text-meta);
        white-space: nowrap;
        flex-shrink: 0;
    }
}

.writing-note-title {
    font-family: var(--font-heading);
    font-size: var(--font-base);
    font-weight: var(--font-weight-list-title);
    color: var(--text-primary);
}

/* Writing pagination */
.writing-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: var(--border-subtle);

    a {
        font-family: var(--font-heading);
        font-size: var(--font-sm);
        color: var(--text-meta);
        text-decoration: none;

        &:hover {
            color: var(--brand-orange);
        }
    }

    .arrow {
        display: inline-block;
        margin-inline: var(--arrow-spacing);
    }
}
```

**Step 2: Verify styles render**

Run: Refresh `http://localhost:1313/writing/`
Expected: Rhythm Break pattern visible — essays with title/description/meta blocks, notes as compact rows, topics at top as uppercase text links

**Step 3: Commit theme change**

```bash
cd ../tangerine-theme
git add assets/css/main.css
git commit -m "Replace writing-list CSS with Rhythm Break pattern"
```

---

### Task 3: Visual QA

**Step 1: Check light mode**

Verify at `http://localhost:1313/writing/`:
- Topics: uppercase, letterspaced, `--text-meta` color, orange on hover
- Essays: title larger, description below, meta line with date + reading time + topic labels
- Notes: compact rows with date + title, orange left border on hover
- Clear rhythm difference between essay blocks and note clusters

**Step 2: Check dark mode**

Press `d` on the page to toggle dark mode. Verify all colors adapt correctly.

**Step 3: Check mobile (narrow viewport)**

Resize browser to ~375px width. Verify:
- Topic links wrap cleanly
- Essay blocks don't overflow
- Note rows stay on one line (title truncates if needed)

**Step 4: Iterate on spacing/sizing**

Adjust token values if the rhythm doesn't feel right. The key ratios:
- Essay bottom margin (`--space-xl` = 32px) should be ~2.5x note margin (`--space-sm` = 12px)
- If essays feel too tight, try `--space-2xl` (48px)
- If notes feel too spread, try `--space-xs` (8px)
