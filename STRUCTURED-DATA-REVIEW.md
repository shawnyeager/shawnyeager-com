# Structured Data & Semantic HTML Review

Comprehensive audit of shawnyeager.com focusing on structured data (JSON-LD/Schema.org), semantic HTML, performance, and SEO.

**Audit Date:** 2025-11-05
**Repositories Reviewed:**
- `/home/shawn/Work/shawnyeager/shawnyeager-com` (main site)
- `/home/shawn/Work/shawnyeager/tangerine-theme` (theme module)

---

## Part 1: Existing Implementation (tangerine-theme)

### Found in: Single File

**File:** `/home/shawn/Work/shawnyeager/tangerine-theme/layouts/partials/structured-data.html`

**Included via:** `/home/shawn/Work/shawnyeager/tangerine-theme/layouts/partials/head.html` (line 112)

```html
<!-- Structured Data (JSON-LD) -->
{{ partial "structured-data.html" . }}
```

### Code:

```html
{{- if and .IsPage (or (eq .Type "essays") (eq .Type "notes")) -}}
{{- $structuredData := dict "@context" "https://schema.org" "@type" "Article" "headline" .Title "description" (cond .Description .Description .Site.Params.description) "url" .Permalink "datePublished" (.Date.Format "2006-01-02T15:04:05Z07:00") "dateModified" (.Lastmod.Format "2006-01-02T15:04:05Z07:00") -}}
{{- $author := dict "@type" "Person" "name" .Site.Params.author.name "email" .Site.Params.author.email -}}
{{- if .Site.Params.nostr -}}
  {{- $sameAs := slice .Site.Params.nostr -}}
  {{- if .Site.Params.github -}}
    {{- $sameAs = $sameAs | append .Site.Params.github -}}
  {{- end -}}
  {{- $author = merge $author (dict "sameAs" $sameAs) -}}
{{- end -}}
{{- $structuredData = merge $structuredData (dict "author" $author) -}}
{{- $publisher := dict "@type" "Person" "name" .Site.Params.author.name -}}
{{- $structuredData = merge $structuredData (dict "publisher" $publisher) -}}
{{- $mainEntity := dict "@type" "WebPage" "@id" .Permalink -}}
{{- $structuredData = merge $structuredData (dict "mainEntityOfPage" $mainEntity) -}}
{{- if or .Params.image .Site.Params.og_image -}}
  {{- $imageURL := "" -}}
  {{- if .Params.image -}}
    {{- $imageURL = .Params.image | absURL -}}
  {{- else if eq .Type "essays" -}}
    {{- $customOGPath := printf "/images/og-essays/%s.png" .File.ContentBaseName -}}
    {{- $customOGFile := printf "static%s" $customOGPath -}}
    {{- if fileExists $customOGFile -}}
      {{- $imageURL = $customOGPath | absURL -}}
    {{- else -}}
      {{- $imageURL = .Site.Params.og_image | absURL -}}
    {{- end -}}
  {{- else if eq .Type "notes" -}}
    {{- $customOGPath := printf "/images/og-notes/%s.png" .File.ContentBaseName -}}
    {{- $customOGFile := printf "static%s" $customOGPath -}}
    {{- if fileExists $customOGFile -}}
      {{- $imageURL = $customOGPath | absURL -}}
    {{- else -}}
      {{- $imageURL = .Site.Params.og_image | absURL -}}
    {{- end -}}
  {{- else -}}
    {{- $imageURL = .Site.Params.og_image | absURL -}}
  {{- end -}}
  {{- $image := dict "@type" "ImageObject" "url" $imageURL "width" 1200 "height" 630 -}}
  {{- $structuredData = merge $structuredData (dict "image" $image) -}}
{{- end -}}
<script type="application/ld+json">
{{ $structuredData | jsonify | safeJS }}
</script>
{{- end -}}
```

### Coverage:

**Schema.org types implemented:**
- `Article` - Main type for essays and notes
- `Person` - For author and publisher
- `WebPage` - For mainEntityOfPage
- `ImageObject` - For featured images

**Fields included:**

