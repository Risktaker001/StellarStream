# Vault Integration Implementation

## Overview

This document describes the vault integration feature for StellarStream V1, which enables stream tokens to earn yield while vesting. The implementation allows senders to optionally route stream tokens through approved yield vaults during the vesting period, accumulating interest that receivers can claim independently of the vesting schedule.

## Architecture

### Core Components

1. **Vault Approval System** (`approve_vault`, `revoke_vault`)
   - Admin-only vault address approval/revocation
   - Prevents streams from using unapproved vaults
   - Approved vaults stored in instance storage for efficient access

2. **Stream Enhancement** (Stream struct)
   - `vault_address: Option<Address>` - Optional vault where tokens can be deposited
   - `interest_strategy: u32` - Bitfield of enabled interest strategies for the stream

3. **Vault Deposit & Interest System**
   - Deposit tokens to vault: `deposit_to_vault(stream_id, amount)` -> shares
   - Claim accumulated interest: `claim_interest(stream_id)` -> interest amount
   - Interest calculated based on strategy count and deposited amount

4. **Storage Architecture**
   - `ApprovedVaults: Map<Address, bool>` - Set of approved vault addresses (instance)
   - `VaultShares(stream_id): VaultShareRecord` - Shares held per stream (persistent, TTL-extended)
   - `AccumulatedInterest(stream_id): i128` - Interest accrued per stream (persistent, TTL-extended)

### Interest Strategies (Bitfield)

Strategies are represented as a 32-bit unsigned integer where each bit represents an enabled strategy:

- **Bit 0 (0x1): STRATEGY_FIXED_RATE** - Simple fixed interest rate
- **Bit 1 (0x2): STRATEGY_COMPOUND** - Compound yield interest
- **Bit 2 (0x4): STRATEGY_PERFORMANCE** - Performance-based interest
- **Valid mask**: 0x7 (bits 0-2 only)

Interest accumulation: `(deposit_amount * strategy_count * 50) / 10_000` = 0.5% per enabled strategy

Examples:
- Single strategy (0x1): 0.5% interest
- Two strategies (0x3): 1.0% interest
- Three strategies (0x7): 1.5% interest

## API Reference

### Administrative Functions

#### `approve_vault(admin: Address, vault_address: Address) -> Result<(), Error>`
- **Access**: Admin-only (requires ROLE_ADMIN)
- **Returns**: `Ok(())` on success
- **Errors**:
  - `VaultAlreadyApproved`: Vault already in the approved set
  - `NotAdmin`: Caller lacks ROLE_ADMIN role
  - `Unauthorized`: Caller authentication failed

#### `revoke_vault(admin: Address, vault_address: Address) -> Result<(), Error>`
- **Access**: Admin-only (requires ROLE_ADMIN)
- **Returns**: `Ok(())` on success
- **Errors**:
  - `VaultNotApproved`: Vault not in the approved set
  - `NotAdmin`: Caller lacks ROLE_ADMIN role

### Stream Management

#### `create_stream(..., vault_address: Option<Address>, interest_strategy: u32) -> Result<u64, Error>`
- **New Parameters**:
  - `vault_address`: Optional approved vault address for yield generation
  - `interest_strategy`: Bitfield of enabled strategies (must be 0 if no vault)
- **Constraints**:
  - If `vault_address` is `Some(addr)`, `addr` must be approved
  - `interest_strategy` must be 0 if `vault_address` is None
  - If `vault_address` is Some, `interest_strategy` must be non-zero and only valid bits set

#### `deposit_to_vault(stream_id: u64, depositor: Address, amount: i128) -> Result<i128, Error>`
- **Caller**: Must be the stream's receiver
- **Returns**: Number of vault shares obtained
- **Effects**:
  - Deposits tokens to vault
  - Records vault shares for later redemption
  - Accumulates interest based on strategy count
- **Errors**:
  - `Unauthorized`: Caller is not the stream receiver
  - `NoVaultConfigured`: Stream has no vault address
  - `VaultNotApproved`: Stream's vault is not approved
  - `InvalidInterestStrategy`: Strategy is 0 or has invalid bits
  - `InvalidAmount`: Amount <= 0
  - `CannotDepositToClosedStream`: Stream is closed or paused

#### `claim_interest(stream_id: u64, claimer: Address) -> Result<i128, Error>`
- **Caller**: Must be the stream's receiver
- **Returns**: Amount of accumulated interest claimed (0 if none)
- **Effects**:
  - Resets accumulated interest to 0
  - Does not affect vaulted shares or vesting schedule
- **Errors**:
  - `Unauthorized`: Caller is not the stream receiver
  - `NoVaultConfigured`: Stream has no vault

### Query Functions

