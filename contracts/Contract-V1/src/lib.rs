#![no_std]

//! StellarStream - Real-time asset streaming on Stellar
//!
//! Genesis contract (V1) for the StellarStream protocol.
//!
//! Core concepts:
//! - Continuous token streaming from sender to receiver
//! - Linear / exponential vesting based on elapsed time
//! - Real-time withdrawals of unlocked amounts
//! - Cancellation support with automatic refunds
//! - Role-based access control, pause/resume, and OFAC-style address restriction
//! - Re-entrancy safe withdrawals (checks-effects-interactions + temporary lock)
//! - Health and usage metrics for production monitoring
//!
//! # Monitoring
//!
//! [`StellarStreamContract::health_check`] reports point-in-time state (paused
//! flag, active stream count, per-token TVL, last activity, version) and
//! [`StellarStreamContract::get_metrics`] reports rolling 24-hour usage
//! (streams created, withdrawals, average duration and size, unique users).
//!
//! Both are read-only and cheap enough to poll frequently, which is the whole
//! point of a health endpoint. That is achieved by maintaining counters as
//! operations happen rather than deriving them on read: a read that scanned
//! stream state would get more expensive exactly as the contract got busier.
//! Usage statistics live in hourly buckets, so a read sums at most
//! [`METRICS_WINDOW_HOURS`] entries no matter how much traffic there was, and
//! buckets outside the window are pruned at most once per hour.
//!
//! `unique_users_24h` is the one deliberately approximate figure: it is capped
//! at [`MAX_TRACKED_USERS`] so the address set cannot grow without bound. Above
//! that it saturates, and should be read as "at least this many".
//!
//! See `METRICS.md` for the Prometheus exporter and Grafana setup that consume
//! these two functions.
//! - Configurable protocol fee collected to a treasury on stream creation
//!
//! # Protocol fee
//!
//! Creating a stream charges a protocol fee **on top of** the streamed amount.
//! A stream of 1_000 tokens at 100 bps costs the sender 1_010 tokens: 1_000
//! remain streamable to the receiver and 10 go to the treasury. The stream's
//! `total_amount` is never reduced by the fee, so a receiver is always owed
//! exactly what the stream says.
//!
//! - The rate is stored in basis points, where 10_000 bps is 100%
//!   ([`BPS_DENOMINATOR`]), and is capped at [`MAX_FEE_BPS`] (1_000 bps = 10%).
//!   The cap is enforced on write, so an out-of-range rate can never be
//!   observed by `create_stream`.
//! - The fee is `amount * fee_bps / 10_000`, rounded down, computed with
//!   checked multiplication so a large amount reports [`Error::Overflow`]
//!   instead of wrapping.
//! - A rate of `0` disables collection: no token transfer is attempted and no
//!   treasury is required.
//! - With a non-zero rate and no treasury configured, `create_stream` fails
//!   with [`Error::TreasuryNotSet`] rather than quietly skipping the fee.
//! - Collection and stream creation share one invocation, so they succeed or
//!   fail together. A sender who cannot cover `amount + fee` creates no stream.
//! - [`StellarStreamContract::set_protocol_fee`] and
//!   [`StellarStreamContract::set_treasury_address`] require [`ROLE_TREASURY`]
//!   or [`ROLE_ADMIN`].
//!
//! Streams created by multi-signature proposal execution are not charged: the
//! fee transfer debits the sender, and proposal execution runs under the
//! approvers' authorization rather than the sender's.
//! - Configurable protocol fee collected to a treasury on stream creation
//!
//! # Protocol fees
//!
//! The protocol charges a fee, expressed in basis points, every time a stream
//! is created through [`StellarStreamContract::create_stream`].
//!
//! The fee is charged **on top of** the stream amount, never taken out of it.
//! A 1_000_000-unit stream at 100 bps (1%) leaves the receiver entitled to the
//! full 1_000_000 and moves a further 10_000 to the treasury, so the sender
//! parts with 1_010_000 in total. This keeps `total_amount` a promise to the
//! receiver rather than a number the protocol quietly shaves.
//!
//! Both transfers happen inside one invocation. If the sender cannot cover
//! `amount + fee`, the token transfer traps and the stream creation is rolled
//! back with it — there is no state in which a stream exists but its fee went
//! uncollected.
//!
//! The rate is capped at [`MAX_FEE_BPS`] (10%) at the point it is written, so
//! an out-of-range rate can never reach stream creation. A rate of `0` is
//! valid and short-circuits before any token call. Fee settings are managed by
//! accounts holding [`ROLE_TREASURY`] or [`ROLE_ADMIN`] via
//! [`StellarStreamContract::set_protocol_fee`] and
//! [`StellarStreamContract::set_treasury_address`]; callers can preview the
//! charge with [`StellarStreamContract::calculate_protocol_fee`].
//!
//! Streams created by multi-signature proposal execution are not charged,
//! because that path creates the stream under the approvers' authorization
//! rather than the sender's and so cannot move the sender's tokens.
//!
//! See `contracts/Contract-V1/README.md` for the full specification.

pub mod errors;
pub mod flash_loan;
pub mod math;
pub mod storage;
pub mod clawback;
pub mod compliance;

#[cfg(test)]
mod bench_test;
#[cfg(test)]
mod clawback_test;
#[cfg(test)]
mod compliance_test;

use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype, symbol_short, Address,
    Env, Map, String, Vec, Bytes,
};
use storage::{
    bump_persistent_ttl_if_present, extend_history_ttl, extend_instance_ttl, extend_metadata_ttl,
    extend_proposal_ttl, extend_stream_ttl, extend_user_streams_ttl, DataKey,
};

// Stream state
pub const STATE_ACTIVE: u32 = 0;
pub const STATE_PAUSED: u32 = 1;
pub const STATE_CLOSED: u32 = 2;

// Vesting curve
pub const CURVE_LINEAR: u32 = 0;
pub const CURVE_EXP: u32 = 1;
pub const CURVE_MILESTONE: u32 = 2;

// Protocol fee
/// Denominator for basis-point math: 10_000 bps == 100%.
pub const BPS_DENOMINATOR: i128 = 10_000;
/// Hard ceiling on the protocol fee: 1_000 bps == 10%.
pub const MAX_FEE_BPS: u32 = 1_000;

// Monitoring
/// Version reported by [`StellarStreamContract::health_check`].
pub const CONTRACT_VERSION: u32 = 1;
/// Width of the rolling metrics window, in hourly buckets.
pub const METRICS_WINDOW_HOURS: u64 = 24;
/// Seconds per metrics bucket.
pub const SECONDS_PER_HOUR: u64 = 3_600;
/// Ceiling on addresses tracked for `unique_users_24h`, so that both the
/// bookkeeping and the read stay bounded regardless of traffic.
pub const MAX_TRACKED_USERS: u32 = 64;

// Roles
pub const ROLE_ADMIN: u32 = 0;
pub const ROLE_PAUSER: u32 = 1;
pub const ROLE_TREASURY: u32 = 2;

// Re-export the error enum from the errors module.
pub use errors::Error;

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub receiver: Address,
    pub token: Address,
    pub total_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub withdrawn_amount: i128,
    pub state: u32,
    pub curve_type: u32,
    pub is_soulbound: bool,
    pub paused_duration: u64,
    pub last_paused_at: u64,
    /// Present only when `curve_type == CURVE_MILESTONE`; see [`Milestone`].
    pub milestones: Option<Vec<Milestone>>,
    /// If true, the sender may raise clawback requests on this stream.
    pub clawback_enabled: bool,
}

// ---------------------------------------------------------------------------
// Stream metadata for categorization (issue #1466)
//
// Metadata lives in its own `StreamMetadata(stream_id)` persistent entry keyed
// by stream id rather than as an `Option<StreamMetadata>` field on `Stream`:
// soroban-sdk 22 cannot convert an `Option<T>` whose `T` is a user
// `#[contracttype]` struct, which makes any struct carrying such a field fail
// to build under `testutils`.