**Article:**
- `@context`: "https://schema.org"
- `@type`: "Article"
- `headline`: Page title
- `description`: Frontmatter description (fallback to site description)
- `url`: Page permalink
- `datePublished`: ISO 8601 formatted publish date
- `dateModified`: ISO 8601 formatted last modified date
- `author`: Person object
- `publisher`: Person object
- `mainEntityOfPage`: WebPage object with @id
- `image`: ImageObject (conditional)

**Person (Author):**
- `@type`: "Person"
- `name`: Site author name
- `email`: Site author email
- `sameAs`: Array of social profiles (Nostr, GitHub)

**Person (Publisher):**
- `@type`: "Person"
- `name`: Site author name

**ImageObject:**
- `@type`: "ImageObject"
- `url`: Absolute URL to image
- `width`: 1200
- `height`: 630

**Pages covered:**
- ✅ Individual essay pages (Type="essays", IsPage=true)
- ✅ Individual note pages (Type="notes", IsPage=true)
- ❌ Homepage
- ❌ List pages (/essays/)
- ❌ Taxonomy pages (/topics/, /tags/)
- ❌ Static pages (/now/, /media/, /connect/, etc.)

---

## Part 2: Gap Analysis

### Missing Schema.org Types:

1. **WebSite** - Homepage should have WebSite schema with potential search action
2. **BlogPosting** - More specific than generic "Article" for blog content
3. **BreadcrumbList** - Navigation breadcrumbs
4. **Blog** - Collection schema for /essays/ page
5. **CollectionPage** - For list/taxonomy pages
6. **Person (standalone)** - Dedicated schema for author profile pages
7. **ProfilePage** - For about/bio pages
8. **ContactPage** - For contact/connect pages
9. **Organization** - If representing business/brand (alternative to Person as publisher)

### Missing Fields in Existing Types:

**Article → Should be BlogPosting:**
- `wordCount` - Available in Hugo as `.WordCount`
- `articleBody` - Full text content
- `articleSection` - Could use first topic
- `keywords` - Could use topics/tags joined
- `inLanguage` - "en-US"
- `copyrightYear` - Available from publish date
- `copyrightHolder` - Person/Organization
- `isAccessibleForFree` - true (no paywall)
- `thumbnailUrl` - Could use OG image
- `speakable` - For voice assistants
- `commentCount` - If comments added in future

**Person (Author) - Missing:**
- `url` - Author's website (site base URL)
- `jobTitle` - Available from site description
- `description` - Bio text
- `image` - Author photo URL
- `alumniOf` - Education (if relevant)
- `worksFor` - Current employer/organization (if relevant)

**ImageObject - Missing:**
- `caption` - Image description
- `author` - Image creator
- `license` - Image licensing info
- `contentUrl` - Distinct from `url` for different purposes

**Publisher - Issue:**
- Currently uses Person type, but validators often expect Organization with logo

### Pages Without Structured Data:

1. **Homepage (/)** - No WebSite or Person schema
2. **Essays list (/essays/)** - No CollectionPage or Blog schema
3. **Topic pages (/topics/bitcoin/)** - No CollectionPage schema
4. **Tag pages (/tags/...)** - No CollectionPage schema
5. **Static pages (/now/, /media/, /podcast/, /connect/)** - No appropriate schema
6. **About page** - No ProfilePage or Person schema (if exists)

### Incorrect/Suboptimal Implementation:

**1. Generic Article instead of BlogPosting**

Current:
```html
{{- $structuredData := dict "@context" "https://schema.org" "@type" "Article" ... -}}
```

Should be:
```html
{{- $structuredData := dict "@context" "https://schema.org" "@type" "BlogPosting" ... -}}
```

**2. Publisher as Person instead of Organization**

Current:
```html
{{- $publisher := dict "@type" "Person" "name" .Site.Params.author.name -}}
```

Better for validation:
```html
{{- $publisher := dict "@type" "Organization" "name" .Site.Params.author.name "logo" (dict "@type" "ImageObject" "url" .Site.Params.og_image) -}}
```

**3. Incomplete ImageObject**

Missing caption, author, and license fields that enhance image SEO.