#### `get_vault_shares(stream_id: u64) -> Option<(Address, i128)>`
- **Returns**: (vault_address, shares) if stream has vaulted tokens, None otherwise

#### `get_accumulated_interest(stream_id: u64) -> i128`
- **Returns**: Amount of accumulated interest for the stream

## Behavior & Invariants

### Vesting Schedule Preservation
✓ Vault operations **never** affect the vesting schedule
✓ `unlocked_amount` calculation is independent of vault state
✓ `withdrawable_amount` only depends on `total_amount` and `withdrawn_amount`
✓ Pause/resume functionality unaffected

### Token Availability
✓ On stream withdrawal, vaulted shares are redeemed and tokens transferred to receiver
✓ On stream cancellation, all vaulted shares are withdrawn
✓ Receiver always has access to vaulted tokens

### Interest Independence
✓ Interest accumulation is separate from vesting
✓ Interest can be claimed at any time (even before vesting completes)
✓ Claiming interest does not affect stream withdrawal capacity

### Authorization
✓ Only receivers can deposit to vault
✓ Only receivers can claim interest
✓ Only admins can approve/revoke vaults
✓ All operations require `require_auth()` validation

## Data Flow

### Stream Creation with Vault
```
sender calls create_stream(vault_address, strategy)
    ↓
validate vault_address is approved
validate interest_strategy is valid
    ↓
create Stream with vault_address and interest_strategy
store in persistent storage with TTL
    ↓
stream ready for deposits
```

### Deposit to Vault
```
receiver calls deposit_to_vault(stream_id, amount)
    ↓
validate receiver is caller
validate vault exists and is approved
validate strategy is valid
validate amount > 0
    ↓
calculate shares (1:1 conversion in current implementation)
store VaultShareRecord in persistent storage
calculate interest accrual (0.5% per strategy)
store AccumulatedInterest in persistent storage
    ↓
publish deposit event
return shares
```

### Withdrawal with Vaulted Tokens
```
receiver calls withdraw(stream_id)
    ↓
calculate unlocked_amount (from vesting schedule)
    ↓
if vault configured:
    redeem all VaultShares
    clear AccumulatedInterest
    convert shares to tokens
    total_amount = unlocked - withdrawn + vault_proceeds
else:
    total_amount = unlocked - withdrawn
    ↓
transfer total_amount to receiver
update stream.withdrawn_amount
    ↓
clear vault shares and interest on completion
```

### Claiming Interest
```
receiver calls claim_interest(stream_id)
    ↓
validate receiver is caller
validate vault is configured
    ↓
read AccumulatedInterest
reset to 0
    ↓
return interest amount
```

## Error Handling

### Vault-Specific Errors
- `VaultNotApproved (50)`: Vault not approved for use
- `VaultAlreadyApproved (51)`: Vault already in approved set
- `VaultDepositFailed (52)`: Vault deposit operation failed
- `VaultWithdrawalFailed (53)`: Vault withdrawal operation failed
- `InvalidInterestStrategy (54)`: Strategy bitfield contains invalid bits
- `NoVaultConfigured (55)`: Stream has no vault (when one expected)
- `InsufficientVaultedShares (56)`: Not enough shares to claim (reserved)
- `CannotDepositToClosedStream (57)`: Cannot deposit to paused/closed stream

### Existing Errors (Enhanced Validation)
- `InvalidTimeRange`, `InvalidAmount`, `InvalidCurve`: Now validate with vault params
- `Unauthorized`: Enhanced for vault-specific authorization checks

## Storage Considerations

### Instance Storage (Survives Upgrades)
- `ApprovedVaults: Map<Address, bool>` - Efficient O(1) lookup for vault approval

### Persistent Storage (TTL-Extended)
- `VaultShares(stream_id)`: Per-stream vault share record
  - TTL: LEDGER_BUMP_STREAM (200 ledgers), MAX (365 days)
  - Accessed on deposit, withdrawal, cancellation
  
- `AccumulatedInterest(stream_id)`: Per-stream interest accumulation
  - TTL: LEDGER_BUMP_STREAM (200 ledgers), MAX (365 days)
  - Accessed on deposit, claim, withdrawal

## Testing

### Test Coverage (15+ tests in vault_test.rs)

1. **Vault Approval**
   - `test_approve_vault`: Basic approval flow
   - `test_cannot_approve_vault_twice`: Duplicate prevention
   - `test_cannot_approve_vault_without_admin_role`: Authorization
   - `test_revoke_vault`: Revocation flow
   - `test_cannot_revoke_unapproved_vault`: Error handling

