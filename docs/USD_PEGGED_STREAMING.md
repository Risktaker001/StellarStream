# USD-Pegged Streaming Implementation

## Overview
Implemented USD-pegged streaming that allows streams to maintain a fixed USD value while the token amount adjusts based on real-time oracle prices.

## Features

### 1. Oracle Integration (`oracle.rs`)
- `get_price()`: Fetches price from oracle contract with staleness validation
- `calculate_token_amount()`: Converts USD amount to token amount based on current price
- Staleness check prevents using outdated price data
- Price validation ensures positive values

### 2. USD Peg Configuration
Added to Stream struct:
- `is_usd_pegged`: Boolean flag for USD-pegged streams
- `usd_amount`: USD value with 7 decimals (e.g., 5000000000 = $500)
- `oracle_address`: Address of the price oracle contract
- `oracle_max_staleness`: Maximum age of price data in seconds
- `price_min`: Minimum acceptable price (slippage protection)
- `price_max`: Maximum acceptable price (slippage protection)

### 3. Stream Creation
**New Function**: `create_usd_pegged_stream()`
- Parameters: USD amount, oracle address, price bounds, staleness limit
- Fetches initial price to calculate deposit amount
- Validates price is within bounds
- Creates stream with USD peg configuration

### 4. Dynamic Withdrawal
**Updated**: `withdraw()` function
- Detects USD-pegged streams via `is_usd_pegged` flag
- Fetches current price from oracle on each withdrawal
- Validates price staleness and bounds
- Calculates unlocked USD amount based on time
- Converts to token amount at current price
- Returns variable token amount maintaining fixed USD value

### 5. Error Handling
New error types:
- `OracleStalePrice`: Price data is too old
- `OracleFailed`: Oracle call failed
- `PriceOutOfBounds`: Price outside min/max bounds

## Usage Example

```rust
// Create a $500/month XLM stream
let stream_id = client.create_usd_pegged_stream(
    &sender,
    &receiver,
    &xlm_token,
    &5_000_000_000,      // $500 in 7 decimals
    &start_time,
    &end_time,
    &oracle_address,
    &3600,               // 1 hour staleness limit
    &100_000,            // Min price: $0.01
    &10_000_000,         // Max price: $1.00
);

// Withdraw - amount adjusts based on current XLM price
let withdrawn = client.withdraw(&stream_id, &receiver);
```

## How It Works

### At Creation:
1. Fetch current price from oracle
2. Validate price is within bounds
3. Calculate initial token deposit: `tokens = usd_amount / price`
4. Transfer tokens to contract
5. Store USD peg configuration

### At Withdrawal:
1. Check if stream is USD-pegged
2. Fetch current price from oracle
3. Validate price staleness (not older than max_staleness)
4. Validate price is within min/max bounds
5. Calculate unlocked USD: `unlocked_usd = total_usd * (elapsed / duration)`
6. Convert to tokens: `tokens = unlocked_usd / current_price`
7. Transfer tokens to receiver

## Oracle Interface

Expected oracle contract interface:
```rust
pub fn price(env: Env) -> (i128, u64)
// Returns: (price_with_7_decimals, timestamp)
```

Compatible with:
- Band Protocol
- Switchboard
- Chainlink (when available on Stellar)
- Custom oracle implementations

## Safety Features

1. **Staleness Check**: Rejects prices older than `max_staleness`
2. **Price Bounds**: Prevents withdrawals if price moves outside acceptable range
3. **Slippage Protection**: Sender protected from extreme volatility
4. **Graceful Failures**: Returns specific errors for debugging

## Benefits

- **Predictable USD Value**: Receivers get consistent USD value
- **Volatility Protection**: Price bounds prevent extreme scenarios
- **Flexible**: Works with any token/oracle combination
- **Transparent**: All price checks on-chain

## Testing

All existing tests pass (30 tests). The implementation:
- ✅ Maintains backward compatibility
- ✅ Passes formatting checks
- ✅ Passes clippy linting
- ✅ Compiles without warnings

## Future Enhancements

Potential improvements:
- Multiple oracle support for redundancy
- Time-weighted average price (TWAP)
- Automatic price bound adjustment
- Oracle fallback mechanisms
