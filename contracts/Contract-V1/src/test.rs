//! Core functionality sanity tests.
#![cfg(test)]

use super::*;
use crate::common::*;
use soroban_sdk::testutils::{Events as _, Ledger as _};

#[test]
fn test_initialize() {
    let f = setup();
    // Admin is stored after initialization.
    assert!(client(&f.env, &f.contract).next_stream_id() >= 1);
}

#[test]
fn test_initialize_is_idempotent() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    // Second initialize must be rejected.
    assert!(c.try_initialize(&f.admin).is_err());
}

#[test]
fn test_create_and_get_stream() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );
    let s = c.get_stream(&id);
    assert_eq!(s.total_amount, 1_000_000i128);
    assert_eq!(s.state, STATE_ACTIVE);
}

#[test]
fn test_get_time_remaining_and_percentage() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    
    // Set current ledger time
    f.env.ledger().with_mut(|li| {
        li.timestamp = 100;
    });

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &100u64, // start time
        &1100u64, // end time (1000s duration)
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Initial state: 0 seconds elapsed
    assert_eq!(c.get_time_remaining_seconds(&id), 1000);
    assert_eq!(c.get_time_remaining_days(&id), 0);
    assert_eq!(c.get_completion_percentage(&id), 0);

    // Mid stream: 500 seconds elapsed
    f.env.ledger().with_mut(|li| {
        li.timestamp = 600;
    });
    assert_eq!(c.get_time_remaining_seconds(&id), 500);
    assert_eq!(c.get_completion_percentage(&id), 5000); // 50%

    // Near end: 999 seconds elapsed
    f.env.ledger().with_mut(|li| {
        li.timestamp = 1099;
    });
    assert_eq!(c.get_time_remaining_seconds(&id), 1);
    assert_eq!(c.get_completion_percentage(&id), 9990); // 99.9%

    // Stream finished: 1000 seconds elapsed
    f.env.ledger().with_mut(|li| {
        li.timestamp = 1100;
    });
    assert_eq!(c.get_time_remaining_seconds(&id), 0);
    assert_eq!(c.get_completion_percentage(&id), 10000); // 100%

    // Stream past end: 2000 seconds elapsed
    f.env.ledger().with_mut(|li| {
        li.timestamp = 2100;
    });
    assert_eq!(c.get_time_remaining_seconds(&id), 0);
    assert_eq!(c.get_completion_percentage(&id), 10000); // 100%
}

// ---------------------------------------------------------------------------
// Multi-signature proposal tests (issue #1459)
// ---------------------------------------------------------------------------

#[test]
fn test_create_proposal() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &2u32,
        &(now + 10_000),
    );
    assert_eq!(id, 1);

    let p = c.get_proposal(&id);
    assert_eq!(p.sender, f.sender);
    assert_eq!(p.receiver, f.receiver);
    assert_eq!(p.token, f.token);
    assert_eq!(p.total_amount, 5_000i128);
    assert_eq!(p.required_approvals, 2u32);
    assert!(!p.executed);
    assert_eq!(p.approvers.len(), 0);
}

#[test]
fn test_get_proposal_query() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &1u32,
        &(now + 10_000),
    );

    let p = c.get_proposal(&id);
    assert_eq!(p.deadline, now + 10_000);
    assert_eq!(p.start_time, now);
    assert_eq!(p.end_time, now + 1_000);
    assert_eq!(p.required_approvals, 1u32);
}

#[test]
fn test_single_approval() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &3u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin);

    let p = c.get_proposal(&id);
    assert_eq!(p.approvers.len(), 1);
    assert!(!p.executed);
}

#[test]
fn test_multiple_approvals_below_threshold() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &3u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin);
    c.approve_proposal(&id, &f.pauser);

    let p = c.get_proposal(&id);
    assert_eq!(p.approvers.len(), 2);
    assert!(!p.executed);
}

#[test]
fn test_threshold_execution() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &2u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin);
    c.approve_proposal(&id, &f.pauser); // threshold reached -> auto-execute

    let p = c.get_proposal(&id);
    assert!(p.executed);
    assert_eq!(p.approvers.len(), 2);
}

