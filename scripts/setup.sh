#!/bin/bash

# One-time setup script for new clones
# Run this after cloning the repo

set -e

echo "🔧 Setting up shawnyeager-com repository..."
echo ""

# Configure git hooks (symlinked to shared-workflows)
echo "📋 Configuring git hooks..."

# Create .githooks directory if it doesn't exist
mkdir -p .githooks

# Create/verify symlink to shared hooks (auto-updates when shared hooks change)
EXPECTED_TARGET="../../shared-workflows/git-hooks/pre-commit"
if [ -L ".githooks/pre-commit" ]; then
  CURRENT_TARGET=$(readlink .githooks/pre-commit)
  if [ "$CURRENT_TARGET" != "$EXPECTED_TARGET" ]; then
    echo "   ⚠️  Updating symlink (was pointing to: $CURRENT_TARGET)"
    ln -sf "$EXPECTED_TARGET" .githooks/pre-commit
  fi
else
  echo "   📝 Creating symlink to shared-workflows/git-hooks/pre-commit"
  ln -sf "$EXPECTED_TARGET" .githooks/pre-commit
fi

# Point Git to use .githooks directory
git config core.hooksPath .githooks
echo "   ✅ Git hooks configured (symlinked to shared-workflows)"
echo ""

# Verify mise is available
if ! command -v mise &> /dev/null; then
    echo "⚠️  mise not found. Install from: https://mise.jdx.dev"
    echo "   Tools will need to be installed manually."
    exit 1
fi

# mise will auto-install tools, but let's verify
echo "📦 Verifying mise tools..."
mise install
echo "   ✅ All mise tools installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Pre-commit hooks are now active and will:"
echo "  • Auto-fix markdown formatting (markdownlint-cli2)"
echo "  • Convert smart punctuation to plain ASCII (body content only)"
echo "  • Show what was fixed before committing"
echo ""
echo "Note: Hooks are symlinked to shared-workflows. Updates to shared hooks"
echo "      apply automatically - no need to re-run this script!"
