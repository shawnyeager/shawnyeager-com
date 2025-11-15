# Font Files for OG Image Generation

These OTF font files are used exclusively by `scripts/generate-og-images.js` for generating Open Graph social sharing images.

## Files

- `Inter-Bold.otf` (271KB) - Used for essay titles in OG images
- `Inter-SemiBold.otf` (624KB) - Used for supporting text in OG images

## Why OTF Format?

These files exist because:

1. **Satori requirement**: The Satori library (used for OG image generation) requires OTF or TTF font format
2. **WOFF2 not supported**: Satori cannot use WOFF2 web fonts
3. **Separate from web fonts**: These are distinct from the theme's web font (`tangerine-theme/static/fonts/inter-variable.woff2`)

## Web Fonts vs OG Image Fonts

| Purpose     | Location                                             | Format | Size           |
|-------------|------------------------------------------------------|--------|----------------|
| Web display | `tangerine-theme/static/fonts/inter-variable.woff2` | WOFF2  | 72KB           |
| OG images   | `shawnyeager-com/assets/fonts/*.otf`                 | OTF    | 271KB + 624KB  |

The web font is optimized for browser delivery, while these OTF files are optimized for image generation.

## Build Process

The `generate-og-images.js` script:
1. Reads essay frontmatter (title, description)
2. Loads these OTF fonts
3. Uses Satori to render SVG with Inter typography
4. Converts to PNG with Sharp
5. Outputs to `static/images/og-essays/{slug}.png` (1200x630px)

This runs automatically in Netlify before the Hugo build via `netlify.toml`.