---

## Part 3: Semantic HTML Issues

### Files Reviewed:

**Theme:**
- `layouts/_default/baseof.html`
- `layouts/partials/head.html`
- `layouts/partials/header.html`
- `layouts/partials/footer.html`
- `layouts/partials/navigation.html`

**Site:**
- `layouts/essays/single.html`
- `layouts/essays/list.html`
- `layouts/index.html`

### Current Strengths:

✅ **Good implementations:**
- Skip link for accessibility
- Screen-reader only class (sr-only)
- Proper `<article>` tags in essay single pages
- `<time datetime="...">` elements with ISO 8601 format
- ARIA labels on form inputs
- Proper H1 hierarchy (one per page)
- `<main id="main-content">` with skip link target
- `<nav>` element for navigation
- `<header>` element for site header

### Issues Found:

**1. Footer uses `<section>` instead of `<footer>`**

Location: `tangerine-theme/layouts/partials/footer.html`

Current:
```html
<section class="site-footer">
  <!-- footer content -->
</section>
```

Should be:
```html
<footer class="site-footer">
  <!-- footer content -->
</footer>
```

**2. Missing `<article>` wrappers in list views**

List pages and homepage don't wrap individual essay items in `<article>` tags.

**3. No ARIA labels on navigation**

Current:
```html
<nav>
  <a href="/">Shawn Yeager</a>
  <a href="/essays/">Essays</a>
</nav>
```

Better:
```html
<nav role="navigation" aria-label="Main navigation">
  <a href="/">Shawn Yeager</a>
  <a href="/essays/">Essays</a>
</nav>
```

**4. Missing time attributes**

Current:
```html
<time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
```

Better:
```html
<time datetime="{{ .Date.Format "2006-01-02" }}" itemprop="datePublished">{{ .Date.Format "January 2, 2006" }}</time>
```

**5. Homepage heading hierarchy**

Issue: Section header is H2, essay title is H3 (should be reversed).

**6. No breadcrumb markup**

No semantic breadcrumb navigation with `<nav>` + `<ol>` + `aria-label="breadcrumb"`.

**7. No `rel="author"` links**

Author attribution in content should use `rel="author"` attribute.

---

## Part 4: Performance & SEO

### Meta Tags Analysis

**Existing Open Graph Tags:**

Location: `tangerine-theme/layouts/partials/head.html` (lines 56-79)

```html
<meta property="og:title" content="{{ if .Title }}{{ .Title }}{{ else }}{{ .Site.Title }}{{ end }}">
<meta property="og:description" content="{{ if .Description }}{{ .Description }}{{ else }}{{ .Site.Params.description }}{{ end }}">
<meta property="og:type" content="{{ if .IsPage }}article{{ else }}website{{ end }}">
<meta property="og:url" content="{{ .Permalink }}">
<meta property="og:image" content="{{ $ogImageURL }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

**Missing Open Graph Tags:**
- `og:locale` - "en_US"
- `og:site_name` - Site name separate from title
- `article:published_time` - ISO 8601 publish time
- `article:modified_time` - ISO 8601 modified time
- `article:author` - Author profile URL
- `article:section` - Content category
- `article:tag` - Content tags

**Twitter Card Implementation:**

Location: `tangerine-theme/layouts/partials/head.html` (lines 81-104)

```html
<meta name="twitter:card" content="{{ $twitterCardType }}">
<meta name="twitter:title" content="{{ if .Title }}{{ .Title }}{{ else }}{{ .Site.Title }}{{ end }}">
<meta name="twitter:description" content="{{ if .Description }}{{ .Description }}{{ else }}{{ .Site.Params.description }}{{ end }}">
<meta name="twitter:image" content="{{ $twitterImageURL }}">
```

**Missing Twitter Tags:**
- `twitter:site` - Site's Twitter/X handle (e.g., "@shawnyeager")
- `twitter:creator` - Author's Twitter/X handle
- `twitter:image:alt` - Alt text for accessibility

**Other Missing Meta Tags:**
- `<meta name="author" content="...">`
- `<meta name="theme-color" content="...">` - Mobile browser theme
- `<meta name="apple-mobile-web-app-title">` - iOS home screen name
- `<meta name="apple-mobile-web-app-capable">` - iOS web app mode
- `<meta name="format-detection">` - Control phone/email auto-detection

### Performance Issues

**Images - Critical Gap:**
- ❌ No `loading="lazy"` attributes
- ❌ No responsive images (`srcset`, `sizes`)
- ❌ No explicit width/height (causes layout shift - bad CLS)
- ❌ No modern format fallbacks (WebP with JPEG fallback)
- ❌ Image shortcode doesn't leverage Hugo's image processing

Current image shortcode (`tangerine-theme/layouts/shortcodes/image.html`):
```html
{{- $src := .Get "src" -}}
{{- $alt := .Get "alt" -}}
{{- $variant := .Get "variant" | default "" -}}

