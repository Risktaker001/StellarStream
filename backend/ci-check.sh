#!/bin/bash
set -e

echo "🔍 Running Backend CI checks locally..."

cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "📝 Running ESLint..."
npm run lint

echo "🔍 Running TypeScript type checking..."
npm run type-check

echo "🏗️  Building project..."
npm run build

echo "✅ All backend CI checks passed!"