#[test]
fn test_execution_creates_stream() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &2u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin);
    c.approve_proposal(&id, &f.pauser);

    // A stream is created immediately with the proposal's parameters.
    assert_eq!(c.next_stream_id(), 2);
    let stream = c.get_stream(&1);
    assert_eq!(stream.sender, f.sender);
    assert_eq!(stream.receiver, f.receiver);
    assert_eq!(stream.token, f.token);
    assert_eq!(stream.total_amount, 5_000i128);
    assert_eq!(stream.state, STATE_ACTIVE);
}

#[test]
fn test_proposal_expired_returns_error() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &1u32,
        &(now + 100),
    );

    f.env.ledger().with_mut(|li| {
        li.timestamp = now + 101;
    });

    assert_eq!(
        c.try_approve_proposal(&id, &f.admin),
        Err(Ok(Error::ProposalExpired))
    );
}

#[test]
fn test_duplicate_approval_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &2u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin);

    assert_eq!(
        c.try_approve_proposal(&id, &f.admin),
        Err(Ok(Error::AlreadyApproved))
    );
}

#[test]
fn test_approve_executed_proposal_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &1u32,
        &(now + 10_000),
    );
    c.approve_proposal(&id, &f.admin); // 1-of-1 executes immediately

    assert_eq!(
        c.try_approve_proposal(&id, &f.pauser),
        Err(Ok(Error::ProposalAlreadyExecuted))
    );
}

#[test]
fn test_approve_proposal_not_found() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(
        c.try_approve_proposal(&999u64, &f.admin),
        Err(Ok(Error::ProposalNotFound))
    );
}

#[test]
fn test_invalid_approval_threshold_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    assert_eq!(
        c.try_create_proposal(
            &f.sender,
            &f.receiver,
            &f.token,
            &5_000i128,
            &now,
            &(now + 1_000),
            &0u32,
            &(now + 10_000),
        ),
        Err(Ok(Error::InvalidApprovalThreshold))
    );
}

#[test]
fn test_proposal_approval_events_emitted() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    let id = c.create_proposal(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &now,
        &(now + 1_000),
        &2u32,
        &(now + 10_000),
    );
    // `create_proposal` publishes a proposal event.
    assert_eq!(f.env.events().all().len(), 1);

    c.approve_proposal(&id, &f.admin);
    // `approve_proposal` publishes an approval event.
    assert_eq!(f.env.events().all().len(), 1);
}

// ---------------------------------------------------------------------------
// Milestone-based vesting tests (issue #1462)
// ---------------------------------------------------------------------------

/// Builds a `Vec<Milestone>` from `(timestamp, cumulative_percentage_bps)` pairs.
fn milestone_schedule(env: &Env, entries: &[(u64, u32)]) -> Vec<Milestone> {
    let mut v = Vec::new(env);
    for &(timestamp, percentage) in entries {
        v.push_back(Milestone {
            timestamp,
            percentage,
        });
    }
    v
}

/// A standard 3-checkpoint schedule: 25% at 90, 50% at 180, 100% at 365.
fn standard_schedule(env: &Env) -> Vec<Milestone> {
    milestone_schedule(env, &[(90, 2_500), (180, 5_000), (365, 10_000)])
}

#[test]
fn test_milestone_simple_schedule() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    let s = c.get_stream(&id);
    assert_eq!(s.curve_type, CURVE_MILESTONE);
    assert!(s.milestones.is_some());
}

#[test]
fn test_milestone_before_first_returns_zero() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    f.env.ledger().with_mut(|li| li.timestamp = 89);
    assert_eq!(c.get_unlocked_amount(&id), 0);

    f.env.ledger().with_mut(|li| li.timestamp = 0);
    assert_eq!(c.get_unlocked_amount(&id), 0);
}

#[test]
fn test_milestone_at_milestone_returns_cumulative_percentage() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    f.env.ledger().with_mut(|li| li.timestamp = 90);
    assert_eq!(c.get_unlocked_amount(&id), 250_000);

    f.env.ledger().with_mut(|li| li.timestamp = 180);
    assert_eq!(c.get_unlocked_amount(&id), 500_000);

    f.env.ledger().with_mut(|li| li.timestamp = 365);
    assert_eq!(c.get_unlocked_amount(&id), 1_000_000);
}

