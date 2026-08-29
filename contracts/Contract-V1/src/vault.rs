//! Vault integration module for StellarStream.
//!
//! This module provides yield vault functionality, allowing stream tokens to
//! earn interest while vesting. Vaults are optional, and streams can be created
//! with or without vault configuration.
//!
//! # Architecture
//!
//! - Vault addresses must be approved by an admin before use
//! - Each stream can have an optional vault and interest strategy
//! - Vault shares track the stream's position in the vault
//! - Interest accumulates separately and is claimed by the receiver
//! - Vault operations never affect the vesting schedule or withdrawals
//!
//! # Yield Strategy
//!
//! Interest strategies are represented as a bitfield:
//! - Bit 0 (0x1): STRATEGY_FIXED_RATE - simple fixed interest rate
//! - Bit 1 (0x2): STRATEGY_COMPOUND - compound yield interest
//! - Bit 2 (0x4): STRATEGY_PERFORMANCE - performance-based interest
//!
//! Multiple strategies can be enabled simultaneously via bitwise OR.

use soroban_sdk::{symbol_short, token, Address, contracttype, Env, Map, String};

use crate::{
    storage::{extend_instance_ttl, extend_interest_ttl, extend_vault_shares_ttl, DataKey},
    Error, Stream, STRATEGY_VALID_MASK,
};

// ---------------------------------------------------------------------------
// Vault Share tracking
// ---------------------------------------------------------------------------

/// Tracks vault shares for a stream.
///
/// When tokens are deposited to a vault, the vault returns shares representing
/// the stream's position. This record tracks those shares so they can be
/// redeemed on stream withdrawal or cancellation.
#[contracttype]
#[derive(Clone, Debug)]
pub struct VaultShareRecord {
    /// The vault address where shares are held.
    pub vault_address: Address,
    /// Number of shares held in the vault.
    pub shares: i128,
}

// ---------------------------------------------------------------------------
// Public functions (called from lib.rs #[contractimpl])
// ---------------------------------------------------------------------------

/// Approves a vault address for use in stream deposits.
///
/// Only an admin can approve vaults. Once approved, streams can be created
/// with this vault address and token deposits can be vaulted.
pub fn approve_vault(env: &Env, vault_address: &Address) -> Result<(), Error> {
    let mut vaults = get_approved_vaults(env);

    if vaults.get(vault_address.clone()).is_some() {
        return Err(Error::VaultAlreadyApproved);
    }

    vaults.set(vault_address.clone(), true);
    env.storage()
        .instance()
        .set(&DataKey::ApprovedVaults, &vaults);

    env.events().publish(
        (symbol_short!("vault"), symbol_short!("approved")),
        (vault_address.clone(), env.ledger().timestamp()),
    );

    Ok(())
}

/// Revokes approval for a vault address.
///
/// Only an admin can revoke approvals. Once revoked, new streams cannot use
/// this vault, but existing streams can still claim their interest.
pub fn revoke_vault(env: &Env, vault_address: &Address) -> Result<(), Error> {
    let mut vaults = get_approved_vaults(env);

    if vaults.get(vault_address.clone()).is_none() {
        return Err(Error::VaultNotApproved);
    }

    vaults.remove(vault_address.clone());
    env.storage()
        .instance()
        .set(&DataKey::ApprovedVaults, &vaults);

    env.events().publish(
        (symbol_short!("vault"), symbol_short!("revoked")),
        (vault_address.clone(), env.ledger().timestamp()),
    );

    Ok(())
}

/// Check if a vault is approved.
pub fn is_vault_approved(env: &Env, vault_address: &Address) -> bool {
    let vaults = get_approved_vaults(env);
    vaults.get(vault_address.clone()).is_some()
}

/// Deposits stream tokens to the configured vault.
///
/// # Requirements
///
/// - The stream must have a vault configured
/// - The vault must be approved
/// - The sender must be the stream's receiver
/// - The stream must not be closed or paused
/// - The interest_strategy must be valid (non-zero and only valid bits set)
/// - The vault must implement standard vault interface (deposit function)
///
/// # Returns
///
/// The number of shares obtained from the vault deposit.
///
/// # Effects
///
/// - Deposits the specified amount to the vault
/// - Records the vault shares for later redemption
/// - Accumulates interest based on the strategy
/// - Does not affect the stream's vesting schedule or withdrawals
pub fn deposit_to_vault(
    env: &Env,
    stream_id: u64,
    stream: &mut Stream,
    depositor: &Address,
    amount: i128,
) -> Result<i128, Error> {
    // Validate stream state
    if stream.state == crate::STATE_CLOSED {
        return Err(Error::CannotDepositToClosedStream);
    }
    if stream.state == crate::STATE_PAUSED {
        return Err(Error::CannotDepositToClosedStream);
    }

    // Validate vault configuration
    let vault_addr = stream
        .vault_address
        .as_ref()
        .ok_or(Error::NoVaultConfigured)?
        .clone();

    if !is_vault_approved(env, &vault_addr) {
        return Err(Error::VaultNotApproved);
    }

    // Validate interest strategy
    if stream.interest_strategy == 0 {
        return Err(Error::InvalidInterestStrategy);
    }
    if (stream.interest_strategy & !STRATEGY_VALID_MASK) != 0 {
        return Err(Error::InvalidInterestStrategy);
    }

    // Validate amount
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }

    // Simulate vault deposit by calculating share conversion (1:1 for simplicity)
    // In production, this would call the vault contract's deposit function
    let shares = amount;

    // Store vault shares
    let mut share_record = VaultShareRecord {
        vault_address: vault_addr.clone(),
        shares,
    };

    env.storage()
        .persistent()
        .set(&DataKey::VaultShares(stream_id), &share_record);
    extend_vault_shares_ttl(env, stream_id);

    // Initialize accumulated interest if not present
    let mut interest = get_accumulated_interest(env, stream_id);
    // Interest accumulates based on strategy; start with 0.5% per strategy for demo
    let strategy_count = stream.interest_strategy.count_ones() as i128;
    let interest_accrual = (amount * strategy_count * 50) / 10_000; // 0.5% per strategy
    interest = interest.saturating_add(interest_accrual);

    env.storage()
        .persistent()
        .set(&DataKey::AccumulatedInterest(stream_id), &interest);
    extend_interest_ttl(env, stream_id);

    env.events().publish(
        (symbol_short!("vault"), symbol_short!("deposit")),
        (stream_id, amount, shares, env.ledger().timestamp()),
    );

    Ok(shares)
}

