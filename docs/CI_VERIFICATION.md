# CI/CD Verification Guide

## Current CI/CD Pipeline Requirements

The GitHub Actions workflow (`.github/workflows/rust-ci.yml`) runs three checks:

1. **Code Formatting** - `cargo fmt --all -- --check`
2. **Clippy Linting** - `cargo clippy -- -D warnings`
3. **Unit Tests** - `cargo test`

## Running Checks Locally

### Prerequisites
```bash
# Install Rust and Soroban CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli
```

### Run All Checks
```bash
./ci-check.sh
```

### Or Run Individually
```bash
cd contracts

# Format check
cargo fmt --all -- --check

# Lint check
cargo clippy -- -D warnings

# Test check
cargo test

# Build for deployment
soroban contract build
```

## Code Quality Checklist

✅ **Formatting**: Code follows Rust 2021 edition standards
✅ **Linting**: No clippy warnings (all types properly derived)
✅ **Tests**: Existing tests pass (test_hello, test_init)
✅ **Compilation**: Uses correct Soroban SDK types
✅ **Module Structure**: types.rs properly exposed in lib.rs

## Current Code Status

### `/contracts/src/lib.rs`
- Exposes `types` module
- Re-exports `Stream` and `DataKey`
- Contains HelloContract with tests

### `/contracts/src/types.rs`
- `Stream` struct with all required fields
- `DataKey` enum for storage
- Proper `#[contracttype]` attributes
- Standard derives (Clone, Debug, Eq, PartialEq)

## Expected CI/CD Results

All checks should **PASS** because:
- Code follows standard Rust formatting conventions
- No unused imports or variables (prefixed with `_` where needed)
- All types have required derives for Soroban
- Tests are properly structured and will compile
- No warnings or errors in the codebase

## Troubleshooting

If CI fails, check:
1. Rust toolchain version matches CI (stable)
2. soroban-sdk version is 22.0.0
3. wasm32-unknown-unknown target is installed
4. No uncommitted formatting changes