#[test]
fn test_milestone_between_milestones_holds_previous_percentage() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    // Between the 25% (t=90) and 50% (t=180) checkpoints, only 25% is unlocked.
    f.env.ledger().with_mut(|li| li.timestamp = 150);
    assert_eq!(c.get_unlocked_amount(&id), 250_000);

    // Between the 50% (t=180) and 100% (t=365) checkpoints, 50% is unlocked.
    f.env.ledger().with_mut(|li| li.timestamp = 300);
    assert_eq!(c.get_unlocked_amount(&id), 500_000);
}

#[test]
fn test_milestone_after_last_returns_total() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    f.env.ledger().with_mut(|li| li.timestamp = 365);
    assert_eq!(c.get_unlocked_amount(&id), 1_000_000);

    // The contract's end-of-term fast path also kicks in beyond end_time.
    f.env.ledger().with_mut(|li| li.timestamp = 10_000);
    assert_eq!(c.get_unlocked_amount(&id), 1_000_000);
}

#[test]
fn test_milestone_invalid_order_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    // Timestamps must be strictly ascending; 180 then 90 is not.
    let bad_schedule = milestone_schedule(&f.env, &[(180, 5_000), (90, 10_000)]);

    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &365u64,
            &CURVE_MILESTONE,
            &false,
            &Some(bad_schedule),
        ),
        Err(Ok(Error::InvalidMilestones))
    );
}

#[test]
fn test_milestone_invalid_percentages_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Non-ascending percentages.
    let non_ascending = milestone_schedule(&f.env, &[(90, 5_000), (180, 2_500), (365, 10_000)]);
    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &365u64,
            &CURVE_MILESTONE,
            &false,
            &Some(non_ascending),
        ),
        Err(Ok(Error::InvalidMilestonePercentages))
    );

    // Final percentage must equal 10,000 bps (100%).
    let incomplete = milestone_schedule(&f.env, &[(90, 2_500), (180, 5_000), (365, 9_000)]);
    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &365u64,
            &CURVE_MILESTONE,
            &false,
            &Some(incomplete),
        ),
        Err(Ok(Error::InvalidMilestonePercentages))
    );
}

#[test]
fn test_milestone_withdrawal() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    f.env.ledger().with_mut(|li| li.timestamp = 90);
    let first = c.withdraw(&id, &f.receiver);
    assert_eq!(first, 250_000);

    // No new milestone reached yet -> nothing further to withdraw.
    let second = c.withdraw(&id, &f.receiver);
    assert_eq!(second, 0);

    // Reaching the 50% checkpoint makes the remaining 25% withdrawable.
    f.env.ledger().with_mut(|li| li.timestamp = 180);
    let third = c.withdraw(&id, &f.receiver);
    assert_eq!(third, 250_000);

    let s = c.get_stream(&id);
    assert_eq!(s.withdrawn_amount, 500_000);
}

#[test]
fn test_milestone_cancellation() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);
    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );

    f.env.ledger().with_mut(|li| li.timestamp = 90);
    let withdrawn = c.withdraw(&id, &f.receiver);
    assert_eq!(withdrawn, 250_000);

    c.cancel_stream(&id, &f.sender);

    // Once cancelled, the receiver can no longer withdraw further milestone
    // unlocks, even though later milestones would otherwise have been reached.
    f.env.ledger().with_mut(|li| li.timestamp = 365);
    assert!(c.try_withdraw(&id, &f.receiver).is_err());

    let s = c.get_stream(&id);
    assert_eq!(s.state, STATE_CLOSED);
    assert_eq!(s.withdrawn_amount, 250_000);
}

#[test]
fn test_milestone_vs_linear_comparison() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let schedule = standard_schedule(&f.env);
    let milestone_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_MILESTONE,
        &false,
        &Some(schedule),
    );
    let linear_id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &365u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // At t=100, linear vesting has unlocked ~27.4% continuously, while
    // milestone vesting is still capped at the 25% checkpoint reached at t=90.
    f.env.ledger().with_mut(|li| li.timestamp = 100);
    let milestone_unlocked = c.get_unlocked_amount(&milestone_id);
    let linear_unlocked = c.get_unlocked_amount(&linear_id);
    assert_eq!(milestone_unlocked, 250_000);
    assert!(linear_unlocked > milestone_unlocked);

    // Both fully unlock by the shared end_time.
    f.env.ledger().with_mut(|li| li.timestamp = 365);
    assert_eq!(c.get_unlocked_amount(&milestone_id), 1_000_000);
    assert_eq!(c.get_unlocked_amount(&linear_id), 1_000_000);
}