/// A single unlock checkpoint in a milestone-vesting schedule.
///
/// Milestone vesting unlocks tokens in discrete steps at fixed timestamps
/// instead of continuously over time. Each milestone's `percentage` is a
/// **cumulative** basis-point share (out of 10,000) of the stream's total
/// amount — not an incremental slice on top of the previous milestone. For
/// example, the schedule `[(3mo, 2500), (6mo, 5000), (12mo, 10000)]` means
/// 25% is unlocked at 3 months, a *total* of 50% at 6 months, and 100% at 12
/// months (not 25% + 25% + 50%).
///
/// A valid schedule must have strictly ascending `timestamp`s, strictly
/// ascending `percentage`s, and a final `percentage` of exactly 10,000 bps.
/// Before the first milestone's timestamp is reached, nothing is unlocked;
/// between two reached milestones, the most recently reached milestone's
/// percentage holds (no partial/gradual unlock in between).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    /// Ledger timestamp (seconds) at which this checkpoint is reached.
    pub timestamp: u64,
    /// Cumulative basis points (out of 10,000) unlocked once `timestamp` is reached.
    pub percentage: u32,
}

// Stream metadata for categorization (issue #1466)
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StreamMetadata {
    pub label: String,
    pub tags: Vec<String>,
    pub external_ref: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct StreamMetadataUpdatedEvent {
    pub stream_id: u64,
    pub sender: Address,
    pub timestamp: u64,
}

/// Point-in-time health of the contract, for liveness checks and alerting.
///
/// Every field is an O(1) read of a counter maintained as streams change, so
/// this is cheap enough to poll frequently.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractHealth {
    /// Whether the contract is globally paused.
    pub is_paused: bool,
    /// Streams that have not been closed.
    pub active_streams: u64,
    /// Value still owed to receivers, per token address.
    pub total_tvl: Map<Address, i128>,
    /// Ledger timestamp of the last state-changing operation.
    pub last_activity_time: u64,
    /// Contract version, see [`CONTRACT_VERSION`].
    pub version: u32,
}

/// Rolling 24-hour usage statistics.
///
/// Derived from at most [`METRICS_WINDOW_HOURS`] hourly buckets that are
/// updated as operations happen, so reading them never scans stream state.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractMetrics {
    /// Streams created in the last 24 hours.
    pub streams_created_24h: u64,
    /// Withdrawals executed in the last 24 hours.
    pub withdrawals_24h: u64,
    /// Mean duration of streams created in the window, in seconds.
    pub avg_stream_duration: u64,
    /// Mean size of streams created in the window, in token units.
    pub avg_stream_amount: i128,
    /// Distinct addresses seen in the window, capped at [`MAX_TRACKED_USERS`].
    pub unique_users_24h: u64,
}

/// One hour of activity. Buckets outside the window are pruned.
#[contracttype]
#[derive(Clone, Debug)]
pub struct MetricBucket {
    /// Streams created during this hour.
    pub streams_created: u64,
    /// Withdrawals during this hour.
    pub withdrawals: u64,
    /// Sum of created stream durations, for the running average.
    pub duration_sum: u64,
    /// Sum of created stream amounts, for the running average.
    pub amount_sum: i128,
}

/// Emitted when a protocol fee is collected while creating a stream.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ProtocolFeeCollectedEvent {
    /// Stream the fee was charged for.
    pub stream_id: u64,
    /// Account that paid the fee (the stream's sender).
    pub payer: Address,
    /// Treasury the fee was credited to.
    pub treasury: Address,
    /// Token the fee was denominated in (same token as the stream).
    pub token: Address,
    /// Fee actually transferred, in token units.
    pub fee_amount: i128,
    /// Fee rate applied, in basis points.
    pub fee_bps: u32,
}

/// A pending multi-signature stream proposal.
///
/// A proposal holds the parameters of a stream that should be created once a
/// threshold of distinct addresses has approved it. The stream is created
/// automatically (without a separate execute call) the moment the number of
/// approvers reaches `required_approvals`.
#[contracttype]
#[derive(Clone)]
pub struct StreamProposal {
    /// Treasury / source account that will fund the stream.
    pub sender: Address,
    /// Recipient of the stream.
    pub receiver: Address,
    /// Token contract address.
    pub token: Address,
    /// Total stream amount.
    pub total_amount: i128,
    /// Stream start timestamp.
    pub start_time: u64,
    /// Stream end timestamp.
    pub end_time: u64,
    /// Addresses that have approved so far (each may approve only once).
    pub approvers: Vec<Address>,
    /// M-of-N threshold: number of distinct approvals required to execute.
    pub required_approvals: u32,
    /// Timestamp after which the proposal can no longer be approved.
    pub deadline: u64,
    /// Whether the proposal has been executed (stream already created).
    pub executed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StreamAction {
    Created,
    Withdrawn(i128),
    Paused,
    Resumed,
    ToppedUp(i128),
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StreamEvent {
    pub stream_id: u64,
    pub action: StreamAction,
    pub timestamp: u64,
}

// Minimal token interface used by `withdraw`.
#[contractclient(name = "TokenClient")]
pub trait Token {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

// ---------------------------------------------------------------------------
// Clawback types
// ---------------------------------------------------------------------------

/// Lifecycle state of a clawback request.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ClawbackStatus {
    Pending,
    Approved,
    Executed,
    Rejected,
}

/// A clawback request allowing a stream sender to recover previously withdrawn tokens.
///
/// Opt-in: the stream must have been created with `clawback_enabled = true`.
/// Amount cannot exceed `stream.withdrawn_amount`.
#[contracttype]
#[derive(Clone)]
pub struct ClawbackRequest {
    pub clawback_id: u64,
    pub stream_id: u64,
    pub amount: i128,
    pub reason: String,
    pub approved_by_receiver: bool,
    pub approvals: Vec<Address>,
    pub required_approvals: u32,
    pub status: ClawbackStatus,
    pub created_at: u64,
    pub expires_at: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackRequestedEvent {
    pub clawback_id: u64,
    pub stream_id: u64,
    pub sender: Address,
    pub amount: i128,
    pub reason: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackApprovedEvent {
    pub clawback_id: u64,
    pub approver: Address,
    pub by_receiver: bool,
    pub approval_count: u32,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackExecutedEvent {
    pub clawback_id: u64,
    pub stream_id: u64,
    pub amount: i128,
    pub sender: Address,
    pub timestamp: u64,
}

// ---------------------------------------------------------------------------
// Clawback types
// ---------------------------------------------------------------------------

/// Lifecycle state of a clawback request.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ClawbackStatus {
    /// Request created, awaiting approval.
    Pending,
    /// Sufficient approvals received; ready for execution.
    Approved,
    /// Tokens transferred back to sender.
    Executed,
    /// Expired or explicitly rejected; cannot progress further.
    Rejected,
}

/// A clawback request: sender asks to recover previously withdrawn tokens.
///
/// Clawback is opt-in — the stream must have been created with
/// `clawback_enabled = true`. The amount cannot exceed `withdrawn_amount`.
///
/// Approval path: either the receiver approves directly, or enough governance
/// addresses accumulate approvals (`approvals.len() >= required_approvals`).
#[contracttype]
#[derive(Clone)]
pub struct ClawbackRequest {
    /// Unique request ID.
    pub clawback_id: u64,
    /// ID of the stream this clawback targets.
    pub stream_id: u64,
    /// Tokens to recover; must be > 0 and ≤ `stream.withdrawn_amount`.
    pub amount: i128,
    /// Human-readable reason for the clawback.
    pub reason: String,
    /// Whether the stream's receiver has approved.
    pub approved_by_receiver: bool,
    /// Governance addresses that have approved (multi-sig path).
    pub approvals: Vec<Address>,
    /// Number of governance approvals required if receiver does not approve.
    pub required_approvals: u32,
    /// Current status.
    pub status: ClawbackStatus,
    /// Ledger timestamp when the request was created.
    pub created_at: u64,
    /// Optional expiry timestamp (`0` = no expiry).
    pub expires_at: u64,
}

/// Emitted when a clawback request is created.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackRequestedEvent {
    pub clawback_id: u64,
    pub stream_id: u64,
    pub sender: Address,
    pub amount: i128,
    pub reason: String,
    pub timestamp: u64,
}

/// Emitted when a clawback request receives an approval.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackApprovedEvent {
    pub clawback_id: u64,
    pub approver: Address,
    pub by_receiver: bool,
    pub approval_count: u32,
    pub timestamp: u64,
}

/// Emitted when an approved clawback is executed.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ClawbackExecutedEvent {
    pub clawback_id: u64,
    pub stream_id: u64,
    pub amount: i128,
    pub sender: Address,
    pub timestamp: u64,
}
// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------
#[contract]
pub struct StellarStreamContract;

#[contractimpl]
impl StellarStreamContract {
    /// Initialize the contract with an admin address. Idempotency guarded.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).is_some() {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ContractPaused, &false);
        env.storage().instance().set(&DataKey::StreamCounter, &1u64);
        env.storage().instance().set(&DataKey::ProposalCounter, &1u64);
        grant_role_internal(env.clone(), &admin, ROLE_ADMIN);
        Ok(())
    }