<img src="{{ $src }}" alt="{{ $alt }}" class="{{ $variant }}">
```

**RSS Feed - Strong Implementation:**

✅ Custom RSS template with full metadata
✅ Author, managingEditor, webMaster fields
✅ Categories from topics/tags
✅ TTL set to 24 hours
✅ Image in feed

**Resource Loading:**

✅ Font and CSS preloaded
✅ Dark mode without FOUC
✅ Variable font (Inter - single file)
✅ Minification enabled

❌ No DNS prefetch/preconnect for Plausible analytics
❌ No prefetch for likely next pages

---

## Part 5: Priority Recommendations

### Critical (High Impact, Required for Best Practices):

**1. Implement image optimization**
- Add `loading="lazy"` to all images below the fold
- Add explicit width/height to prevent layout shift
- Implement responsive images with srcset/sizes
- **Impact:** Improved Core Web Vitals (LCP, CLS)
- **Effort:** Medium

**2. Switch Article to BlogPosting**
- Change `@type` from "Article" to "BlogPosting"
- Add missing BlogPosting fields (wordCount, articleSection, keywords, inLanguage)
- **Impact:** Better search engine understanding
- **Effort:** Low

**3. Add article-specific Open Graph tags**
- `article:published_time`
- `article:modified_time`
- `article:author`
- `article:section` (from first topic)
- `article:tag` (from tags array)
- **Impact:** Better social media previews and Facebook optimization
- **Effort:** Low

**4. Add WebSite schema to homepage**
- Include site name, URL, potential search action
- Add author Person schema
- **Impact:** Enhanced homepage search results
- **Effort:** Low

**5. Fix footer semantic HTML**
- Change `<section class="site-footer">` to `<footer>`
- **Impact:** Better semantic structure and accessibility
- **Effort:** Trivial

**6. Add Twitter/X handles**
- `twitter:site` and `twitter:creator` meta tags
- **Impact:** Proper author attribution on Twitter/X
- **Effort:** Trivial

### Important (Medium Impact, Improves SEO/UX):

**1. Add structured data to list pages**
- CollectionPage schema for /essays/, /topics/, /tags/
- Include breadcrumbs
- **Impact:** Better understanding of site structure
- **Effort:** Medium

**2. Implement breadcrumb markup**
- Semantic HTML: `<nav aria-label="breadcrumb"><ol>...</ol></nav>`
- BreadcrumbList JSON-LD
- **Impact:** Breadcrumbs in search results
- **Effort:** Medium

**3. Enhance Person (author) schema**
- Add url, jobTitle, description, image fields
- Create standalone Person schema for author
- **Impact:** Rich author results
- **Effort:** Low

**4. Add ARIA labels to navigation**
- `role="navigation"` and descriptive `aria-label`
- **Impact:** Better accessibility
- **Effort:** Trivial

**5. Wrap list items in `<article>` tags**
- Homepage latest essay
- Essay list items
- **Impact:** Better semantic structure
- **Effort:** Low

**6. Add theme-color meta tag**
- Set mobile browser theme color
- **Impact:** Better mobile UX
- **Effort:** Trivial

**7. Add og:locale and og:site_name**
- Complete Open Graph implementation
- **Impact:** Minor SEO improvement
- **Effort:** Trivial

### Enhancement (Nice to Have, Future Optimization):

**1. Add ProfilePage schema**
- For about/bio pages
- **Impact:** Minor SEO benefit
- **Effort:** Low

**2. Implement critical CSS extraction**
- Inline critical CSS, defer rest
- **Impact:** Faster first paint
- **Effort:** High

**3. Add DNS prefetch/preconnect**
- For Plausible analytics domain
- **Impact:** Faster analytics loading
- **Effort:** Trivial

**4. Add speakable schema**
- For voice assistant optimization
- **Impact:** Future-proofing
- **Effort:** Low

**5. Implement image optimization pipeline**
- Automatic WebP conversion
- Multiple sizes generation
- Lazy loading by default
- **Impact:** Significant performance gains
- **Effort:** High

**6. Add ContactPage schema**
- For /connect/ page
- **Impact:** Minor SEO benefit
- **Effort:** Low

---

## Implementation Examples

### Example 1: Switch to BlogPosting with Enhanced Fields

**File:** `tangerine-theme/layouts/partials/structured-data.html`

```html
{{- if and .IsPage (or (eq .Type "essays") (eq .Type "notes")) -}}
{{- $structuredData := dict
  "@context" "https://schema.org"
  "@type" "BlogPosting"
  "headline" .Title
  "description" (cond .Description .Description .Site.Params.description)
  "url" .Permalink
  "datePublished" (.Date.Format "2006-01-02T15:04:05Z07:00")
  "dateModified" (.Lastmod.Format "2006-01-02T15:04:05Z07:00")
  "wordCount" .WordCount
  "articleBody" .Plain
  "inLanguage" "en-US"
  "isAccessibleForFree" true
  "copyrightYear" (.Date.Format "2006")
-}}