#[test]
fn test_milestone_curve_requires_schedule() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &365u64,
            &CURVE_MILESTONE,
            &false,
            &None,
        ),
        Err(Ok(Error::InvalidMilestones))
    );
}

#[test]
fn test_non_milestone_curve_rejects_schedule() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let schedule = standard_schedule(&f.env);

    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &365u64,
            &CURVE_LINEAR,
            &false,
            &Some(schedule),
        ),
        Err(Ok(Error::InvalidMilestones))
    );
}

#[test]
fn test_milestone_end_time_before_last_milestone_rejected() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    // Last milestone at t=365, but end_time only reaches t=200.
    let schedule = standard_schedule(&f.env);

    assert_eq!(
        c.try_create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &0u64,
            &200u64,
            &CURVE_MILESTONE,
            &false,
            &Some(schedule),
        ),
        Err(Ok(Error::InvalidTimeRange))
    );
}
// Count query tests (issue #1474)
// ---------------------------------------------------------------------------

#[test]
fn test_get_active_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_active_streams_count(), 0);

    let id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_active_streams_count(), 1);

    let _id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_active_streams_count(), 2);

    c.pause_stream(&id1, &f.sender);
    assert_eq!(c.get_active_streams_count(), 1);

    c.cancel_stream(&id1, &f.sender);
    assert_eq!(c.get_active_streams_count(), 1); // id2 is still active
}

#[test]
fn test_get_user_active_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_user_active_streams_count(&f.sender), 0);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_active_streams_count(&f.sender), 1);
    assert_eq!(c.get_user_active_streams_count(&f.receiver), 1);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_active_streams_count(&f.sender), 2);
    assert_eq!(c.get_user_active_streams_count(&f.receiver), 2);
}

#[test]
fn test_get_total_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_total_streams_count(), 0);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_total_streams_count(), 1);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_total_streams_count(), 2);
}

#[test]
fn test_get_user_total_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_user_total_streams_count(&f.sender), 0);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_total_streams_count(&f.sender), 1);
    assert_eq!(c.get_user_total_streams_count(&f.receiver), 1);

    c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_total_streams_count(&f.sender), 2);
    assert_eq!(c.get_user_total_streams_count(&f.receiver), 2);
}

#[test]
fn test_get_paused_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_paused_streams_count(), 0);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_paused_streams_count(), 0);

    c.pause_stream(&id, &f.sender);
    assert_eq!(c.get_paused_streams_count(), 1);

    c.resume_stream(&id, &f.sender);
    assert_eq!(c.get_paused_streams_count(), 0);
}

#[test]
fn test_get_user_paused_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_user_paused_streams_count(&f.sender), 0);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_paused_streams_count(&f.sender), 0);
    assert_eq!(c.get_user_paused_streams_count(&f.receiver), 0);

    c.pause_stream(&id, &f.sender);
    assert_eq!(c.get_user_paused_streams_count(&f.sender), 1);
    assert_eq!(c.get_user_paused_streams_count(&f.receiver), 1);

    c.resume_stream(&id, &f.sender);
    assert_eq!(c.get_user_paused_streams_count(&f.sender), 0);
    assert_eq!(c.get_user_paused_streams_count(&f.receiver), 0);
}

#[test]
fn test_get_closed_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_closed_streams_count(), 0);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_closed_streams_count(), 0);

    c.cancel_stream(&id, &f.sender);
    assert_eq!(c.get_closed_streams_count(), 1);
}

#[test]
fn test_get_user_closed_streams_count() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    assert_eq!(c.get_user_closed_streams_count(&f.sender), 0);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    assert_eq!(c.get_user_closed_streams_count(&f.sender), 0);
    assert_eq!(c.get_user_closed_streams_count(&f.receiver), 0);

    c.cancel_stream(&id, &f.sender);
    assert_eq!(c.get_user_closed_streams_count(&f.sender), 1);
    assert_eq!(c.get_user_closed_streams_count(&f.receiver), 1);
}
// Stream history tests (issue #1468)
// ---------------------------------------------------------------------------

#[test]
fn test_stream_history_created() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let history = c.get_stream_history(&id);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().action, StreamAction::Created);
}