/// Claims accumulated interest for a stream.
///
/// # Requirements
///
/// - The stream must have a vault configured
/// - The claimer must be the stream's receiver
/// - There must be accumulated interest to claim
///
/// # Returns
///
/// The amount of accumulated interest claimed.
///
/// # Effects
///
/// - Resets accumulated interest to 0
/// - Does not affect vaulted shares or the stream's state
pub fn claim_interest(
    env: &Env,
    stream_id: u64,
    stream: &Stream,
    claimer: &Address,
) -> Result<i128, Error> {
    // Verify receiver is claiming
    if stream.receiver != *claimer {
        return Err(Error::Unauthorized);
    }

    // Verify vault is configured
    if stream.vault_address.is_none() {
        return Err(Error::NoVaultConfigured);
    }

    // Get accumulated interest
    let interest = get_accumulated_interest(env, stream_id);

    if interest <= 0 {
        return Ok(0);
    }

    // Reset interest
    env.storage()
        .persistent()
        .remove(&DataKey::AccumulatedInterest(stream_id));

    env.events().publish(
        (symbol_short!("vault"), symbol_short!("claim")),
        (stream_id, claimer.clone(), interest, env.ledger().timestamp()),
    );

    Ok(interest)
}

/// Withdraws vaulted shares back to tokens when a stream is withdrawn or cancelled.
///
/// This is called internally during normal withdrawal or stream cancellation
/// to redeem vaulted shares. The caller receives the token amount equivalent
/// to the shares held.
///
/// # Returns
///
/// The amount of tokens redeemed from the vault.
pub fn withdraw_from_vault(
    env: &Env,
    stream_id: u64,
    stream: &Stream,
) -> Result<i128, Error> {
    // Check if any shares are vaulted
    if !env.storage()
        .persistent()
        .has(&DataKey::VaultShares(stream_id))
    {
        return Ok(0);
    }

    let share_record = env
        .storage()
        .persistent()
        .get::<_, VaultShareRecord>(&DataKey::VaultShares(stream_id))
        .ok_or(Error::NoVaultConfigured)?;

    if share_record.shares <= 0 {
        return Ok(0);
    }

    // Simulate vault withdrawal: shares -> tokens (1:1 for simplicity)
    let redeemed_amount = share_record.shares;

    // Clear the vault shares record
    env.storage()
        .persistent()
        .remove(&DataKey::VaultShares(stream_id));

    // Clear accumulated interest
    env.storage()
        .persistent()
        .remove(&DataKey::AccumulatedInterest(stream_id));

    env.events().publish(
        (symbol_short!("vault"), symbol_short!("withdraw")),
        (stream_id, redeemed_amount, env.ledger().timestamp()),
    );

    Ok(redeemed_amount)
}

/// Validates that an interest strategy bitfield is valid.
///
/// A valid strategy must:
/// - Be non-zero (at least one strategy enabled)
/// - Only use bits defined in STRATEGY_VALID_MASK
pub fn validate_interest_strategy(strategy: u32) -> Result<(), Error> {
    if strategy == 0 {
        return Err(Error::InvalidInterestStrategy);
    }
    if (strategy & !STRATEGY_VALID_MASK) != 0 {
        return Err(Error::InvalidInterestStrategy);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/// Get the set of approved vaults.
fn get_approved_vaults(env: &Env) -> Map<Address, bool> {
    env.storage()
        .instance()
        .get(&DataKey::ApprovedVaults)
        .unwrap_or(Map::new(env))
}

/// Get accumulated interest for a stream.
fn get_accumulated_interest(env: &Env, stream_id: u64) -> i128 {
    let interest = env
        .storage()
        .persistent()
        .get::<_, i128>(&DataKey::AccumulatedInterest(stream_id));
    if interest.is_some() {
        extend_interest_ttl(env, stream_id);
    }
    interest.unwrap_or(0)
}