    /// Create a new stream. Returns the newly allocated stream id.
    pub fn create_stream(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        total_amount: i128,
        start_time: u64,
        end_time: u64,
        curve_type: u32,
        is_soulbound: bool,
        clawback_enabled: bool,
        milestones: Option<Vec<Milestone>>,
    ) -> Result<u64, Error> {
        sender.require_auth();
        extend_instance_ttl(&env);
        let stream_id = create_stream_internal(
            &env,
            &sender,
            &receiver,
            &token,
            total_amount,
            start_time,
            end_time,
            curve_type,
            is_soulbound,
            clawback_enabled,
            milestones,
        )?;
        collect_protocol_fee(&env, &sender, &token, stream_id, total_amount)?;
        Ok(stream_id)
    }

    /// Create a multi-signature proposal for a stream.
    ///
    /// The stream is not created immediately. Instead a proposal is stored
    /// which becomes a live stream automatically once `required_approvals`
    /// distinct addresses call [`approve_proposal`]. This lets a DAO treasury
    /// or corporate wallet require multiple signatures before committing to a
    /// payment stream.
    ///
    /// Returns the newly allocated proposal id.
    pub fn create_proposal(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        total_amount: i128,
        start_time: u64,
        end_time: u64,
        required_approvals: u32,
        deadline: u64,
    ) -> Result<u64, Error> {
        sender.require_auth();
        extend_instance_ttl(&env);
        if is_contract_paused(&env) {
            return Err(Error::ContractPaused);
        }
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).is_none() {
            return Err(Error::Unauthorized);
        }
        if total_amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if start_time >= end_time {
            return Err(Error::InvalidTimeRange);
        }
        if required_approvals == 0 {
            return Err(Error::InvalidApprovalThreshold);
        }
        if deadline <= env.ledger().timestamp() {
            return Err(Error::ProposalExpired);
        }
        if is_restricted(&env, &sender) || is_restricted(&env, &receiver) {
            return Err(Error::AddressRestricted);
        }

        let mut next = env
            .storage()
            .instance()
            .get::<_, u64>(&DataKey::ProposalCounter)
            .unwrap_or(1);
        let id = next;
        next = next.checked_add(1).ok_or(Error::Overflow)?;

        let proposal = StreamProposal {
            sender: sender.clone(),
            receiver: receiver.clone(),
            token,
            total_amount,
            start_time,
            end_time,
            approvers: Vec::new(&env),
            required_approvals,
            deadline,
            executed: false,
        };

        env.storage().persistent().set(&DataKey::Proposal(id), &proposal);
        extend_proposal_ttl(&env, id);
        env.storage().instance().set(&DataKey::ProposalCounter, &next);