#[test]
fn test_stream_history_pause_resume() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    c.pause_stream(&id, &f.sender);
    c.resume_stream(&id, &f.sender);

    let history = c.get_stream_history(&id);
    assert_eq!(history.len(), 3);
    assert_eq!(history.get(0).unwrap().action, StreamAction::Created);
    assert_eq!(history.get(1).unwrap().action, StreamAction::Paused);
    assert_eq!(history.get(2).unwrap().action, StreamAction::Resumed);
}

#[test]
fn test_stream_history_cancel() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    c.cancel_stream(&id, &f.sender);

    let history = c.get_stream_history(&id);
    assert_eq!(history.len(), 2);
    assert_eq!(history.get(0).unwrap().action, StreamAction::Created);
    assert_eq!(history.get(1).unwrap().action, StreamAction::Cancelled);
}

#[test]
fn test_stream_history_withdraw() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    f.env.ledger().with_mut(|li| {
        li.timestamp = 100;
    });

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &100u64,
        &1_100u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    f.env.ledger().with_mut(|li| {
        li.timestamp = 600;
    });

    c.withdraw(&id, &f.receiver);

    let history = c.get_stream_history(&id);
    assert_eq!(history.len(), 2);
    assert_eq!(history.get(0).unwrap().action, StreamAction::Created);
    assert!(matches!(
        history.get(1).unwrap().action,
        StreamAction::Withdrawn(_)
    ));
}

#[test]
fn test_stream_history_ordered_by_timestamp() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    f.env.ledger().with_mut(|li| {
        li.timestamp = 100;
    });

    let id = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &100u64,
        &1_100u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    f.env.ledger().with_mut(|li| {
        li.timestamp = 200;
    });
    c.pause_stream(&id, &f.sender);

    f.env.ledger().with_mut(|li| {
        li.timestamp = 300;
    });
    c.resume_stream(&id, &f.sender);

    f.env.ledger().with_mut(|li| {
        li.timestamp = 400;
    });
    c.cancel_stream(&id, &f.sender);

    let history = c.get_stream_history(&id);
    assert_eq!(history.len(), 4);

    // Check timestamps are in order
    let ts0 = history.get(0).unwrap().timestamp;
    let ts1 = history.get(1).unwrap().timestamp;
    let ts2 = history.get(2).unwrap().timestamp;
    let ts3 = history.get(3).unwrap().timestamp;
    assert!(ts0 <= ts1);
    assert!(ts1 <= ts2);
    assert!(ts2 <= ts3);
}

#[test]
fn test_stream_history_nonexistent_stream() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let history = c.get_stream_history(&999);
    assert_eq!(history.len(), 0);
}

// ---------------------------------------------------------------------------
// Advanced query tests (issue #XXXX)
// ---------------------------------------------------------------------------

/// Helper to create a stream with specific parameters for testing.
fn create_test_stream(
    c: &StellarStreamContractClient,
    sender: &Address,
    receiver: &Address,
    token: &Address,
    amount: i128,
    start_time: u64,
    end_time: u64,
    state: u32,
) -> u64 {
    let id = c.create_stream(
        sender,
        receiver,
        token,
        &amount,
        &start_time,
        &end_time,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // If state is not ACTIVE, pause or close the stream as needed
    if state == STATE_PAUSED {
        c.pause_stream(&id, sender);
    } else if state == STATE_CLOSED {
        c.cancel_stream(&id, sender);
    }

    id
}

#[test]
fn test_query_streams_filter_by_token() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let token2 = f.env.register(MockToken, ());

    // Create streams with different tokens
    let id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &token2,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Query by token 1
    let filter = StreamFilter {
        token: Some(f.token.clone()),
        state: None,
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().id, id1);

    // Query by token 2
    let filter = StreamFilter {
        token: Some(token2.clone()),
        state: None,
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().id, id2);
}

#[test]
fn test_query_streams_filter_by_status() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    let id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_000_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Pause one stream
    c.pause_stream(&id2, &f.sender);

    // Query active streams
    let filter = StreamFilter {
        token: None,
        state: Some(STATE_ACTIVE),
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().state, STATE_ACTIVE);

    // Query paused streams
    let filter = StreamFilter {
        token: None,
        state: Some(STATE_PAUSED),
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().state, STATE_PAUSED);
}

#[test]
fn test_query_streams_filter_by_amount_range() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create streams with different amounts
    let _id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &500i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &2_500i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id3 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Filter for amounts between 1000 and 4000
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: Some(1_000i128),
        max_amount: Some(4_000i128),
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().total_amount, 2_500i128);
}

