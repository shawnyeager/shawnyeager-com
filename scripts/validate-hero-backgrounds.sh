#!/usr/bin/env bash
# Validates hero image backgrounds match page background (#FDFCFA = 253,252,250)
# Usage: ./scripts/validate-hero-backgrounds.sh [--fix]

set -euo pipefail

TARGET_R=253
TARGET_G=252
TARGET_B=250
TARGET_HEX="#FDFCFA"
IMAGE_DIR="assets/images/essays"
FIX_MODE=false
ERRORS=0

[[ "${1:-}" == "--fix" ]] && FIX_MODE=true

echo "Validating hero image backgrounds (expected: $TARGET_HEX)"
echo "=============================================="

for img in "$IMAGE_DIR"/*.png; do
  [[ -f "$img" ]] || continue
  filename=$(basename "$img")

  # Get top-left corner pixel color
  pixel=$(magick "$img" -crop 1x1+0+0 -format '%[pixel:p{0,0}]' info:)

  # Extract RGB values (handles srgb(R,G,B) format)
  if [[ "$pixel" =~ srgb\(([0-9]+),([0-9]+),([0-9]+)\) ]]; then
    r="${BASH_REMATCH[1]}"
    g="${BASH_REMATCH[2]}"
    b="${BASH_REMATCH[3]}"
  else
    echo "WARNING: $filename: Could not parse color: $pixel"
    ((ERRORS++))
    continue
  fi

  if [[ "$r" -eq "$TARGET_R" && "$g" -eq "$TARGET_G" && "$b" -eq "$TARGET_B" ]]; then
    echo "OK $filename: ($r,$g,$b)"
  else
    echo "WRONG $filename: ($r,$g,$b) - expected ($TARGET_R,$TARGET_G,$TARGET_B)"
    ((ERRORS++))

    if $FIX_MODE; then
      echo "  Fixing..."
      magick "$img" -fill "srgb($TARGET_R,$TARGET_G,$TARGET_B)" -opaque "srgb($r,$g,$b)" "$img"
      echo "  Fixed!"
    fi
  fi
done

echo "=============================================="
if [[ $ERRORS -eq 0 ]]; then
  echo "All images OK!"
  exit 0
else
  echo "$ERRORS image(s) with wrong background color"
  [[ $FIX_MODE == false ]] && echo "Run with --fix to auto-correct"
  exit 1
fi