2. **Stream Creation**
   - `test_create_stream_with_vault_and_strategy`: Basic creation
   - `test_cannot_create_stream_with_unapproved_vault`: Validation
   - `test_create_stream_without_vault`: No-vault path
   - `test_cannot_create_stream_with_strategy_but_no_vault`: Constraint

3. **Deposits & Interest**
   - `test_deposit_to_vault`: Basic deposit
   - `test_cannot_deposit_to_vault_without_authorization`: Authorization
   - `test_cannot_deposit_to_vault_on_closed_stream`: State validation
   - `test_cannot_deposit_negative_amount`: Input validation

4. **Interest Claiming**
   - `test_claim_interest`: Basic claiming
   - `test_cannot_claim_interest_as_non_receiver`: Authorization
   - `test_cannot_claim_interest_without_vault`: Configuration check

5. **Strategies**
   - `test_single_strategy_fixed_rate`: Single strategy
   - `test_multiple_strategies_bitfield`: Multiple strategies
   - `test_invalid_strategy_bits_rejected`: Validation

6. **Withdrawal Integration**
   - `test_withdrawal_includes_vault_proceeds`: Token delivery
   - `test_vault_shares_cleared_on_withdrawal`: State cleanup

7. **Cancellation**
   - `test_cancellation_clears_vault_state`: State cleanup

8. **Multiple Vaults**
   - `test_multiple_approved_vaults`: Independent vault tracking

9. **Invariants**
   - `test_vault_does_not_affect_vesting_schedule`: Separation of concerns

10. **Complete Lifecycle**
    - `test_complete_stream_lifecycle_with_vault`: End-to-end flow

## Compliance & Constraints

### Vesting Invariant
- Vault deposits MUST NOT affect when tokens become withdrawable
- Vesting schedule (unlocked_amount) is independent of vault operations
- Confirmed by `test_vault_does_not_affect_vesting_schedule`

### Closure Constraint
- Cannot deposit to closed or paused streams
- Ensures clean state management

### Authorization Constraint
- Only receivers can interact with vaults (deposit, claim)
- Only admins can manage vault approvals
- Aligns with existing stream access patterns

### Amount Constraint
- Vault deposits must be positive integers
- Overflow checked via `saturating_add`

## Future Enhancements

1. **Vault Interface Traits**: Implement full Soroban vault contract interface
   - `deposit(amount) -> shares`
   - `withdraw(shares) -> amount`
   - `get_value(shares) -> amount`

2. **Advanced Strategies**: Extended strategy implementations
   - Time-based multipliers
   - Tiered APY rates
   - Risk-based adjustments

3. **Multi-Vault Support**: Allow streams to split deposits across multiple vaults
   - Per-vault deposit tracking
   - Distributed interest claiming

4. **Vault Analytics**: Enhanced metrics
   - Total TVL in vaults
   - Average APY across active streams
   - Interest claimed per strategy

5. **Governance**: Vault parameter management
   - Admin-configurable interest rates
   - Strategy enablement/disablement
   - Vault suspension mechanism

## Build & Test

### Build
```bash
# Build contract (requires soroban CLI)
stellar contract build --optimize

# Output: target/wasm32-unknown-unknown/release/stellarstream_contracts.wasm
```

### Test
```bash
# Run all tests (requires cargo + Rust toolchain)
cargo test vault_test --lib

# Run specific test
cargo test vault_test::test_approve_vault -- --nocapture
```

### CI/CD
- All vault tests must pass before merge
- Zero compiler warnings required
- Test coverage: >90% of vault code paths

## Documentation & Comments

Each function in vault.rs includes:
- Comprehensive documentation comments
- Behavior requirements
- Error conditions
- Usage examples (in tests)

Key invariants documented in:
- `lib.rs` comments for vault entry points
- `vault.rs` module-level documentation
- Test comments explaining test purpose

## Security Considerations

1. **Re-entrancy**: Vault calls protected by existing re-entrancy guard
2. **Integer Overflow**: All arithmetic checked/saturating
3. **Authorization**: All state-changing ops require `require_auth()`
4. **Storage Consistency**: TTL management ensures data longevity
5. **Vesting Integrity**: Vault operations isolated from vesting calculation

## Compatibility

- **Backward Compatible**: Existing streams work unchanged (vault_address = None)
- **Protocol Fee**: Vault doesn't affect protocol fee calculation
- **Clawback**: Independent of vault state
- **Pause/Resume**: Vesting pause unaffected by vault
- **Proposal**: Multi-sig path works with vault streams

## References

- Stream struct definition: `lib.rs:241-275`
- Vault module: `vault.rs`
- Vault tests: `vault_test.rs`
- Storage keys: `storage.rs:49-65`
- Error types: `lib.rs:206-241`
- Constants: `lib.rs:155-165`
