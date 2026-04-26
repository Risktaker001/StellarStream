# Exponential Streaming Curve Implementation

## Summary
Successfully implemented exponential streaming curve support for StellarStream, allowing users to create streams where payouts accelerate over time (back-loaded streams).

## Changes Made

### 1. Type System (`types.rs`)
- Added `CurveType` enum with two variants:
  - `Linear = 0`: Traditional linear streaming (1 token/second)
  - `Exponential = 1`: Quadratic growth curve (accelerating payouts)
- Added `curve_type: CurveType` field to `Stream` struct

### 2. Math Module (`math.rs`)
- Implemented `calculate_exponential_unlocked()` function:
  - Uses quadratic formula: `unlocked = total * (elapsed^2 / duration^2)`
  - Includes overflow protection with checked arithmetic
  - Returns `Result<i128, ()>` to handle overflow cases gracefully
  - Falls back to linear calculation if overflow occurs
- Added comprehensive tests:
  - `test_exponential_curve`: Validates quadratic growth at different time points
  - `test_exponential_overflow_protection`: Ensures safe handling of large values

### 3. Contract Logic (`lib.rs`)
- Updated `create_stream()` to accept `curve_type: CurveType` parameter
- Updated `create_stream_with_milestones()` to accept `curve_type: CurveType` parameter
- Modified `calculate_unlocked()` to support both curve types:
  - Uses pattern matching on `stream.curve_type`
  - Linear: `(total * elapsed) / duration`
  - Exponential: Calls `math::calculate_exponential_unlocked()` with fallback
- Updated all test cases to specify `CurveType::Linear` for backward compatibility
- Added `test_exponential_stream()` to demonstrate exponential curve behavior

## Mathematical Behavior

### Linear Curve (Original)
```
Unlocked = Total × (Elapsed / Duration)
```
- At 50% time: 50% unlocked
- At 70% time: 70% unlocked

### Exponential Curve (New)
```
Unlocked = Total × (Elapsed² / Duration²)
```
- At 50% time: 25% unlocked (0.5² = 0.25)
- At 70% time: 49% unlocked (0.7² = 0.49)
- At 90% time: 81% unlocked (0.9² = 0.81)

This creates a "back-loaded" payment schedule where most funds unlock near the end.

## Safety Features

1. **Overflow Protection**: All exponential calculations use `checked_mul()` to prevent arithmetic overflow
2. **Graceful Fallback**: If overflow occurs, the system falls back to linear calculation
3. **Backward Compatibility**: Existing streams continue to work with `CurveType::Linear`
4. **Milestone Support**: Exponential curves work seamlessly with milestone caps

## Test Results
All 23 tests pass:
- ✅ 3 math module tests (including exponential curve tests)
- ✅ 20 contract tests (including new exponential stream test)
- ✅ Release build successful

## Usage Example

```rust
// Create an exponential stream
let stream_id = client.create_stream(
    &sender,
    &receiver,
    &token,
    &1000,        // total amount
    &0,           // start time
    &100,         // end time
    &CurveType::Exponential,  // NEW: curve type
);
```

## Acceptance Criteria Met
✅ Users can select "Exponential" at creation via `curve_type` parameter  
✅ Withdrawal amount grows faster as stream approaches `end_time`  
✅ Overflow safety implemented with checked math  
✅ Well-tested with comprehensive test coverage  
✅ All existing tests pass (backward compatible)