        env.events()
            .publish((symbol_short!("proposal"), sender.clone()), id);
        Ok(id)
    }

    /// Approve a pending proposal.
    ///
    /// Each address may approve a given proposal at most once. When the number
    /// of distinct approvers reaches `required_approvals`, the proposal is
    /// marked executed and the underlying stream is created immediately.
    pub fn approve_proposal(
        env: Env,
        proposal_id: u64,
        approver: Address,
    ) -> Result<(), Error> {
        approver.require_auth();
        extend_instance_ttl(&env);
        if is_contract_paused(&env) {
            return Err(Error::ContractPaused);
        }

        let mut proposal = get_proposal(&env, proposal_id)?;

        if proposal.executed {
            return Err(Error::ProposalAlreadyExecuted);
        }
        if env.ledger().timestamp() > proposal.deadline {
            return Err(Error::ProposalExpired);
        }
        if proposal.approvers.contains(approver.clone()) {
            return Err(Error::AlreadyApproved);
        }

        proposal.approvers.push_back(approver.clone());
        env.events()
            .publish((symbol_short!("approval"), approver.clone()), proposal_id);

        if proposal.approvers.len() >= proposal.required_approvals {
            let stream_id = create_stream_internal(
                &env,
                &proposal.sender,
                &proposal.receiver,
                &proposal.token,
                proposal.total_amount,
                proposal.start_time,
                proposal.end_time,
                CURVE_LINEAR,
                false,
                false,
                None,
            )?;
            proposal.executed = true;
            save_proposal(&env, proposal_id, &proposal);
            env.events()
                .publish((symbol_short!("executed"), proposal.sender.clone()), stream_id);
        } else {
            save_proposal(&env, proposal_id, &proposal);
        }

        Ok(())
    }

    /// Query a proposal by id.
    pub fn get_proposal(env: Env, proposal_id: u64) -> Result<StreamProposal, Error> {
        get_proposal(&env, proposal_id)
    }

    /// Withdraw the currently unlocked amount to the receiver.
    /// Returns the amount withdrawn.
    pub fn withdraw(env: Env, stream_id: u64, receiver: Address) -> Result<i128, Error> {
        receiver.require_auth();
        extend_instance_ttl(&env);

        // Re-entrancy guard (temporary storage lock).
        if env.storage().temporary().get::<_, bool>(&DataKey::ReentrancyLock).unwrap_or(false) {
            return Err(Error::Reentrancy);
        }
        env.storage().temporary().set(&DataKey::ReentrancyLock, &true);

        let result = withdraw_inner(&env, stream_id, &receiver);

        env.storage().temporary().remove(&DataKey::ReentrancyLock);
        result
    }

    /// Execute a flash loan, borrowing idle tokens for a single transaction.
    ///
    /// Allows a borrower to atomically:
    /// 1. Borrow idle tokens (not allocated to active streams)
    /// 2. Execute callback logic (received_tokens are transferred to the callback contract)
    /// 3. Repay the loan + fee before the transaction ends
    ///
    /// # Arguments
    /// * `env` - The Soroban environment
    /// * `borrower` - Address requesting the flash loan
    /// * `token` - Address of the token to borrow
    /// * `amount` - Amount to borrow (must be non-negative and available)
    /// * `callback_contract` - Address of the contract to call back
    /// * `callback_data` - Arbitrary data passed to the callback
    ///
    /// # Returns
    /// `Result<(), Error>` - Success if loan was executed and repaid, error otherwise
    ///
    /// # Errors
    /// - `InsufficientFlashLiquidity` - Not enough idle tokens available
    /// - `InvalidFlashBorrowAmount` - Amount is invalid (zero or negative)
    /// - `FlashLoanInProgress` - Flash loan already executing (re-entrancy)
    /// - `InsufficientFlashRepayment` - Callback didn't repay principal + fee
    /// - `FlashLoanCallbackFailed` - Callback execution failed
    /// - `FlashLoanFeeOverflow` - Fee calculation overflowed
    ///
    /// # Implementation Details
    /// - Re-entrancy protected: only one flash loan can execute per transaction
    /// - Fee is calculated as: `amount * 50 bps / 10_000` (0.5% default)
    /// - Borrows only from idle tokens (total TVL is already reserved for streams)
    /// - Transfers tokens to callback contract, which must transfer back `amount + fee`
    pub fn flash_loan(
        env: Env,
        borrower: Address,
        token: Address,
        amount: i128,
        callback_contract: Address,
        callback_data: Bytes,
    ) -> Result<(), Error> {
        borrower.require_auth();
        extend_instance_ttl(&env);

        // Check for re-entrancy: only one flash loan per transaction
        if env.storage()
            .temporary()
            .get::<_, bool>(&DataKey::ActiveFlashLoan(token.clone()))
            .unwrap_or(false)
        {
            return Err(Error::FlashLoanInProgress);
        }

        // Validate borrow amount is positive
        if amount <= 0 {
            return Err(Error::InvalidFlashBorrowAmount);
        }

        // Calculate idle liquidity: total contract balance - TVL
        let tvl: i128 = get_tvl(&env)
            .get(token.clone())
            .unwrap_or(0);

        // Get token contract client to check balance
        let token_client = TokenClient::new(&env, &token);
        let contract_balance = token_client.balance(&env.current_contract_address());

        // Idle liquidity is balance minus allocated (TVL)
        let idle_liquidity = contract_balance - tvl;
        if idle_liquidity < amount {
            return Err(Error::InsufficientFlashLiquidity);
        }

        // Calculate fee (0.5% default = 50 bps)
        let fee = flash_loan::calculate_flash_loan_fee(amount, 50)
            .map_err(|_| Error::FlashLoanFeeOverflow)?;

        // Set re-entrancy lock for this token
        env.storage()
            .temporary()
            .set(&DataKey::ActiveFlashLoan(token.clone()), &true);

        // Transfer tokens to callback contract
        token_client.transfer(&env.current_contract_address(), &callback_contract, &amount);

        // Emit flash loan event
        env.events().publish(
            (symbol_short!("fl_exec"), borrower.clone()),
            flash_loan::FlashLoanEvent {
                borrower: borrower.clone(),
                token: token.clone(),
                amount,
                fee,
                timestamp: env.ledger().timestamp(),
            },
        );

        // Call the callback contract's execute_flash_loan function
        let callback_result = env.invoke_contract::<Result<(), String>>(
            &callback_contract,
            &symbol_short!("fl_exec"),
            (&token, &amount, &fee, &callback_data),
        );

        if let Err(_) = callback_result {
            env.storage()
                .temporary()
                .remove(&DataKey::ActiveFlashLoan(token));
            return Err(Error::FlashLoanCallbackFailed);
        }

        // Verify repayment: contract must have received at least amount + fee
        let final_balance = token_client.balance(&env.current_contract_address());
        let repaid = final_balance - contract_balance;

        if repaid < amount + fee {
            env.storage()
                .temporary()
                .remove(&DataKey::ActiveFlashLoan(token));
            return Err(Error::InsufficientFlashRepayment);
        }

        // Update TVL with fee (fee goes to protocol, increases available balance)
        // The TVL remains unchanged since we're only borrowing idle tokens
        // Fee is just extra tokens returned beyond the principal

        // Emit repayment event
        env.events().publish(
            (symbol_short!("fl_repay"), borrower),
            flash_loan::FlashLoanRepaymentEvent {
                borrower,
                token: token.clone(),
                amount,
                fee,
                timestamp: env.ledger().timestamp(),
            },
        );

        // Clear re-entrancy lock
        env.storage()
            .temporary()
            .remove(&DataKey::ActiveFlashLoan(token));

        Ok(())
    }

    /// Cancel a stream. Only the sender may cancel; refunds are implicit because
    /// the receiver can no longer withdraw unlocked funds once the stream is closed.
    pub fn cancel_stream(env: Env, stream_id: u64, sender: Address) -> Result<(), Error> {
        sender.require_auth();
        extend_instance_ttl(&env);
        let mut stream = get_stream(&env, stream_id)?;
        if stream.sender != sender {
            return Err(Error::Unauthorized);
        }
        if stream.state == STATE_CLOSED {
            return Err(Error::AlreadyCancelled);
        }
        stream.state = STATE_CLOSED;
        save_stream(&env, &stream);
        record_stream_closed(&env, &stream);
        // Record history event
        add_history(&env, stream_id, StreamAction::Cancelled);
        Ok(())
    }

    /// Pause an active stream. Only the sender may pause.
    pub fn pause_stream(env: Env, stream_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();
        extend_instance_ttl(&env);
        let mut stream = get_stream(&env, stream_id)?;
        if stream.sender != caller {
            return Err(Error::Unauthorized);
        }
        if stream.state == STATE_PAUSED {
            return Err(Error::AlreadyPaused);
        }
        if stream.state == STATE_CLOSED {
            return Err(Error::AlreadyCancelled);
        }
        stream.state = STATE_PAUSED;
        stream.last_paused_at = env.ledger().timestamp();
        save_stream(&env, &stream);
        // Record history event
        add_history(&env, stream_id, StreamAction::Paused);
        Ok(())
    }

    /// Resume a paused stream. Only the sender may resume.
    pub fn resume_stream(env: Env, stream_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();
        extend_instance_ttl(&env);
        let mut stream = get_stream(&env, stream_id)?;
        if stream.sender != caller {
            return Err(Error::Unauthorized);
        }
        if stream.state != STATE_PAUSED {
            return Err(Error::StreamNotPaused);
        }
        let now = env.ledger().timestamp();
        if stream.last_paused_at > 0 && now > stream.last_paused_at {
            stream.paused_duration = stream
                .paused_duration
                .checked_add(now - stream.last_paused_at)
                .ok_or(Error::Overflow)?;
        }
        stream.state = STATE_ACTIVE;
        stream.last_paused_at = 0;
        save_stream(&env, &stream);
        // Record history event
        add_history(&env, stream_id, StreamAction::Resumed);
        Ok(())
    }

    /// Query a stream by id.
    pub fn get_stream(env: Env, stream_id: u64) -> Result<Stream, Error> {
        get_stream(&env, stream_id)
    }

    /// Calculate the total unlocked amount for a stream at the current ledger time.
    pub fn get_unlocked_amount(env: Env, stream_id: u64) -> Result<i128, Error> {
        let stream = get_stream(&env, stream_id)?;
        Ok(unlocked_amount(&env, &stream))
    }

    /// Calculate the currently withdrawable amount for a stream.
    pub fn get_withdrawable_amount(env: Env, stream_id: u64) -> Result<i128, Error> {
        let stream = get_stream(&env, stream_id)?;
        Ok(withdrawable_amount(&env, &stream))
    }

    pub fn get_time_remaining_seconds(env: Env, stream_id: u64) -> Result<u64, Error> {
        let stream = get_stream(&env, stream_id)?;

        if stream.state == STATE_CLOSED {
            return Ok(0);
        }

        let current_time = env.ledger().timestamp();
        let mut effective_time = current_time;

        if stream.state == STATE_PAUSED {
            effective_time = stream.last_paused_at;
        }

        let adjusted_end = stream.end_time + stream.paused_duration;

        if effective_time >= adjusted_end {
            Ok(0)
        } else {
            Ok(adjusted_end - effective_time)
        }
    }

    pub fn get_time_remaining_days(env: Env, stream_id: u64) -> Result<u64, Error> {
        let seconds = Self::get_time_remaining_seconds(env.clone(), stream_id)?;
        Ok(seconds / 86400)
    }

    pub fn get_completion_percentage(env: Env, stream_id: u64) -> Result<u32, Error> {
        let stream = get_stream(&env, stream_id)?;

        let current_time = env.ledger().timestamp();
        let mut effective_time = current_time;

        if stream.state == STATE_PAUSED {
            effective_time = stream.last_paused_at;
        }

        let adjusted_end = stream.end_time + stream.paused_duration;

        if effective_time >= adjusted_end || stream.state == STATE_CLOSED {
            return Ok(10000);
        }

        if effective_time <= stream.start_time {
            return Ok(0);
        }

        let elapsed = effective_time - stream.start_time;
        let total_duration = adjusted_end - stream.start_time;

        if total_duration == 0 {
            return Ok(10000);
        }

        let percentage = (elapsed as u128 * 10000) / (total_duration as u128);
        Ok(percentage as u32)
    }

    /// Return the list of stream ids associated with a user (as sender or receiver).
    pub fn get_user_streams(env: Env, user: Address) -> Vec<u64> {
        get_user_streams(&env, &user)
    }

    // ------------------------- Monitoring -------------------------

    /// Point-in-time health of the contract.
    ///
    /// Read-only, and O(1) apart from copying the per-token TVL map: every
    /// field is a counter maintained as streams change rather than something
    /// derived by scanning stream state, so this is safe to poll on a short
    /// interval. See `METRICS.md` for the exporter that scrapes it.
    pub fn health_check(env: Env) -> ContractHealth {
        ContractHealth {
            is_paused: is_contract_paused(&env),
            active_streams: env.storage().instance().get(&DataKey::ActiveStreams).unwrap_or(0),
            total_tvl: get_tvl(&env),
            last_activity_time: env.storage().instance().get(&DataKey::LastActivity).unwrap_or(0),
            version: CONTRACT_VERSION,
        }
    }

    /// Rolling 24-hour usage statistics.
    ///
    /// Read-only. Sums at most [`METRICS_WINDOW_HOURS`] hourly buckets, so cost
    /// is bounded by the width of the window and not by how many streams or
    /// users exist. Averages are over streams *created* in the window and are
    /// zero when the window is empty.
    ///
    /// `unique_users_24h` is capped at [`MAX_TRACKED_USERS`]: once that many
    /// distinct addresses are active within a window the count saturates rather
    /// than growing without bound. Treat it as "at least this many".
    pub fn get_metrics(env: Env) -> ContractMetrics {
        let cutoff = window_start_hour(&env);
        let buckets = get_buckets(&env);

        let mut streams_created_24h: u64 = 0;
        let mut withdrawals_24h: u64 = 0;
        let mut duration_sum: u64 = 0;
        let mut amount_sum: i128 = 0;

        for (hour, bucket) in buckets.iter() {
            if hour < cutoff {
                continue;
            }
            streams_created_24h = streams_created_24h.saturating_add(bucket.streams_created);
            withdrawals_24h = withdrawals_24h.saturating_add(bucket.withdrawals);
            duration_sum = duration_sum.saturating_add(bucket.duration_sum);
            amount_sum = amount_sum.saturating_add(bucket.amount_sum);
        }

        let (avg_stream_duration, avg_stream_amount) = if streams_created_24h == 0 {
            (0, 0)
        } else {
            (
                duration_sum / streams_created_24h,
                amount_sum / streams_created_24h as i128,
            )
        };

        let mut unique_users_24h: u64 = 0;
        for (_, last_seen) in get_user_seen(&env).iter() {
            if last_seen >= cutoff {
                unique_users_24h += 1;
            }
        }

        ContractMetrics {
            streams_created_24h,
            withdrawals_24h,
            avg_stream_duration,
            avg_stream_amount,
            unique_users_24h,
        }
    }

    // ------------------------- Protocol fee -------------------------

    /// Set the protocol fee charged on stream creation, in basis points.
    ///
    /// Requires the caller to hold [`ROLE_TREASURY`] or [`ROLE_ADMIN`]. The fee
    /// is capped at [`MAX_FEE_BPS`] (1_000 bps = 10%); anything above that is
    /// rejected with [`Error::FeeTooHigh`] so an out-of-range rate can never
    /// reach `create_stream`. Passing `0` disables fee collection entirely.
    pub fn set_protocol_fee(
        env: Env,
        treasury_manager: Address,
        fee_bps: u32,
    ) -> Result<(), Error> {
        treasury_manager.require_auth();
        extend_instance_ttl(&env);
        require_treasury_manager(&env, &treasury_manager)?;
        if fee_bps > MAX_FEE_BPS {
            return Err(Error::FeeTooHigh);
        }
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.events()
            .publish((symbol_short!("set_fee"), treasury_manager), fee_bps);
        Ok(())
    }

    /// Set the address protocol fees are paid to.
    ///
    /// Requires the caller to hold [`ROLE_TREASURY`] or [`ROLE_ADMIN`]. While no
    /// treasury is set, any non-zero fee makes `create_stream` fail with
    /// [`Error::TreasuryNotSet`] rather than silently skipping collection.
    pub fn set_treasury_address(
        env: Env,
        treasury_manager: Address,
        new_treasury: Address,
    ) -> Result<(), Error> {
        treasury_manager.require_auth();
        extend_instance_ttl(&env);
        require_treasury_manager(&env, &treasury_manager)?;
        env.storage().instance().set(&DataKey::Treasury, &new_treasury);
        env.events()
            .publish((symbol_short!("set_treas"), treasury_manager), new_treasury);
        Ok(())
    }

    /// Current protocol fee in basis points (`0` when no fee is configured).
    pub fn get_protocol_fee(env: Env) -> u32 {
        fee_bps(&env)
    }

    /// Current treasury address, or `None` if one has never been set.
    pub fn get_treasury_address(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Treasury)
    }

    /// Fee that `create_stream` would charge on top of `amount`.
    ///
    /// Lets a caller work out the total it must be able to cover
    /// (`amount + fee`) before committing to a stream.
    pub fn calculate_protocol_fee(env: Env, amount: i128) -> Result<i128, Error> {
        protocol_fee_for(&env, amount)
    }

    // ------------------------- Administrative -------------------------

    pub fn grant_role(env: Env, admin: Address, account: Address, role: u32) -> Result<(), Error> {
        admin.require_auth();
        extend_instance_ttl(&env);
        require_admin(&env, &admin)?;
        if role > ROLE_TREASURY {
            return Err(Error::InvalidRole);
        }
        grant_role_internal(env, &account, role);
        Ok(())
    }

    pub fn revoke_role(env: Env, admin: Address, account: Address, role: u32) -> Result<(), Error> {
        admin.require_auth();
        extend_instance_ttl(&env);
        require_admin(&env, &admin)?;
        revoke_role_internal(&env, &account, role);
        Ok(())
    }

    pub fn restrict_address(env: Env, admin: Address, target: Address) -> Result<(), Error> {
        admin.require_auth();
        extend_instance_ttl(&env);
        require_admin(&env, &admin)?;
        compliance::restrict_address(&env, &target);
        Ok(())
    }

    pub fn unrestrict_address(env: Env, admin: Address, target: Address) -> Result<(), Error> {
        admin.require_auth();
        extend_instance_ttl(&env);
        require_admin(&env, &admin)?;
        compliance::unrestrict_address(&env, &target);
        Ok(())
    }

    pub fn pause_contract(env: Env, pauser: Address) -> Result<(), Error> {
        pauser.require_auth();
        extend_instance_ttl(&env);
        require_role(&env, &pauser, ROLE_PAUSER)?;
        env.storage().instance().set(&DataKey::ContractPaused, &true);
        Ok(())
    }

    pub fn unpause_contract(env: Env, pauser: Address) -> Result<(), Error> {
        pauser.require_auth();
        extend_instance_ttl(&env);
        require_role(&env, &pauser, ROLE_PAUSER)?;
        env.storage().instance().set(&DataKey::ContractPaused, &false);
        Ok(())
    }

    pub fn is_address_restricted(env: Env, target: Address) -> bool {
        is_restricted(&env, &target)
    }

    /// Withdraw from multiple streams atomically. All-or-nothing semantics. (issue #1472)
    pub fn batch_withdraw(
        env: Env,
        stream_ids: Vec<u64>,
        receiver: Address,
    ) -> Result<Vec<i128>, Error> {
        receiver.require_auth();
        extend_instance_ttl(&env);
        if stream_ids.len() > 20 { return Err(Error::BatchSizeExceeded); }
        if stream_ids.is_empty() { return Err(Error::InvalidAmount); }

        let mut amounts: Vec<i128> = Vec::new(&env);
        let mut total: i128 = 0;
        for i in 0..stream_ids.len() {
            let sid = stream_ids.get(i).unwrap();
            let stream = get_stream(&env, sid)?;
            if stream.receiver != receiver { return Err(Error::Unauthorized); }
            if stream.state == STATE_CLOSED { return Err(Error::AlreadyCancelled); }
            if stream.state == STATE_PAUSED { return Err(Error::StreamPaused); }
            let unlocked = unlocked_amount(&env, &stream);
            let w = unlocked - stream.withdrawn_amount;
            if w > 0 { amounts.push_back(w); total += w; } else { amounts.push_back(0); }
        }
        if total <= 0 { return Err(Error::InsufficientBalance); }

        for i in 0..stream_ids.len() {
            let amt = amounts.get(i).unwrap();
            if amt > 0 {
                let sid = stream_ids.get(i).unwrap();
                let mut stream = get_stream(&env, sid)?;
                stream.withdrawn_amount += amt;
                save_stream(&env, &stream);
                record_withdrawal(&env, &receiver, &stream.token, amt);
                TokenClient::new(&env, &stream.token).transfer(&stream.sender, &receiver, &amt);
            }
        }
        Ok(amounts)
    }

    /// Update the metadata for a stream. Only the sender may update metadata.
    pub fn update_stream_metadata(
        env: Env,
        stream_id: u64,
        sender: Address,
        label: String,
        tags: Vec<String>,
        external_ref: Option<String>,
    ) -> Result<(), Error> {
        sender.require_auth();
        extend_instance_ttl(&env);
        let stream = get_stream(&env, stream_id)?;
        if stream.sender != sender { return Err(Error::Unauthorized); }
        if stream.state == STATE_CLOSED { return Err(Error::StreamEnded); }
        if label.len() > 64 { return Err(Error::MetadataLabelTooLong); }
        if tags.len() > 5 { return Err(Error::TooManyTags); }
        for i in 0..tags.len() {
            if let Some(tag) = tags.get(i) {
                if tag.len() > 32 { return Err(Error::TagTooLong); }
            }
        }
        env.storage().persistent().set(
            &DataKey::StreamMetadata(stream_id),
            &StreamMetadata {
                label,
                tags,
                external_ref,
            },
        );
        extend_metadata_ttl(&env, stream_id);
        env.events().publish(
            (symbol_short!("meta_upd"), sender.clone()),
            StreamMetadataUpdatedEvent { stream_id, sender, timestamp: env.ledger().timestamp() },
        );
        Ok(())
    }

    /// Return the metadata attached to a stream, if any has been set.
    pub fn get_stream_metadata(env: Env, stream_id: u64) -> Option<StreamMetadata> {
        let key = DataKey::StreamMetadata(stream_id);
        let metadata = env.storage().persistent().get::<_, StreamMetadata>(&key);
        if metadata.is_some() {
            extend_metadata_ttl(&env, stream_id);
        }
        metadata
    }

    /// Return the next stream id that will be allocated (for testing/inspection).
    pub fn next_stream_id(env: Env) -> u64 {
        env.storage()
            .instance()
            .get::<_, u64>(&DataKey::StreamCounter)
            .unwrap_or(1)
    }

    // ------------------------- History Queries -------------------------

    pub fn get_stream_history(env: Env, stream_id: u64) -> Vec<StreamEvent> {
        let key = DataKey::StreamHistory(stream_id);
        let history = env.storage().persistent().get::<_, Vec<StreamEvent>>(&key);
        if history.is_some() {
            extend_history_ttl(&env, stream_id);
        }
        history.unwrap_or(Vec::new(&env))
    }

    // ------------------------- Count Queries -------------------------

    pub fn get_active_streams_count(env: Env) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_ACTIVE {
                count += 1;
            }
        }
        count
    }

    pub fn get_user_active_streams_count(env: Env, user: Address) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_ACTIVE && (stream.sender == user || stream.receiver == user) {
                count += 1;
            }
        }
        count
    }

    pub fn get_total_streams_count(env: Env) -> u64 {
        let next_id = env
            .storage()
            .instance()
            .get::<_, u64>(&DataKey::StreamCounter)
            .unwrap_or(1);
        next_id - 1
    }

    pub fn get_user_total_streams_count(env: Env, user: Address) -> u64 {
        get_user_streams(&env, &user).len() as u64
    }

    pub fn get_paused_streams_count(env: Env) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_PAUSED {
                count += 1;
            }
        }
        count
    }

    pub fn get_user_paused_streams_count(env: Env, user: Address) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_PAUSED && (stream.sender == user || stream.receiver == user) {
                count += 1;
            }
        }
        count
    }

    pub fn get_closed_streams_count(env: Env) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_CLOSED {
                count += 1;
            }
        }
        count
    }

    pub fn get_user_closed_streams_count(env: Env, user: Address) -> u64 {
        let streams = get_streams(&env);
        let mut count = 0u64;
        for (_, stream) in streams.iter() {
            if stream.state == STATE_CLOSED && (stream.sender == user || stream.receiver == user) {
                count += 1;
            }
        }
        count
    }

    // ===== Clawback entry points =====

    /// Request the return of `amount` tokens already withdrawn from stream `stream_id`.
    ///
    /// The stream must have been created with `clawback_enabled = true`.
    /// `amount` must be > 0 and ≤ `stream.withdrawn_amount`.
    /// Only the stream's sender may call this.
    pub fn request_clawback(
        env: Env,
        stream_id: u64,
        sender: Address,
        amount: i128,
        reason: String,
        required_approvals: u32,
        expires_at: u64,
    ) -> Result<u64, Error> {
        sender.require_auth();
        extend_instance_ttl(&env);
        clawback::request_clawback(&env, stream_id, &sender, amount, reason, required_approvals, expires_at)
    }

    /// Approve a pending clawback request.
    ///
    /// The receiver's approval immediately satisfies the condition.
    /// Any other address counts as a governance approver toward `required_approvals`.
    pub fn approve_clawback(
        env: Env,
        clawback_id: u64,
        approver: Address,
    ) -> Result<(), Error> {
        approver.require_auth();
        extend_instance_ttl(&env);
        clawback::approve_clawback(&env, clawback_id, &approver)
    }

    /// Execute an approved clawback, transferring tokens from receiver back to sender.
    ///
    /// May be called by anyone once the request is in `Approved` status.
    pub fn execute_clawback(
        env: Env,
        clawback_id: u64,
        executor: Address,
    ) -> Result<(), Error> {
        executor.require_auth();
        extend_instance_ttl(&env);
        clawback::execute_clawback(&env, clawback_id)
    }

    /// Fetch a clawback request by ID. Returns `None` if it does not exist.
    pub fn get_clawback_request(env: Env, clawback_id: u64) -> Option<ClawbackRequest> {
        clawback::get_clawback_request(&env, clawback_id)
    }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
