#!/bin/bash
set -e

echo "🔧 Running Rust CI checks locally..."

cd contracts

echo "📝 Checking code formatting..."
cargo fmt --all -- --check

echo "🔍 Running clippy..."
cargo clippy -- -D warnings

echo "🧪 Running tests..."
cargo test

echo "✅ All checks passed!"
