#!/bin/bash
set -e

echo "🔍 Running CI/CD checks locally..."

cd contracts

echo "📝 Checking code formatting..."
cargo fmt --all -- --check

echo "🔧 Running clippy linter..."
cargo clippy -- -D warnings

echo "🧪 Running tests..."
cargo test --lib

echo "✅ All CI/CD checks passed!"