{{- /* Add articleSection from first topic */ -}}
{{- if .Params.topics -}}
  {{- $structuredData = merge $structuredData (dict "articleSection" (index .Params.topics 0)) -}}
{{- end -}}

{{- /* Add keywords from topics and tags */ -}}
{{- $keywords := slice -}}
{{- if .Params.topics -}}
  {{- $keywords = $keywords | append .Params.topics -}}
{{- end -}}
{{- if .Params.tags -}}
  {{- $keywords = $keywords | append .Params.tags -}}
{{- end -}}
{{- if gt (len $keywords) 0 -}}
  {{- $structuredData = merge $structuredData (dict "keywords" (delimit $keywords ", ")) -}}
{{- end -}}

{{- /* Enhanced author with more fields */ -}}
{{- $author := dict
  "@type" "Person"
  "name" .Site.Params.author.name
  "email" .Site.Params.author.email
  "url" .Site.BaseURL
-}}
{{- if .Site.Params.author.bio -}}
  {{- $author = merge $author (dict "description" .Site.Params.author.bio) -}}
{{- end -}}
{{- if .Site.Params.nostr -}}
  {{- $sameAs := slice .Site.Params.nostr -}}
  {{- if .Site.Params.github -}}
    {{- $sameAs = $sameAs | append .Site.Params.github -}}
  {{- end -}}
  {{- $author = merge $author (dict "sameAs" $sameAs) -}}
{{- end -}}
{{- $structuredData = merge $structuredData (dict "author" $author) -}}

{{- /* Publisher as Organization with logo */ -}}
{{- $publisherLogo := dict
  "@type" "ImageObject"
  "url" (.Site.Params.og_image | absURL)
-}}
{{- $publisher := dict
  "@type" "Organization"
  "name" .Site.Params.author.name
  "logo" $publisherLogo
-}}
{{- $structuredData = merge $structuredData (dict "publisher" $publisher) -}}

{{- /* Rest of implementation (mainEntityOfPage, image) remains same */ -}}
{{- $mainEntity := dict "@type" "WebPage" "@id" .Permalink -}}
{{- $structuredData = merge $structuredData (dict "mainEntityOfPage" $mainEntity) -}}

