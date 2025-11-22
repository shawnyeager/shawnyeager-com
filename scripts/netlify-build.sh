#!/bin/bash
set -e

# Check for theme updates before building
echo "Checking for theme updates..."

# Save current theme version
BEFORE=$(grep 'github.com/shawnyeager/tangerine-theme' go.mod | head -n1 || echo "none")

# Update to latest theme
hugo mod get -u github.com/shawnyeager/tangerine-theme
hugo mod tidy

# Check if go.mod changed
AFTER=$(grep 'github.com/shawnyeager/tangerine-theme' go.mod | head -n1 || echo "none")

if [ "$BEFORE" != "$AFTER" ]; then
  echo "Theme updated: $BEFORE -> $AFTER"

  # Configure git with deploy key
  if [ -n "$DEPLOY_KEY" ]; then
    mkdir -p ~/.ssh
    echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
    export GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no"
  fi

  # Configure git user
  git config user.name "netlify-bot"
  git config user.email "bot@netlify.com"

  # Commit and push the update
  git add go.mod go.sum
  git commit -m "chore: auto-update tangerine-theme during build [skip ci]"
  git push origin HEAD:master || echo "Push failed - likely already updated"
else
  echo "Theme already up to date"
fi

# Install Node dependencies
npm ci

# Generate Open Graph images
npm run generate-og

# Build Hugo site
hugo --gc --minify "$@"