fn withdraw_inner(env: &Env, stream_id: u64, receiver: &Address) -> Result<i128, Error> {
    let mut stream = get_stream(env, stream_id)?;
    if stream.state == STATE_CLOSED {
        return Err(Error::AlreadyCancelled);
    }
    if stream.state == STATE_PAUSED {
        return Err(Error::StreamPaused);
    }
    if &stream.receiver != receiver {
        return Err(Error::Unauthorized);
    }
    // OFAC compliance: block withdrawals to restricted receivers.
    compliance::require_not_restricted(env, receiver);

    let withdrawable = withdrawable_amount(env, &stream);
    if withdrawable <= 0 {
        return Ok(0);
    }

    // Checks-effects-interactions: mutate state BEFORE any external call so a
    // re-entrant token callback cannot double-spend.
    stream.withdrawn_amount = stream
        .withdrawn_amount
        .checked_add(withdrawable)
        .ok_or(Error::Overflow)?;
    save_stream(env, &stream);
    record_withdrawal(env, receiver, &stream.token, withdrawable);

    // External token transfer (best-effort; a malicious token cannot double-spend
    // because state above is already committed).
    TokenClient::new(env, &stream.token).transfer(&stream.sender, receiver, &withdrawable);

    // Record history event
    add_history(env, stream_id, StreamAction::Withdrawn(withdrawable));

    Ok(withdrawable)
}

