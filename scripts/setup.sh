#!/bin/bash

# One-time setup script for new clones
# Run this after cloning the repo

set -e

echo "🔧 Setting up shawnyeager-com repository..."
echo ""

# Configure git hooks
echo "📋 Configuring git hooks..."
git config core.hooksPath .githooks
echo "   ✅ Git hooks path set to .githooks"
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
echo "  • Convert smart punctuation to plain ASCII"
echo "  • Show what was fixed before committing"