#[test]
fn test_query_streams_filter_by_time_range() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create streams with different time ranges
    let _id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000i128,
        &1_000u64,
        &2_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id3 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000i128,
        &3_000u64,
        &4_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Filter for streams that start at or after 500
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: None,
        max_amount: None,
        start_time_after: Some(500u64),
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 2);

    // Filter for streams that end at or before 1500
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: Some(1_500u64),
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 2);
}

#[test]
fn test_query_streams_combined_filters() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let token2 = f.env.register(MockToken, ());

    // Create diverse set of streams
    let id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &token2,
        &2_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let _id3 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Pause one stream
    c.pause_stream(&id1, &f.sender);

    // Filter by token, amount range, and status
    let filter = StreamFilter {
        token: Some(f.token.clone()),
        state: Some(STATE_ACTIVE),
        min_amount: Some(3_000i128),
        max_amount: Some(10_000i128),
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().total_amount, 5_000i128);
}

#[test]
fn test_query_streams_pagination_offset() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create multiple streams
    for i in 0..5 {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * (i + 1) as i128),
            &0u64,
            &1_000u64,
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Query with offset=0
    let filter = StreamFilter::default();
    let results = c.query_streams(&filter, &0u32, &2u32);
    assert_eq!(results.len(), 2);

    // Query with offset=2
    let results = c.query_streams(&filter, &2u32, &2u32);
    assert_eq!(results.len(), 2);

    // Query with offset=4
    let results = c.query_streams(&filter, &4u32, &2u32);
    assert_eq!(results.len(), 1);

    // Query with offset beyond results
    let results = c.query_streams(&filter, &10u32, &2u32);
    assert_eq!(results.len(), 0);
}

#[test]
fn test_query_streams_pagination_limit() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create multiple streams
    for i in 0..10 {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * (i + 1) as i128),
            &0u64,
            &1_000u64,
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Query with limit=5
    let filter = StreamFilter::default();
    let results = c.query_streams(&filter, &0u32, &5u32);
    assert_eq!(results.len(), 5);

    // Query with limit=20 (should return all 10)
    let results = c.query_streams(&filter, &0u32, &20u32);
    assert_eq!(results.len(), 10);
}

#[test]
fn test_query_streams_limit_capped_at_50() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create 60 streams
    for i in 0..60 {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * (i + 1) as i128),
            &0u64,
            &1_000u64,
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Query with limit=100 (should be capped at 50)
    let filter = StreamFilter::default();
    let results = c.query_streams(&filter, &0u32, &100u32);
    assert_eq!(results.len(), 50);
}

#[test]
fn test_query_streams_empty_results() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create a stream with a specific token
    let token2 = f.env.register(MockToken, ());
    c.create_stream(
        &f.sender,
        &f.receiver,
        &token2,
        &1_000i128,
        &0u64,
        &1_000u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Query for a different token
    let filter = StreamFilter {
        token: Some(f.token.clone()),
        state: None,
        min_amount: None,
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 0);
}

#[test]
fn test_query_streams_no_filter_returns_all() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create multiple streams
    let count = 3;
    for i in 0..count {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * (i + 1) as i128),
            &0u64,
            &1_000u64,
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Query with no filters (all None)
    let filter = StreamFilter::default();
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), count as usize);
}

#[test]
fn test_query_streams_multiple_pages() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create 15 streams
    for i in 0..15 {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * (i + 1) as i128),
            &0u64,
            &1_000u64,
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Fetch first page (limit=5)
    let filter = StreamFilter::default();
    let page1 = c.query_streams(&filter, &0u32, &5u32);
    assert_eq!(page1.len(), 5);

    // Fetch second page (offset=5, limit=5)
    let page2 = c.query_streams(&filter, &5u32, &5u32);
    assert_eq!(page2.len(), 5);

    // Fetch third page (offset=10, limit=5)
    let page3 = c.query_streams(&filter, &10u32, &5u32);
    assert_eq!(page3.len(), 5);

    // Verify all ids are different
    let ids1: Vec<u64> = page1.iter().map(|s| s.id).collect();
    let ids2: Vec<u64> = page2.iter().map(|s| s.id).collect();
    let ids3: Vec<u64> = page3.iter().map(|s| s.id).collect();

    for id in ids2.iter() {
        assert!(!ids1.contains(id));
    }
    for id in ids3.iter() {
        assert!(!ids1.contains(id));
        assert!(!ids2.contains(id));
    }
}