fn unlocked_amount(env: &Env, stream: &Stream) -> i128 {
    let now = env.ledger().timestamp();
    if now <= stream.start_time {
        return 0;
    }
    let dur = stream.end_time - stream.start_time;
    let mut elapsed = now - stream.start_time;
    if elapsed > stream.paused_duration {
        elapsed -= stream.paused_duration;
    } else {
        elapsed = 0;
    }
    if elapsed >= dur || now >= stream.end_time {
        return stream.total_amount;
    }
    if stream.total_amount == 0 {
        return 0;
    }
    let unlocked = match stream.curve_type {
        CURVE_LINEAR => {
            let prod = (elapsed as i128).checked_mul(stream.total_amount);
            match prod {
                Some(p) => p / (dur as i128),
                None => return 0,
            }
        }
        CURVE_EXP => {
            let e = elapsed as i128;
            let d = dur as i128;
            // quadratic: total * elapsed^2 / dur^2
            let num = e.checked_mul(e).and_then(|v| v.checked_mul(stream.total_amount));
            let den = d.checked_mul(d);
            match (num, den) {
                (Some(n), Some(den)) if den != 0 => n / den,
                _ => 0,
            }
        }
        CURVE_MILESTONE => match &stream.milestones {
            // Milestones are keyed to absolute ledger timestamps, not
            // pause-adjusted elapsed time, so `now` is passed directly.
            Some(milestones) => {
                math::calculate_unlocked_milestone(stream.total_amount, now, milestones)
            }
            None => 0,
        },
        _ => 0,
    };
    if unlocked < 0 {
        0
    } else {
        unlocked
    }
}

fn withdrawable_amount(env: &Env, stream: &Stream) -> i128 {
    let unlocked = unlocked_amount(env, stream);
    let w = unlocked - stream.withdrawn_amount;
    if w < 0 {
        0
    } else {
        w
    }
}

/// Reconstruct the full stream map by reading every allocated stream id.
///
/// Used by the bulk count queries; targeted access should prefer
/// [`get_stream`] / [`save_stream`], which read or write a single entry and
/// extend that entry's TTL.
fn get_streams(env: &Env) -> Map<u64, Stream> {
    let mut streams = Map::new(env);
    let next = env
        .storage()
        .instance()
        .get::<_, u64>(&DataKey::StreamCounter)
        .unwrap_or(1);
    for id in 1..next {
        if let Some(stream) = env
            .storage()
            .persistent()
            .get::<_, Stream>(&DataKey::Stream(id))
        {
            streams.set(id, stream);
        }
    }
    streams
}

