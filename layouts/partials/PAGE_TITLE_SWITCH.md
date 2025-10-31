# Page Title Visibility Switch

## Overview

The `page-title.html` partial provides a unified way to control whether page titles are displayed visually or hidden from sight (but available to screen readers).

## How It Works

### Logic

```
IF content type is "essays"
    → Show H1 page title visually (articles need prominent titles)
ELSE (type is "page")
    → Check frontmatter: show_title parameter
        IF show_title: true
            → Show H1 page title visually
        ELSE (default)
            → Hide H1 title (sr-only class, screen-reader only)
```

## Usage

### In Templates

Replace hardcoded H1 titles with the partial:

```html
<!-- Before -->
<h1 class="page-title">{{ .Title }}</h1>

<!-- After -->
{{ partial "page-title.html" . }}
```

### In Content Frontmatter

#### For Pages That Should Show Title

Add `show_title: true` to frontmatter:

```yaml
---
title: "Now"
type: page
layout: now
show_title: true
---
```

#### For Pages That Should Hide Title (Default)

No frontmatter needed - titles are hidden by default:

```yaml
---
title: "Media"
type: page
layout: single
---
```

#### For Essays (Automatic)

Essays always show titles - no frontmatter needed:

```yaml
---
title: "Article Title"
type: essays
---
```

## Current Configuration

### Pages With Visible Titles
- `/now` - Has `show_title: true`
- `/podcast` - Has `show_title: true`
- All essays (automatic via type: essays)

### Pages With Hidden Titles (sr-only)
- `/essays/` - Essays index
- `/media` - No show_title flag
- `/connect` - No show_title flag
- `/encrypt` - No show_title flag
- `/subscribed` - No show_title flag

## Semantic HTML Compliance

This approach maintains full accessibility:

- ✅ All pages have H1 titles in the DOM (semantic correctness)
- ✅ Screen readers announce titles on all pages
- ✅ Search engines see H1 titles (SEO)
- ✅ Visual display can be hidden with CSS (.sr-only class)
- ✅ Proper document outline on every page

## Future Pages

When creating new utility pages that shouldn't show titles:

```bash
# Just create the page with type: page
# Don't add show_title: true to frontmatter
# Title will be sr-only by default
```

When creating new feature pages that should show titles:

```bash
# Add show_title: true to frontmatter
---
title: "My Feature Page"
type: page
show_title: true
---
```

## Modifying Existing Pages

To change a page's title visibility:

```yaml
# Hide title (remove this line)
show_title: true

# Show title (add this line)
show_title: true
```

That's it. The partial handles the rest.
