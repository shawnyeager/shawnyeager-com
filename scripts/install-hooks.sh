#!/bin/bash
# Install git hooks for this repository

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/hooks"
GIT_HOOKS_DIR="$SCRIPT_DIR/../.git/hooks"

echo "Installing git hooks..."

# Create symlink for pre-commit hook
ln -sf ../../scripts/hooks/pre-commit "$GIT_HOOKS_DIR/pre-commit"

echo "✓ Pre-commit hook installed"
echo ""
echo "This hook will block manual commits of go.mod theme updates."
echo "Theme updates must come via GitHub Actions workflow."
