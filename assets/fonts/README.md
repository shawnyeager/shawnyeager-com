# Font Files for OG Image Generation

These OTF font files are used exclusively by `scripts/generate-og-images.js` for generating Open Graph social sharing images.

## Files

- `Satoshi-Bold.otf` (50KB) - Used for essay titles in OG images (matches site header font)

## Why OTF Format?

These files exist because:

1. **Satori requirement**: The Satori library (used for OG image generation) requires OTF or TTF font format
2. **WOFF2 not supported**: Satori cannot use WOFF2 web fonts
3. **Separate from web fonts**: These are distinct from the theme's web font (`tangerine-theme/static/fonts/Satoshi-Variable.woff2`)

## Web Fonts vs OG Image Fonts

| Purpose     | Location                                               | Format | Size |
|-------------|--------------------------------------------------------|--------|------|
| Web display | `tangerine-theme/static/fonts/Satoshi-Variable.woff2` | WOFF2  | 37KB |
| OG images   | `shawnyeager-com/assets/fonts/Satoshi-Bold.otf`       | OTF    | 50KB |

The web font is optimized for browser delivery, while the OTF file is required for image generation.

## Build Process

The `generate-og-images.js` script:
1. Reads essay frontmatter (title)
2. Loads the Satoshi-Bold OTF font
3. Uses Satori to render SVG with Satoshi typography
4. Converts to PNG with Sharp
5. Outputs to `static/images/og-essays/{slug}.png` (1200x630px)

This runs automatically in Netlify before the Hugo build via `netlify.toml`.