{{- if or .Params.image .Site.Params.og_image -}}
  {{- $imageURL := "" -}}
  {{- if .Params.image -}}
    {{- $imageURL = .Params.image | absURL -}}
  {{- else if eq .Type "essays" -}}
    {{- $customOGPath := printf "/images/og-essays/%s.png" .File.ContentBaseName -}}
    {{- $customOGFile := printf "static%s" $customOGPath -}}
    {{- if fileExists $customOGFile -}}
      {{- $imageURL = $customOGPath | absURL -}}
    {{- else -}}
      {{- $imageURL = .Site.Params.og_image | absURL -}}
    {{- end -}}
  {{- else if eq .Type "notes" -}}
    {{- $customOGPath := printf "/images/og-notes/%s.png" .File.ContentBaseName -}}
    {{- $customOGFile := printf "static%s" $customOGPath -}}
    {{- if fileExists $customOGFile -}}
      {{- $imageURL = $customOGPath | absURL -}}
    {{- else -}}
      {{- $imageURL = .Site.Params.og_image | absURL -}}
    {{- end -}}
  {{- else -}}
    {{- $imageURL = .Site.Params.og_image | absURL -}}
  {{- end -}}
  {{- $image := dict
    "@type" "ImageObject"
    "url" $imageURL
    "contentUrl" $imageURL
    "width" 1200
    "height" 630
  -}}
  {{- $structuredData = merge $structuredData (dict "image" $image) -}}
{{- end -}}

<script type="application/ld+json">
{{ $structuredData | jsonify | safeJS }}
</script>
{{- end -}}
```

### Example 2: Add Article-Specific Open Graph Tags

**File:** `tangerine-theme/layouts/partials/head.html`

Add after existing Open Graph tags (after line 79):

```html
{{- if .IsPage -}}
{{- if or (eq .Type "essays") (eq .Type "notes") -}}
<!-- Article-specific Open Graph tags -->
<meta property="article:published_time" content="{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}">
<meta property="article:modified_time" content="{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}">
<meta property="article:author" content="{{ .Site.BaseURL }}">
{{- if .Params.topics -}}
{{- $firstTopic := index .Params.topics 0 -}}
<meta property="article:section" content="{{ $firstTopic }}">
{{- end -}}
{{- range .Params.tags -}}
<meta property="article:tag" content="{{ . }}">
{{- end -}}
{{- end -}}
{{- end -}}
```

### Example 3: Add Twitter/X Handles and Missing Meta

**File:** `tangerine-theme/layouts/partials/head.html`

Add after existing Twitter Card tags (after line 104):

```html
{{- if .Site.Params.twitter_handle -}}
<meta name="twitter:site" content="@{{ .Site.Params.twitter_handle }}">
<meta name="twitter:creator" content="@{{ .Site.Params.twitter_handle }}">
{{- end -}}
{{ if $twitterImageURL }}
<meta name="twitter:image:alt" content="{{ if .Title }}{{ .Title }}{{ else }}{{ .Site.Title }}{{ end }}">
{{ end }}
```

Add to `hugo.toml`:
```toml
[params]
  twitter_handle = "shawnyeager"  # Without @ symbol
```

### Example 4: Add WebSite Schema for Homepage

**File:** Create `tangerine-theme/layouts/partials/structured-data-website.html`

```html
{{- if .IsHome -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ .Site.Title }}",
  "url": "{{ .Site.BaseURL }}",
  "description": "{{ .Site.Params.description }}",
  "inLanguage": "en-US",
  "author": {
    "@type": "Person",
    "name": "{{ .Site.Params.author.name }}",
    "email": "{{ .Site.Params.author.email }}",
    "url": "{{ .Site.BaseURL }}"
    {{- if .Site.Params.nostr -}}
    ,"sameAs": [
      "{{ .Site.Params.nostr }}"
      {{- if .Site.Params.github -}}
      ,"{{ .Site.Params.github }}"
      {{- end -}}
    ]
    {{- end -}}
  },
  "copyrightYear": "{{ now.Format "2006" }}",
  "copyrightHolder": {
    "@type": "Person",
    "name": "{{ .Site.Params.author.name }}"
  }
}
</script>
{{- end -}}
```

Include in `head.html` after line 112:
```html
<!-- Structured Data (JSON-LD) -->
{{ partial "structured-data.html" . }}
{{ partial "structured-data-website.html" . }}
```

### Example 5: Enhanced Image Shortcode with Optimization

**File:** `tangerine-theme/layouts/shortcodes/image.html`

```html
{{- $src := .Get "src" -}}
{{- $alt := .Get "alt" -}}
{{- $variant := .Get "variant" | default "" -}}
{{- $lazy := .Get "lazy" | default "true" -}}

