#!/bin/bash

# SEO Validator for Hugo essays
# Checks that all essays have required frontmatter fields

# Note: Not using set -e to allow script to continue on errors

ERRORS=0
WARNINGS=0

echo "🔍 Validating SEO frontmatter for essays..."
echo ""

# Find all markdown files in content/essays/ (excluding _index.md)
while IFS= read -r -d '' file; do
  # Skip _index.md files (Hugo list pages)
  if [[ "$file" == *"_index.md" ]]; then
    continue
  fi

  echo "Checking: $file"

  # Extract frontmatter (between --- markers)
  FRONTMATTER=$(awk '/^---$/{i++}i==1' "$file" | sed '1d;$d')

  # Check for required fields

  # Title (required)
  if ! echo "$FRONTMATTER" | grep -q "^title:"; then
    echo "  ❌ Missing: title"
    ((ERRORS++))
  fi

  # Description (required for SEO/social sharing)
  if ! echo "$FRONTMATTER" | grep -q "^description:"; then
    echo "  ❌ Missing: description (required for SEO and social sharing)"
    ((ERRORS++))
  else
    DESC=$(echo "$FRONTMATTER" | grep "^description:" | cut -d'"' -f2)
    DESC_LEN=${#DESC}
    if [ $DESC_LEN -lt 50 ]; then
      echo "  ⚠️  Warning: description is short ($DESC_LEN chars, recommend 50-160)"
      ((WARNINGS++))
    elif [ $DESC_LEN -gt 160 ]; then
      echo "  ⚠️  Warning: description is long ($DESC_LEN chars, recommend 50-160)"
      ((WARNINGS++))
    fi
  fi

  # Date (required)
  if ! echo "$FRONTMATTER" | grep -q "^date:"; then
    echo "  ❌ Missing: date"
    ((ERRORS++))
  fi

  # Topics or tags (at least one recommended)
  HAS_TOPICS=$(echo "$FRONTMATTER" | grep -c "^topics:" || true)
  HAS_TAGS=$(echo "$FRONTMATTER" | grep -c "^tags:" || true)

  if [ $HAS_TOPICS -eq 0 ] && [ $HAS_TAGS -eq 0 ]; then
    echo "  ⚠️  Warning: no topics or tags (recommended for taxonomy)"
    ((WARNINGS++))
  fi

  # Check if draft
  if echo "$FRONTMATTER" | grep -q "^draft: true"; then
    echo "  ℹ️  Draft (skipping publish checks)"
  fi

  echo ""

done < <(find content/essays -name "*.md" -type f -print0)

# Summary
echo "================================"
echo "Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo "================================"

if [ $ERRORS -gt 0 ]; then
  echo "❌ Validation failed with $ERRORS errors"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  Validation passed with $WARNINGS warnings"
  exit 0
else
  echo "✅ All essays pass SEO validation"
  exit 0
fi