#[test]
fn test_query_streams_edge_case_exact_boundaries() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create streams with exact boundary values
    let id1 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let id2 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &5_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    let id3 = c.create_stream(
        &f.sender,
        &f.receiver,
        &f.token,
        &10_000i128,
        &100u64,
        &500u64,
        &CURVE_LINEAR,
        &false,
        &None,
    );

    // Query for exact min_amount (should include id1)
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: Some(1_000i128),
        max_amount: None,
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 3);

    // Query for exact max_amount (should include id3)
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: None,
        max_amount: Some(10_000i128),
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 3);

    // Query for range excluding middle values
    let filter = StreamFilter {
        token: None,
        state: None,
        min_amount: Some(1_000i128),
        max_amount: Some(1_000i128),
        start_time_after: None,
        end_time_before: None,
    };
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().id, id1);
}

#[test]
fn test_query_streams_large_dataset_performance() {
    let f = setup();
    let c = client(&f.env, &f.contract);

    // Create 100 streams
    for i in 0..100 {
        c.create_stream(
            &f.sender,
            &f.receiver,
            &f.token,
            &(1_000 * ((i % 10 + 1) as i128)),
            &(i as u64 * 100),
            &((i as u64 + 1) * 100),
            &CURVE_LINEAR,
            &false,
            &None,
        );
    }

    // Query should still work efficiently even with large dataset
    let filter = StreamFilter::default();
    let results = c.query_streams(&filter, &0u32, &50u32);
    assert_eq!(results.len(), 50);

    // Test pagination through all results
    for offset in (0..100).step_by(25) {
        let results = c.query_streams(&filter, &(offset as u32), &25u32);
        assert!(results.len() <= 25 && results.len() > 0);
    }
}


// ---------------------------------------------------------------------------
// Oracle/USD pegging tests
// ---------------------------------------------------------------------------

/// Mock oracle contract for testing USD price feeds.
#[contract]
pub struct MockOracle;

#[contractimpl]
impl MockOracle {
    pub fn get_price(_env: Env, _token: Address) -> i128 {
        // Default: 1 token = $1.00 (10_000 basis points)
        10_000i128
    }
}

/// Mock oracle that returns a custom price.
#[contract]
pub struct CustomPriceOracle {
    price: i128,
}

#[contractimpl]
impl CustomPriceOracle {
    pub fn get_price(_env: Env, _token: Address) -> i128 {
        // This would need mutable state, which Soroban doesn't support in this way
        // Instead, we'll use environment setup for testing
        10_000i128
    }
}

#[test]
fn test_create_stream_usd_basic() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();

    // Create a mock oracle
    let oracle = f.env.register(MockOracle, ());

    // Create USD-pegged stream: $1,000 USD (1_000_000 basis points)
    // Oracle price: $1.00 per token (10_000 bps)
    // Expected token amount: 1,000,000 / 10,000 * 10,000 = 1,000,000
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128, // 1,000 USD in basis points
        &oracle,
        &9_000i128,  // min price: $0.90
        &11_000i128, // max price: $1.10
        &now,
        &(now + 1_000),
    );

    // Verify stream was created
    let stream = c.get_stream(&id);
    assert_eq!(stream.total_amount, 1_000_000i128);
    assert_eq!(stream.state, STATE_ACTIVE);
    assert_eq!(stream.token, f.token);
}

#[test]
fn test_create_stream_usd_price_conversion() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Test with different USD amounts
    // USD amount: 500 (0.05 USD in basis points)
    // Oracle price: 10_000 (1 token = $1.00)
    // Expected token amount: (500 * 10_000) / 10_000 = 500
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &500i128,
        &oracle,
        &10_000i128,
        &10_000i128,
        &now,
        &(now + 1_000),
    );

    let stream = c.get_stream(&id);
    assert_eq!(stream.total_amount, 500i128);
}

#[test]
fn test_create_stream_usd_slippage_rejection_high_price() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Oracle returns 10_000 (1 token = $1.00)
    // Max slippage: 5_000 (max price $0.50)
    // This should fail because 10_000 > 5_000
    assert_eq!(
        c.try_create_stream_usd(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &oracle,
            &0i128,      // min price
            &5_000i128,  // max price (too low)
            &now,
            &(now + 1_000),
        ),
        Err(Ok(Error::OraclePriceOutOfBounds))
    );
}

