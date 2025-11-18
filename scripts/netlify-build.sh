#!/bin/bash
set -e

# Install Node dependencies
npm ci

# Generate Open Graph images
npm run generate-og

# Build Hugo site
hugo --gc --minify "$@"