{{- /* Try to get image resource for processing */ -}}
{{- $image := .Page.Resources.GetMatch $src -}}
{{- if not $image -}}
  {{- /* Try site resources */ -}}
  {{- $image = resources.Get $src -}}
{{- end -}}

{{- if $image -}}
  {{- /* Hugo image processing available */ -}}
  {{- $small := $image.Resize "640x" -}}
  {{- $medium := $image.Resize "1024x" -}}
  {{- $large := $image.Resize "1920x" -}}

  <img
    src="{{ $medium.RelPermalink }}"
    srcset="{{ $small.RelPermalink }} 640w,
            {{ $medium.RelPermalink }} 1024w,
            {{ $large.RelPermalink }} 1920w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
    alt="{{ $alt }}"
    width="{{ $medium.Width }}"
    height="{{ $medium.Height }}"
    {{- if eq $lazy "true" }} loading="lazy"{{ end }}
    {{- if $variant }} class="{{ $variant }}"{{ end }}>
{{- else -}}
  {{- /* Fallback to basic img tag */ -}}
  <img
    src="{{ $src }}"
    alt="{{ $alt }}"
    {{- if eq $lazy "true" }} loading="lazy"{{ end }}
    {{- if $variant }} class="{{ $variant }}"{{ end }}>
{{- end -}}
```

### Example 6: Fix Footer Semantic HTML

**File:** `tangerine-theme/layouts/partials/footer.html`

Change:
```html
<section class="site-footer">
```

To:
```html
<footer class="site-footer">
```

And closing tag from `</section>` to `</footer>`.

### Example 7: Add Navigation ARIA Labels

**File:** `tangerine-theme/layouts/partials/navigation.html` or `header.html`

Change:
```html
<nav>
```

To:
```html
<nav role="navigation" aria-label="Main navigation">
```

### Example 8: Add CollectionPage Schema for List Pages

**File:** Create `tangerine-theme/layouts/partials/structured-data-collection.html`

```html
{{- if and (not .IsHome) (or (eq .Kind "section") (eq .Kind "taxonomy") (eq .Kind "term")) -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{{ .Title }}",
  "url": "{{ .Permalink }}",
  "description": "{{ if .Description }}{{ .Description }}{{ else }}{{ .Site.Params.description }}{{ end }}",
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "WebSite",
    "name": "{{ .Site.Title }}",
    "url": "{{ .Site.BaseURL }}"
  },
  "author": {
    "@type": "Person",
    "name": "{{ .Site.Params.author.name }}",
    "url": "{{ .Site.BaseURL }}"
  }
}
</script>
{{- end -}}
```

Include in `head.html`:
```html
{{ partial "structured-data-collection.html" . }}
```

---

## Testing & Validation

After implementing changes, test with:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
5. **Google Lighthouse**: Performance, accessibility, SEO audit
6. **PageSpeed Insights**: Core Web Vitals

---

## Summary

**Current State:**
- Basic structured data exists for individual articles only
- Solid foundation with Open Graph and Twitter Cards
- Good semantic HTML in key areas
- Strong RSS implementation

**Primary Gaps:**
- No homepage or list page structured data
- Using generic Article instead of BlogPosting
- Missing article-specific Open Graph tags
- No image optimization (critical for performance)
- Footer uses wrong semantic tag
- Missing breadcrumb markup

**Recommended Immediate Actions:**
1. Switch to BlogPosting type
2. Add article Open Graph tags
3. Implement image lazy loading and dimensions
4. Fix footer semantic tag
5. Add WebSite schema to homepage
6. Add Twitter/X handles

These changes will significantly improve SEO, social sharing, and Core Web Vitals scores.
