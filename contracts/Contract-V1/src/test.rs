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
        &100u64,  // start time
        &1100u64, // end time (1000s duration)
        &CURVE_LINEAR,
        &false,
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
// Issue #1445 — calculate_unlocked_exponential (exponential / quadratic vesting)
// ---------------------------------------------------------------------------

use crate::math::calculate_unlocked_exponential;
use crate::math::calculate_unlocked;

/// Before the stream starts nothing is unlocked.
#[test]
fn test_exponential_before_start_is_zero() {
    assert_eq!(calculate_unlocked_exponential(10_000, 100, 200, 0, 0), 0);
    assert_eq!(calculate_unlocked_exponential(10_000, 100, 200, 99, 0), 0);
    assert_eq!(calculate_unlocked_exponential(10_000, 100, 200, 100, 0), 0);
}

/// Exactly at the start time nothing is unlocked.
#[test]
fn test_exponential_at_start_is_zero() {
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 0, 0), 0);
}

/// At or after the end time everything is unlocked.
#[test]
fn test_exponential_after_end_is_full() {
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 100, 0), 10_000);
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 100_000, 0), 10_000);
    assert_eq!(calculate_unlocked_exponential(10_000, 50, 100, 150, 500), 10_000);
}

/// Early stage unlocks slowly: at 10% time only 1% is unlocked.
#[test]
fn test_exponential_early_stage_slow_unlock() {
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 10, 0), 100);
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 25, 0), 625);
}

/// Mid stage: at 50% time only 25% is unlocked (quadratic, not linear).
#[test]
fn test_exponential_mid_stage_quarter() {
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 50, 0), 2_500);
}

/// The checkpoint from the issue: 50% unlocked at ~70.7% of time.
#[test]
fn test_exponential_seventy_percent_checkpoint_half() {
    // 70.7% of 100 seconds -> elapsed=70, 70^2/100^2 = 0.49 -> 4_900.
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 70, 0), 4_900);
    assert!(calculate_unlocked_exponential(10_000, 0, 100, 70, 0) <= 5_000);
    // A finer sample near the true 50% checkpoint: duration 10_000, t=7_071.
    let half = calculate_unlocked_exponential(10_000_000, 0, 10_000, 7_071, 0);
    assert_eq!(half, 4_999_904);
}

/// Late stage unlocks fast: at 90% time 81% is unlocked.
#[test]
fn test_exponential_late_stage_fast_unlock() {
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 90, 0), 8_100);
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 99, 0), 9_801);
}

/// Paused duration is subtracted from elapsed time.
#[test]
fn test_exponential_subtracts_paused_duration() {
    // No pause: elapsed=50 -> 25%.
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 50, 0), 2_500);
    // 10 seconds paused: effective elapsed=40 -> 16%.
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 50, 10), 1_600);
    // Pause >= raw elapsed -> effective elapsed 0.
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 50, 50), 0);
    assert_eq!(calculate_unlocked_exponential(10_000, 0, 100, 50, 500), 0);
}

/// Large amounts with a small elapsed time stay inside i128 and unlock a
/// positive, bounded result (never a wrap or panic).
#[test]
fn test_exponential_large_amounts_no_overflow() {
    // Maximal-strength amount. With elapsed=1 the squared product is exactly
    // `amount * 1`, which fits, and the result is `amount / duration²`.
    let big = i128::MAX;
    let out = calculate_unlocked_exponential(big, 0, 1_000, 1, 0);
    assert!(out > 0);
    assert!(out <= big);
    assert_eq!(out, big / 1_000_000);

    // A large realistic amount over a one-year duration reaches ~1/4 at 50%.
    let yearly = 100_000_000_000_000_000_i128; // 1e17
    let start = 1_700_000_000u64;
    let dur = 31_536_000u64; // 1 year in seconds
    let at_half = calculate_unlocked_exponential(yearly, start, start + dur, start + dur / 2, 0);
    assert!(at_half > 0);
    assert!(at_half <= yearly);
    // elapsed == duration/2 exactly -> unlocked == yearly / 4, exactly.
    assert_eq!(at_half, 25_000_000_000_000_000);
}

/// Force overflow of the intermediate product -> guarded to 0 (safe).
#[test]
fn test_exponential_overflow_prevention() {
    assert_eq!(
        calculate_unlocked_exponential(i128::MAX, 0, u64::MAX, u64::MAX - 1, 0),
        0
    );
}

/// Result is always <= total_amount across the whole curve.
#[test]
fn test_exponential_always_within_total() {
    let total = 1_000_000_000_i128;
    let start = 0u64;
    let end = 1_000u64;
    for t in 0..=1_000u64 {
        for p in [0u64, 10, 200, 400] {
            let v = calculate_unlocked_exponential(total, start, end, t, p);
            assert!(v >= 0, "negative at t={t}");
            assert!(v <= total, "exceeded total at t={t}");
        }
    }
}

/// Curve comparison with the linear curve.
#[test]
fn test_exponential_early_less_than_linear_less_than_late() {
    let total = 10_000_i128;
    let start = 0u64;
    let end = 100u64;

    // Early: exponential (900) is below linear (3_000).
    let exp_early = calculate_unlocked_exponential(total, start, end, 30, 0);
    let lin_early = calculate_unlocked(total, start, start, end, 30);
    assert!(exp_early < lin_early, "exp early {exp_early} < linear {lin_early}");
    assert_eq!(exp_early, 900);
    assert_eq!(lin_early, 3_000);

    // Mid (50%): linear 5_000, quadratic 2_500.
    assert_eq!(calculate_unlocked_exponential(total, start, end, 50, 0), 2_500);
    assert_eq!(calculate_unlocked(total, start, start, end, 50), 5_000);

    // Late (90%): still below linear until full duration.
    let exp_late = calculate_unlocked_exponential(total, start, end, 90, 0);
    let lin_late = calculate_unlocked(total, start, start, end, 90);
    assert!(exp_late < lin_late, "late exp {exp_late} vs linear {lin_late}");
    assert!(exp_late < total);

    // Final full unlock matches linear at 100%.
    assert_eq!(
        calculate_unlocked_exponential(total, start, end, 100, 0),
        calculate_unlocked(total, start, start, end, 100),
    );
}

/// Exponential is monotonic non-decreasing.
#[test]
fn test_exponential_monotonic() {
    let mut prev = -1i128;
    for t in 0..=100u64 {
        let v = calculate_unlocked_exponential(10_000, 0, 100, t, 0);
        assert!(v >= prev, "decreased at t={t}: {prev} -> {v}");
        prev = v;
    }
    assert_eq!(prev, 10_000);
}
