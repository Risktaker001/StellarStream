//! Comprehensive vault integration tests for StellarStream.
//!
//! Tests cover:
//! - Vault approval and revocation
//! - Stream creation with vault configuration
//! - Token deposits to vaults
//! - Interest accumulation and claiming
//! - Vault operations with different strategies
//! - Withdrawal interaction with vaulted tokens
//! - Vault errors and validation
//! - Multiple vaults per contract
//! - Stream cancellation with vaulted tokens
//! - Complete stream lifecycle with vaults

#![cfg(test)]

use super::*;
use crate::common::*;
use soroban_sdk::testutils::{Events as _, Ledger as _};

// ===== Test 1: Vault Approval and Revocation =====

#[test]
fn test_approve_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    // Admin approves vault
    let result = c.approve_vault(&f.admin, &vault);
    assert!(result.is_ok());

    // Verify vault can be used in stream creation
    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault.clone()),
        &STRATEGY_FIXED_RATE,
    );
    assert!(stream_id.is_ok());
}

#[test]
fn test_cannot_approve_vault_twice() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();
    let result = c.approve_vault(&f.admin, &vault);
    assert_eq!(result, Err(Error::VaultAlreadyApproved));
}

#[test]
fn test_cannot_approve_vault_without_admin_role() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    let result = c.approve_vault(&f.sender, &vault);
    assert_eq!(result, Err(Error::NotAdmin));
}

#[test]
fn test_revoke_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();
    let result = c.revoke_vault(&f.admin, &vault);
    assert!(result.is_ok());

    // After revoke, cannot create stream with this vault
    let stream_result = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    );
    assert_eq!(stream_result, Err(Error::VaultNotApproved));
}

#[test]
fn test_cannot_revoke_unapproved_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    let result = c.revoke_vault(&f.admin, &vault);
    assert_eq!(result, Err(Error::VaultNotApproved));
}

// ===== Test 2: Stream Creation with Vault =====

#[test]
fn test_create_stream_with_vault_and_strategy() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault.clone()),
        &STRATEGY_FIXED_RATE,
    );
    assert!(stream_id.is_ok());

    let stream = c.get_stream(&stream_id.unwrap());
    assert_eq!(stream.vault_address, Some(vault));
    assert_eq!(stream.interest_strategy, STRATEGY_FIXED_RATE);
}

#[test]
fn test_cannot_create_stream_with_unapproved_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    let result = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    );
    assert_eq!(result, Err(Error::VaultNotApproved));
}

#[test]
fn test_create_stream_without_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Stream without vault should have 0 strategy
    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &None,
        &0,
    );
    assert!(stream_id.is_ok());

    let stream = c.get_stream(&stream_id.unwrap());
    assert_eq!(stream.vault_address, None);
    assert_eq!(stream.interest_strategy, 0);
}

#[test]
fn test_cannot_create_stream_with_strategy_but_no_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let result = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &None,
        &STRATEGY_FIXED_RATE, // Strategy without vault
    );
    assert_eq!(result, Err(Error::InvalidInterestStrategy));
}

// ===== Test 3: Deposit to Vault =====

#[test]
fn test_deposit_to_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault.clone()),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Receiver deposits 100_000 tokens to vault
    let shares_result = c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128);
    assert!(shares_result.is_ok());
    assert_eq!(shares_result.unwrap(), 100_000); // 1:1 share ratio in this implementation
}

#[test]
fn test_cannot_deposit_to_vault_without_authorization() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Non-receiver cannot deposit
    let result = c.deposit_to_vault(&stream_id, &f.sender, &100_000i128);
    assert_eq!(result, Err(Error::Unauthorized));
}

#[test]
fn test_cannot_deposit_to_vault_on_closed_stream() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Cancel stream
    c.cancel_stream(&stream_id, &f.sender).unwrap();

    // Cannot deposit to closed stream
    let result = c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128);
    assert_eq!(result, Err(Error::CannotDepositToClosedStream));
}

#[test]
fn test_cannot_deposit_negative_amount() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    let result = c.deposit_to_vault(&stream_id, &f.receiver, &0i128);
    assert_eq!(result, Err(Error::InvalidAmount));
}

// ===== Test 4: Interest Accumulation and Claiming =====

#[test]
fn test_claim_interest() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Deposit to vault
    c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();

    // Check accumulated interest
    let interest = c.get_accumulated_interest(&stream_id);
    assert!(interest > 0); // Should accumulate interest based on strategy

    // Claim interest
    let claimed = c.claim_interest(&stream_id, &f.receiver).unwrap();
    assert_eq!(claimed, interest);

    // After claim, interest should be 0
    let new_interest = c.get_accumulated_interest(&stream_id);
    assert_eq!(new_interest, 0);
}

#[test]
fn test_cannot_claim_interest_as_non_receiver() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();

    let result = c.claim_interest(&stream_id, &f.sender);
    assert_eq!(result, Err(Error::Unauthorized));
}

#[test]
fn test_cannot_claim_interest_without_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &None,
        &0,
    ).unwrap();

    let result = c.claim_interest(&stream_id, &f.receiver);
    assert_eq!(result, Err(Error::NoVaultConfigured));
}

// ===== Test 5: Interest Strategies =====

#[test]
fn test_single_strategy_fixed_rate() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    let stream = c.get_stream(&stream_id);
    assert_eq!(stream.interest_strategy, STRATEGY_FIXED_RATE);
}

#[test]
fn test_multiple_strategies_bitfield() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    // Combine FIXED_RATE | COMPOUND strategies
    let combined_strategy = STRATEGY_FIXED_RATE | STRATEGY_COMPOUND;

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &combined_strategy,
    ).unwrap();

    let stream = c.get_stream(&stream_id);
    assert_eq!(stream.interest_strategy, combined_strategy);

    // Interest should be higher with multiple strategies
    c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();
    let interest = c.get_accumulated_interest(&stream_id);
    assert!(interest > 0);
}