fn get_stream(env: &Env, stream_id: u64) -> Result<Stream, Error> {
    let key = DataKey::Stream(stream_id);
    let stream = env
        .storage()
        .persistent()
        .get::<_, Stream>(&key)
        .ok_or(Error::StreamNotFound)?;
    // Long-term data: keep the entry alive whenever it is accessed.
    extend_stream_ttl(env, stream_id);
    Ok(stream)
}

fn save_stream(env: &Env, stream: &Stream) {
    env.storage()
        .persistent()
        .set(&DataKey::Stream(stream.id), stream);
    extend_stream_ttl(env, stream.id);
}

/// Shared stream-creation path used both by `create_stream` (single-signature)
/// and by `approve_proposal` (multi-signature auto-execution). Does not require
/// the sender's auth because proposal execution is authorized by the approvals.
fn create_stream_internal(
    env: &Env,
    sender: &Address,
    receiver: &Address,
    token: &Address,
    total_amount: i128,
    start_time: u64,
    end_time: u64,
    curve_type: u32,
    is_soulbound: bool,
    clawback_enabled: bool,
    milestones: Option<Vec<Milestone>>,
) -> Result<u64, Error> {
    if is_contract_paused(env) {
        return Err(Error::ContractPaused);
    }
    if env.storage().instance().get::<_, Address>(&DataKey::Admin).is_none() {
        return Err(Error::Unauthorized);
    }
    if curve_type != CURVE_LINEAR && curve_type != CURVE_EXP && curve_type != CURVE_MILESTONE {
        return Err(Error::InvalidCurve);
    }
    if total_amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    if start_time >= end_time {
        return Err(Error::InvalidTimeRange);
    }
    if is_restricted(env, sender) || is_restricted(env, receiver) {
        return Err(Error::AddressRestricted);
    }
    if curve_type == CURVE_MILESTONE {
        validate_milestones(&milestones, end_time)?;
    } else if milestones.is_some() {
        return Err(Error::InvalidMilestones);
    }

    let mut next = env
        .storage()
        .instance()
        .get::<_, u64>(&DataKey::StreamCounter)
        .unwrap_or(1);
    let id = next;
    next = next.checked_add(1).ok_or(Error::Overflow)?;

    let stream = Stream {
        id,
        sender: sender.clone(),
        receiver: receiver.clone(),
        token: token.clone(),
        total_amount,
        start_time,
        end_time,
        withdrawn_amount: 0,
        state: STATE_ACTIVE,
        curve_type,
        is_soulbound,
        paused_duration: 0,
        last_paused_at: 0,
        milestones,
        clawback_enabled,
    };

    env.storage().persistent().set(&DataKey::Stream(id), &stream);
    extend_stream_ttl(env, id);

    record_stream_created(env, &stream);

    add_user_stream(env, sender, id);
    add_user_stream(env, receiver, id);

    env.storage().instance().set(&DataKey::StreamCounter, &next);

    // Record the stream's creation in its history.
    add_history(env, id, StreamAction::Created);
    Ok(id)
}

/// Validates a milestone-vesting schedule before it is attached to a stream.
///
/// Requires: a non-empty schedule, strictly ascending timestamps, strictly
/// ascending cumulative percentages, a final percentage of exactly
/// `math::BPS_DENOMINATOR` (10,000 bps = 100%), and a last-milestone timestamp
/// no later than the stream's `end_time` (otherwise the stream's end-of-term
/// fast path in `unlocked_amount` could release 100% before the schedule says
/// it should).
fn validate_milestones(milestones: &Option<Vec<Milestone>>, end_time: u64) -> Result<(), Error> {
    let milestones = milestones.as_ref().ok_or(Error::InvalidMilestones)?;
    if milestones.is_empty() {
        return Err(Error::InvalidMilestones);
    }

    let mut prev_timestamp: Option<u64> = None;
    let mut prev_percentage: u32 = 0;
    for i in 0..milestones.len() {
        let m = milestones.get(i).unwrap();
        if let Some(prev) = prev_timestamp {
            if m.timestamp <= prev {
                return Err(Error::InvalidMilestones);
            }
        }
        if m.percentage <= prev_percentage {
            return Err(Error::InvalidMilestonePercentages);
        }
        prev_timestamp = Some(m.timestamp);
        prev_percentage = m.percentage;
    }

    if prev_percentage as i128 != math::BPS_DENOMINATOR {
        return Err(Error::InvalidMilestonePercentages);
    }
    if prev_timestamp.unwrap() > end_time {
        return Err(Error::InvalidTimeRange);
    }

    Ok(())
}

fn get_proposal(env: &Env, proposal_id: u64) -> Result<StreamProposal, Error> {
    let key = DataKey::Proposal(proposal_id);
    let proposal = env
        .storage()
        .persistent()
        .get::<_, StreamProposal>(&key)
        .ok_or(Error::ProposalNotFound)?;
    extend_proposal_ttl(env, proposal_id);
    Ok(proposal)
}

fn save_proposal(env: &Env, proposal_id: u64, proposal: &StreamProposal) {
    env.storage()
        .persistent()
        .set(&DataKey::Proposal(proposal_id), proposal);
    extend_proposal_ttl(env, proposal_id);
}

fn get_user_streams(env: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserStreams(user.clone());
    let streams = env.storage().persistent().get::<_, Vec<u64>>(&key);
    if streams.is_some() {
        extend_user_streams_ttl(env, user);
    }
    streams.unwrap_or(Vec::new(env))
}

fn add_user_stream(env: &Env, user: &Address, id: u64) {
    let key = DataKey::UserStreams(user.clone());
    let mut list = env
        .storage()
        .persistent()
        .get::<_, Vec<u64>>(&key)
        .unwrap_or(Vec::new(env));
    list.push_back(id);
    env.storage().persistent().set(&key, &list);
    extend_user_streams_ttl(env, user);
}

// ---------------------------------------------------------------------------
// Monitoring bookkeeping
//
// Counters are maintained as operations happen so that `health_check` and
// `get_metrics` stay read-only and cheap. The alternative -- deriving them by
// scanning stream state on read -- would make the read cost grow with the size
// of the contract, which is exactly what a frequently polled health endpoint
// must not do.
// ---------------------------------------------------------------------------

/// The oldest hour still inside the rolling window.
fn window_start_hour(env: &Env) -> u64 {
    current_hour(env).saturating_sub(METRICS_WINDOW_HOURS - 1)
}

fn current_hour(env: &Env) -> u64 {
    env.ledger().timestamp() / SECONDS_PER_HOUR
}

fn get_buckets(env: &Env) -> Map<u64, MetricBucket> {
    let buckets = env
        .storage()
        .persistent()
        .get::<_, Map<u64, MetricBucket>>(&DataKey::MetricBuckets);
    if buckets.is_some() {
        bump_persistent_ttl_if_present(env, &DataKey::MetricBuckets);
    }
    buckets.unwrap_or(Map::new(env))
}

fn get_user_seen(env: &Env) -> Map<Address, u64> {
    let seen = env
        .storage()
        .persistent()
        .get::<_, Map<Address, u64>>(&DataKey::UserSeen);
    if seen.is_some() {
        bump_persistent_ttl_if_present(env, &DataKey::UserSeen);
    }
    seen.unwrap_or(Map::new(env))
}

fn get_tvl(env: &Env) -> Map<Address, i128> {
    env.storage()
        .instance()
        .get(&DataKey::TotalTvl)
        .unwrap_or(Map::new(env))
}

/// Record that something happened, and fold `user` into the 24h active set.
fn touch_activity(env: &Env, user: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::LastActivity, &env.ledger().timestamp());
    prune_window(env);

    let hour = current_hour(env);
    let mut seen = get_user_seen(env);
    // Refreshing an address already tracked is always allowed; only admitting a
    // new one is capped, so a busy contract keeps reporting its regulars.
    if seen.get(user.clone()).is_some() || seen.len() < MAX_TRACKED_USERS {
        seen.set(user.clone(), hour);
        env.storage().persistent().set(&DataKey::UserSeen, &seen);
        bump_persistent_ttl_if_present(env, &DataKey::UserSeen);
    }
}

