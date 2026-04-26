#!/bin/bash
set -e

echo "🔍 Running ALL CI/CD checks locally..."
echo ""

# Contracts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 CONTRACTS (Rust)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd contracts

echo "📝 Checking code formatting..."
cargo fmt --all -- --check

echo "🔧 Running clippy linter..."
cargo clippy -- -D warnings

echo "🧪 Running tests..."
cargo test

cd ..

# Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖥️  BACKEND (TypeScript/Node.js)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

echo "📦 Installing dependencies..."
npm install

echo "📝 Running ESLint..."
npm run lint

echo "🔍 Running TypeScript type checking..."
npm run type-check

echo "🏗️  Building project..."
npm run build

cd ..

# Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 FRONTEND (Next.js/React)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "📝 Running ESLint..."
npm run lint

echo "🏗️  Building Next.js..."
npm run build

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL CI/CD CHECKS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