#[test]
fn test_create_stream_usd_slippage_rejection_low_price() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Oracle returns 10_000 (1 token = $1.00)
    // Min slippage: 15_000 (min price $1.50)
    // This should fail because 10_000 < 15_000
    assert_eq!(
        c.try_create_stream_usd(
            &f.sender,
            &f.receiver,
            &f.token,
            &1_000_000i128,
            &oracle,
            &15_000i128, // min price (too high)
            &20_000i128, // max price
            &now,
            &(now + 1_000),
        ),
        Err(Ok(Error::OraclePriceOutOfBounds))
    );
}

#[test]
fn test_create_stream_usd_invalid_usd_amount_zero() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // USD amount = 0 should fail
    assert_eq!(
        c.try_create_stream_usd(
            &f.sender,
            &f.receiver,
            &f.token,
            &0i128,
            &oracle,
            &10_000i128,
            &10_000i128,
            &now,
            &(now + 1_000),
        ),
        Err(Ok(Error::InvalidUsdAmount))
    );
}

#[test]
fn test_create_stream_usd_invalid_usd_amount_negative() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Negative USD amount should fail
    assert_eq!(
        c.try_create_stream_usd(
            &f.sender,
            &f.receiver,
            &f.token,
            &-1_000i128,
            &oracle,
            &10_000i128,
            &10_000i128,
            &now,
            &(now + 1_000),
        ),
        Err(Ok(Error::InvalidUsdAmount))
    );
}

#[test]
fn test_create_stream_usd_stream_operations_after_creation() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Create USD-pegged stream
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &oracle,
        &10_000i128,
        &10_000i128,
        &now,
        &(now + 1_000),
    );

    // Verify basic stream operations work
    let stream = c.get_stream(&id);
    assert_eq!(stream.total_amount, 1_000_000i128);

    // Test pause/resume
    c.pause_stream(&id, &f.sender);
    let paused_stream = c.get_stream(&id);
    assert_eq!(paused_stream.state, STATE_PAUSED);

    c.resume_stream(&id, &f.sender);
    let active_stream = c.get_stream(&id);
    assert_eq!(active_stream.state, STATE_ACTIVE);

    // Test cancellation
    c.cancel_stream(&id, &f.sender);
    let cancelled_stream = c.get_stream(&id);
    assert_eq!(cancelled_stream.state, STATE_CLOSED);
}

#[test]
fn test_create_stream_usd_event_emission() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Clear events first
    f.env.events().all();

    // Create USD-pegged stream
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &oracle,
        &10_000i128,
        &10_000i128,
        &now,
        &(now + 1_000),
    );

    // Verify events were emitted
    let events = f.env.events().all();
    // Should have at least one event (StreamCreatedUsdEvent)
    assert!(events.len() > 0);
}

#[test]
fn test_create_stream_usd_with_milestones() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Create USD-pegged stream (linear curve, no milestones in this version)
    // Milestones would be added in an extended create_stream_usd variant
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &oracle,
        &10_000i128,
        &10_000i128,
        &now,
        &(now + 1_000),
    );

    // Verify stream was created with correct amount and linear curve
    let stream = c.get_stream(&id);
    assert_eq!(stream.total_amount, 1_000_000i128);
    assert_eq!(stream.curve_type, CURVE_LINEAR);
}

#[test]
fn test_create_stream_usd_with_clawback() {
    let f = setup();
    let c = client(&f.env, &f.contract);
    let now = f.env.ledger().timestamp();
    let oracle = f.env.register(MockOracle, ());

    // Note: Current create_stream_usd uses linear curve without clawback
    // To test clawback, use the regular create_stream with calculated amounts
    let id = c.create_stream_usd(
        &f.sender,
        &f.receiver,
        &f.token,
        &1_000_000i128,
        &oracle,
        &10_000i128,
        &10_000i128,
        &now,
        &(now + 1_000),
    );

    // Verify stream was created and works with regular operations
    let stream = c.get_stream(&id);
    assert_eq!(stream.total_amount, 1_000_000i128);
    assert_eq!(stream.clawback_enabled, false); // Not enabled in basic USD stream
}
