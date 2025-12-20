#!/bin/bash
#
# Process essay hero images for shawnyeager.com
#
# Converts images to grayscale and replaces background with site background
# color (#FDFCFA) for seamless light mode integration. CSS invert handles
# dark mode automatically.
#
# Usage:
#   ./scripts/process-hero-image.sh <input-image> <essay-slug> [fuzz-percent]
#
# Examples:
#   ./scripts/process-hero-image.sh ~/Downloads/sketch.png why-bitcoin-sales-is-different
#   ./scripts/process-hero-image.sh ~/Downloads/sketch.png my-essay 10  # lower fuzz
#
# IMPORTANT: Output filename MUST match the essay slug exactly.
# This enables convention-based auto-detection of hero images.
#
# Requirements:
#   - ImageMagick 7+ (magick command)
#   - Input images should be pencil sketches on light/white backgrounds
#
# Notes:
#   - Default fuzz is 20% - works for most clean sketches
#   - For images with subtle interior shading, try lower fuzz (10-15%)
#   - If background has heavy texture, regenerate with cleaner background
#

set -e

SITE_BG="#FDFCFA"
OUTPUT_DIR="assets/images/essays"
DEFAULT_FUZZ="20%"

if [[ -z "$1" || -z "$2" ]]; then
    echo "Usage: $0 <input-image> <essay-slug> [fuzz-percent]"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/sketch.png why-bitcoin-sales-is-different"
    echo "  $0 ~/Downloads/sketch.png my-essay-slug 10  # lower fuzz for delicate images"
    echo ""
    echo "NOTE: Output filename must match essay slug exactly for auto-detection."
    exit 1
fi

INPUT="$1"
OUTPUT_NAME="$2"
FUZZ="${3:-20}%"
OUTPUT="$OUTPUT_DIR/$OUTPUT_NAME.png"

if [[ ! -f "$INPUT" ]]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "Processing: $INPUT"
echo "Output: $OUTPUT"
echo "Fuzz: $FUZZ"

# Get image dimensions for corner flood fill points
DIMS=$(magick identify -format "%w %h" "$INPUT")
WIDTH=$(echo $DIMS | cut -d' ' -f1)
HEIGHT=$(echo $DIMS | cut -d' ' -f2)
MAX_X=$((WIDTH - 1))
MAX_Y=$((HEIGHT - 1))

# Process image:
# 1. Convert to grayscale
# 2. Flood fill background from corners with site background color
magick "$INPUT" \
    -colorspace Gray \
    -fuzz "$FUZZ" -fill "$SITE_BG" \
    -draw "color 0,0 floodfill" \
    -draw "color 0,$MAX_Y floodfill" \
    -draw "color $MAX_X,0 floodfill" \
    -draw "color $MAX_X,$MAX_Y floodfill" \
    "$OUTPUT"

echo "Done: $OUTPUT"
echo ""
echo "Add to essay frontmatter:"
echo "  hero_image: images/essays/$OUTPUT_NAME.png"
echo "  hero_alt: Description of the image"