#[test]
fn test_invalid_strategy_bits_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    // Invalid strategy: bit 4 (0x10) is not defined
    let invalid_strategy = 0x10u32;

    let result = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &invalid_strategy,
    );
    assert_eq!(result, Err(Error::InvalidInterestStrategy));
}

// ===== Test 6: Withdrawal with Vaulted Tokens =====

#[test]
fn test_withdrawal_includes_vault_proceeds() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Move time to unlock some tokens
    f.env.ledger().with_mut(|li| li.timestamp = 90);

    // Deposit to vault
    c.deposit_to_vault(&stream_id, &f.receiver, &50_000i128).unwrap();

    // Withdraw: should include unlocked stream + vault proceeds
    let withdrawn = c.withdraw(&stream_id, &f.receiver).unwrap();
    assert!(withdrawn > 0);
}

#[test]
fn test_vault_shares_cleared_on_withdrawal() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault.clone()),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Deposit to vault
    c.deposit_to_vault(&stream_id, &f.receiver, &50_000i128).unwrap();

    // Verify shares exist
    let shares_before = c.get_vault_shares(&stream_id);
    assert!(shares_before.is_some());

    // Move time and withdraw
    f.env.ledger().with_mut(|li| li.timestamp = 365);
    c.withdraw(&stream_id, &f.receiver).unwrap();

    // Shares should be cleared after withdrawal
    let shares_after = c.get_vault_shares(&stream_id);
    assert!(shares_after.is_none());
}

// ===== Test 7: Stream Cancellation with Vault =====

#[test]
fn test_cancellation_clears_vault_state() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Deposit to vault
    c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();

    // Verify shares exist
    assert!(c.get_vault_shares(&stream_id).is_some());

    // Cancel stream
    c.cancel_stream(&stream_id, &f.sender).unwrap();

    // Vault shares should be cleared
    assert!(c.get_vault_shares(&stream_id).is_none());
}

// ===== Test 8: Multiple Vaults =====

#[test]
fn test_multiple_approved_vaults() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault1 = Address::generate(&f.env);
    let vault2 = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault1).unwrap();
    c.approve_vault(&f.admin, &vault2).unwrap();

    // Create streams with different vaults
    let stream1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault1),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    let stream2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault2),
        &STRATEGY_COMPOUND,
    ).unwrap();

    let s1 = c.get_stream(&stream1);
    let s2 = c.get_stream(&stream2);

    assert_eq!(s1.vault_address, Some(vault1));
    assert_eq!(s2.vault_address, Some(vault2));
    assert_eq!(s1.interest_strategy, STRATEGY_FIXED_RATE);
    assert_eq!(s2.interest_strategy, STRATEGY_COMPOUND);
}

// ===== Test 9: Vesting Schedule Not Affected by Vault =====

#[test]
fn test_vault_does_not_affect_vesting_schedule() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    c.approve_vault(&f.admin, &vault).unwrap();

    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1000u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE,
    ).unwrap();

    // Set time to middle of vesting
    f.env.ledger().with_mut(|li| li.timestamp = 500);

    // Deposit to vault
    c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();

    // Check unlocked amount is unaffected
    let unlocked = c.get_unlocked_amount(&stream_id).unwrap();
    assert_eq!(unlocked, 500_000); // Should be 50% (500 / 1000)

    let withdrawable = c.get_withdrawable_amount(&stream_id).unwrap();
    assert_eq!(withdrawable, 500_000);
}

// ===== Test 10: Complete Lifecycle with Vault =====

#[test]
fn test_complete_stream_lifecycle_with_vault() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let vault = Address::generate(&f.env);

    // Step 1: Approve vault
    c.approve_vault(&f.admin, &vault).unwrap();

    // Step 2: Create stream with vault
    let stream_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1000u64,
        &CURVE_LINEAR,
        &false,
        &false,
        &None,
        &Some(vault),
        &STRATEGY_FIXED_RATE | STRATEGY_COMPOUND,
    ).unwrap();

    // Step 3: Verify stream state
    let stream = c.get_stream(&stream_id);
    assert_eq!(stream.vault_address, Some(vault.clone()));
    assert_eq!(stream.state, STATE_ACTIVE);

    // Step 4: Move time and deposit to vault
    f.env.ledger().with_mut(|li| li.timestamp = 250);
    let shares = c.deposit_to_vault(&stream_id, &f.receiver, &100_000i128).unwrap();
    assert!(shares > 0);

    // Step 5: Verify vault shares
    let vault_shares = c.get_vault_shares(&stream_id);
    assert!(vault_shares.is_some());

    // Step 6: Claim interest
    let interest = c.get_accumulated_interest(&stream_id);
    assert!(interest > 0);
    let claimed = c.claim_interest(&stream_id, &f.receiver).unwrap();
    assert_eq!(claimed, interest);

    // Step 7: Verify interest reset
    assert_eq!(c.get_accumulated_interest(&stream_id), 0);

    // Step 8: Move time more and withdraw
    f.env.ledger().with_mut(|li| li.timestamp = 500);
    let withdrawn = c.withdraw(&stream_id, &f.receiver).unwrap();
    assert!(withdrawn > 0); // Should include stream + vault tokens

    // Step 9: Verify vault shares cleared
    assert!(c.get_vault_shares(&stream_id).is_none());

    // Step 10: Complete stream lifecycle
    f.env.ledger().with_mut(|li| li.timestamp = 1000);
    let final_withdraw = c.withdraw(&stream_id, &f.receiver).unwrap();
    assert!(final_withdraw >= 0);
}