/// Drop buckets and address entries that have fallen out of the window.
///
/// Runs at most once per hour: the scan is bounded, but there is no reason to
/// repeat it on every operation within the same hour.
fn prune_window(env: &Env) {
    let hour = current_hour(env);
    let last_prune: Option<u64> = env.storage().instance().get(&DataKey::LastPrune);
    if last_prune == Some(hour) {
        return;
    }
    env.storage().instance().set(&DataKey::LastPrune, &hour);

    let cutoff = window_start_hour(env);

    let buckets = get_buckets(env);
    let mut fresh_buckets = Map::new(env);
    for (bucket_hour, bucket) in buckets.iter() {
        if bucket_hour >= cutoff {
            fresh_buckets.set(bucket_hour, bucket);
        }
    }
    env.storage().persistent().set(&DataKey::MetricBuckets, &fresh_buckets);
    bump_persistent_ttl_if_present(env, &DataKey::MetricBuckets);

    let seen = get_user_seen(env);
    let mut fresh_seen = Map::new(env);
    for (address, last_seen) in seen.iter() {
        if last_seen >= cutoff {
            fresh_seen.set(address, last_seen);
        }
    }
    env.storage().persistent().set(&DataKey::UserSeen, &fresh_seen);
    bump_persistent_ttl_if_present(env, &DataKey::UserSeen);
}

fn with_current_bucket(env: &Env, update: impl FnOnce(&mut MetricBucket)) {
    let hour = current_hour(env);
    let mut buckets = get_buckets(env);
    let mut bucket = buckets.get(hour).unwrap_or(MetricBucket {
        streams_created: 0,
        withdrawals: 0,
        duration_sum: 0,
        amount_sum: 0,
    });
    update(&mut bucket);
    buckets.set(hour, bucket);
    env.storage().persistent().set(&DataKey::MetricBuckets, &buckets);
    bump_persistent_ttl_if_present(env, &DataKey::MetricBuckets);
}

/// Fold a stream creation into the counters.
fn record_stream_created(env: &Env, stream: &Stream) {
    touch_activity(env, &stream.sender);

    let active: u64 = env.storage().instance().get(&DataKey::ActiveStreams).unwrap_or(0);
    env.storage()
        .instance()
        .set(&DataKey::ActiveStreams, &active.saturating_add(1));

    adjust_tvl(env, &stream.token, stream.total_amount);

    let duration = stream.end_time.saturating_sub(stream.start_time);
    let amount = stream.total_amount;
    with_current_bucket(env, |bucket| {
        bucket.streams_created = bucket.streams_created.saturating_add(1);
        bucket.duration_sum = bucket.duration_sum.saturating_add(duration);
        bucket.amount_sum = bucket.amount_sum.saturating_add(amount);
    });
}

/// Fold a withdrawal into the counters. `amount` leaves the locked total.
fn record_withdrawal(env: &Env, receiver: &Address, token: &Address, amount: i128) {
    touch_activity(env, receiver);
    adjust_tvl(env, token, -amount);
    with_current_bucket(env, |bucket| {
        bucket.withdrawals = bucket.withdrawals.saturating_add(1);
    });
}

/// Fold a cancellation into the counters. The unwithdrawn remainder is released.
fn record_stream_closed(env: &Env, stream: &Stream) {
    touch_activity(env, &stream.sender);

    let active: u64 = env.storage().instance().get(&DataKey::ActiveStreams).unwrap_or(0);
    env.storage()
        .instance()
        .set(&DataKey::ActiveStreams, &active.saturating_sub(1));

    let remaining = stream.total_amount.saturating_sub(stream.withdrawn_amount);
    adjust_tvl(env, &stream.token, -remaining);
}

/// Move the locked total for `token` by `delta`, clamping at zero.
fn adjust_tvl(env: &Env, token: &Address, delta: i128) {
    let mut tvl = get_tvl(env);
    let current = tvl.get(token.clone()).unwrap_or(0);
    let next = current.saturating_add(delta);
    tvl.set(token.clone(), if next < 0 { 0 } else { next });
    env.storage().instance().set(&DataKey::TotalTvl, &tvl);
}

/// Protocol fee rate in basis points; `0` when unset.
fn fee_bps(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0)
}

/// Fee owed on `amount` at the current rate, rounded down.
///
/// The multiplication is checked so that a very large `amount` reports
/// [`Error::Overflow`] instead of wrapping into a nonsensical fee.
fn protocol_fee_for(env: &Env, amount: i128) -> Result<i128, Error> {
    let bps = fee_bps(env);
    if bps == 0 || amount <= 0 {
        return Ok(0);
    }
    amount
        .checked_mul(bps as i128)
        .map(|scaled| scaled / BPS_DENOMINATOR)
        .ok_or(Error::Overflow)
}

/// Transfer the protocol fee for `amount` from `sender` to the treasury.
///
/// Returns the fee charged. A zero fee short-circuits without touching the
/// token contract, so a zero-fee protocol costs nothing extra to run.
fn collect_protocol_fee(
    env: &Env,
    sender: &Address,
    token: &Address,
    stream_id: u64,
    amount: i128,
) -> Result<i128, Error> {
    let fee = protocol_fee_for(env, amount)?;
    if fee == 0 {
        return Ok(0);
    }
    let treasury = env
        .storage()
        .instance()
        .get::<_, Address>(&DataKey::Treasury)
        .ok_or(Error::TreasuryNotSet)?;

    TokenClient::new(env, token).transfer(sender, &treasury, &fee);

    env.events().publish(
        (symbol_short!("fee"), sender.clone()),
        ProtocolFeeCollectedEvent {
            stream_id,
            payer: sender.clone(),
            treasury,
            token: token.clone(),
            fee_amount: fee,
            fee_bps: fee_bps(env),
        },
    );
    Ok(fee)
}

/// Fee settings may be changed by a treasury manager or by an admin.
fn require_treasury_manager(env: &Env, account: &Address) -> Result<(), Error> {
    if has_role(env, account, ROLE_TREASURY) || has_role(env, account, ROLE_ADMIN) {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn is_contract_paused(env: &Env) -> bool {
    env.storage().instance().get(&DataKey::ContractPaused).unwrap_or(false)
}

fn add_history(env: &Env, stream_id: u64, action: StreamAction) {
    let key = DataKey::StreamHistory(stream_id);
    let mut events = env
        .storage()
        .persistent()
        .get::<_, Vec<StreamEvent>>(&key)
        .unwrap_or(Vec::new(env));
    events.push_back(StreamEvent {
        stream_id,
        action,
        timestamp: env.ledger().timestamp(),
    });
    env.storage().persistent().set(&key, &events);
    extend_history_ttl(env, stream_id);
}

fn is_restricted(env: &Env, target: &Address) -> bool {
    compliance::is_restricted(env, target)
}

fn get_restricted(env: &Env) -> soroban_sdk::Map<Address, bool> {
    compliance::load_restricted(env)
}

fn require_admin(env: &Env, account: &Address) -> Result<(), Error> {
    require_role(env, account, ROLE_ADMIN)
}

fn require_role(env: &Env, account: &Address, role: u32) -> Result<(), Error> {
    if !has_role(env, account, role) {
        return Err(if role == ROLE_ADMIN {
            Error::NotAdmin
        } else {
            Error::NotPauser
        });
    }
    Ok(())
}

fn has_role(env: &Env, account: &Address, role: u32) -> bool {
    let roles: Map<Address, Vec<u32>> = env
        .storage()
        .instance()
        .get(&DataKey::Roles)
        .unwrap_or(Map::new(env));
    roles
        .get(account.clone())
        .map(|v| v.contains(role))
        .unwrap_or(false)
}

fn grant_role_internal(env: Env, account: &Address, role: u32) {
    let mut roles: Map<Address, Vec<u32>> = env
        .storage()
        .instance()
        .get(&DataKey::Roles)
        .unwrap_or(Map::new(&env));
    let mut list = roles.get(account.clone()).unwrap_or(Vec::new(&env));
    if !list.contains(role) {
        list.push_back(role);
    }
    roles.set(account.clone(), list);
    env.storage().instance().set(&DataKey::Roles, &roles);
}

fn revoke_role_internal(env: &Env, account: &Address, role: u32) {
    let mut roles: Map<Address, Vec<u32>> = env
        .storage()
        .instance()
        .get(&DataKey::Roles)
        .unwrap_or(Map::new(env));
    if let Some(list) = roles.get(account.clone()) {
        let mut out = Vec::new(env);
        let len = list.len();
        for i in 0..len {
            if let Some(r) = list.get(i) {
                if r != role {
                    out.push_back(r);
                }
            }
        }
        roles.set(account.clone(), out);
        env.storage().instance().set(&DataKey::Roles, &roles);
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
#[cfg(test)]
mod common;

#[cfg(test)]
mod test;

#[cfg(test)]
mod stress_test;

#[cfg(test)]
mod security_test;

#[cfg(test)]
mod metrics_test;

#[cfg(test)]
mod fee_test;

#[cfg(test)]
mod flash_loan_test;
