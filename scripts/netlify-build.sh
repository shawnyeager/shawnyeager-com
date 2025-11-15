#!/bin/bash
set -e

# Configure Git to use GITHUB_TOKEN for private module access
git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

# Install Node dependencies
npm ci

# Generate Open Graph images
npm run generate-og

# Build Hugo site
hugo --gc --minify "$@"
