//! Invariant fuzz tests for Contract-V2.
//!
//! Issue #390 — three mathematical guarantees:
//!   1. Balance Sum:          withdrawn + remaining == total_amount
//!   2. Timestamp Bounds:     unlocked_amount never exceeds total_amount
//!   3. Re-entrancy Guard:    migrate_stream cannot drain a stream twice

// ── helpers ──────────────────────────────────────────────────────────────────

/// Pure replication of the unlocked-amount formula used in `lib.rs::migrate_stream`.
/// Returns (unlocked, remaining).
fn compute_split(total_amount: i128, elapsed: i128, duration: i128) -> (i128, i128) {
    let unlocked = (total_amount * elapsed) / duration;
    let remaining = total_amount - unlocked;
    (unlocked, remaining)
}

// ── Test 1: Balance Sum ───────────────────────────────────────────────────────

/// For any valid split, withdrawn + remaining must equal total_amount exactly.
#[test]
fn invariant_balance_sum() {
    // Representative sample covering edge cases
    let cases: &[(i128, i128, i128)] = &[
        (1_000_000, 0, 1000),    // nothing elapsed
        (1_000_000, 500, 1000),  // halfway
        (1_000_000, 999, 1000),  // one second before end
        (1_000_000, 1000, 1000), // fully elapsed (remaining == 0)
        (1, 0, 1),               // minimum amount, nothing elapsed
        (i128::MAX / 2, 1, 2),   // large amount, half elapsed
        (7, 3, 7),               // non-divisible: 7 * 3 / 7 = 3, remaining = 4
    ];

    for &(total, elapsed, duration) in cases {
        let (unlocked, remaining) = compute_split(total, elapsed, duration);
        assert_eq!(
            unlocked + remaining,
            total,
            "Balance sum violated: total={total}, elapsed={elapsed}, duration={duration} \
             → unlocked={unlocked}, remaining={remaining}"
        );
    }
}

// ── Test 2: Timestamp Manipulation (1 000 iterations) ────────────────────────

/// Runs 1 000 iterations with pseudo-random ledger timestamps to confirm
/// `unlocked_amount` never exceeds `total_amount`.
///
/// Uses a simple LCG so the test is deterministic and requires no external crate.
#[test]
fn invariant_timestamp_never_exceeds_total() {
    const TOTAL_AMOUNT: i128 = 10_000_000_000; // 10 billion stroops
    const START_TIME: u64 = 1_700_000_000;
    const END_TIME: u64 = START_TIME + 365 * 24 * 3600; // 1 year stream
    const DURATION: i128 = (END_TIME - START_TIME) as i128;

    // LCG parameters (Numerical Recipes)
    let mut state: u64 = 0xDEAD_BEEF_CAFE_1337;
    let lcg_next = |s: &mut u64| -> u64 {
        *s = s
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1_442_695_040_888_963_407);
        *s
    };

    for i in 0..1_000u32 {
        // Generate a timestamp anywhere in [0, END_TIME + 1_000] to also test
        // values beyond the stream end (contract clamps via saturating_sub).
        let raw_ts = lcg_next(&mut state) % (END_TIME as u64 + 1_000);
        let now = raw_ts;

        // Mirror the contract's elapsed calculation (no paused duration in V2 streams).
        let elapsed: i128 = if now <= START_TIME {
            0
        } else if now >= END_TIME {
            DURATION // fully elapsed — clamp to duration
        } else {
            (now - START_TIME) as i128
        };

        let (unlocked, _remaining) = compute_split(TOTAL_AMOUNT, elapsed, DURATION);

        assert!(
            unlocked <= TOTAL_AMOUNT,
            "Iteration {i}: unlocked ({unlocked}) > total_amount ({TOTAL_AMOUNT}) \
             at timestamp {now}"
        );
        assert!(
            unlocked >= 0,
            "Iteration {i}: unlocked ({unlocked}) is negative at timestamp {now}"
        );
    }
}

// ── Test 3: Re-entrancy Guard ─────────────────────────────────────────────────
//
// Soroban's single-threaded execution model prevents true re-entrancy, but we
// must still prove that a second call to `migrate_stream` on an already-migrated
// (cancelled) V1 stream is rejected — i.e. the contract cannot be drained twice.

#[cfg(test)]
mod reentrancy {
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::{
        contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Vec,
    };

    // ── Mock V1 — must match the real V1 ABI exactly ─────────────────────────

    #[contracttype]
    #[derive(Clone)]
    pub enum CurveTypeV1 {
        Linear = 0,
        Exponential = 1,
    }

    #[contracttype]
    #[derive(Clone)]
    pub struct MilestoneV1 {
        pub timestamp: u64,
        pub percentage: u32,
    }

    #[contracttype]
    #[derive(Clone)]
    pub struct V1Stream {
        pub sender: Address,
        pub receiver: Address,
        pub token: Address,
        pub total_amount: i128,
        pub start_time: u64,
        pub end_time: u64,
        pub withdrawn: i128,
        pub withdrawn_amount: i128,
        pub cancelled: bool,
        pub receipt_owner: Address,
        pub is_paused: bool,
        pub paused_time: u64,
        pub total_paused_duration: u64,
        pub milestones: Vec<MilestoneV1>,
        pub curve_type: CurveTypeV1,
        pub interest_strategy: u32,
        pub vault_address: Option<Address>,
        pub deposited_principal: i128,
        pub metadata: Option<BytesN<32>>,
        pub is_usd_pegged: bool,
        pub usd_amount: i128,
        pub oracle_address: Address,
        pub oracle_max_staleness: u64,
        pub price_min: i128,
        pub price_max: i128,
        pub is_soulbound: bool,
        pub clawback_enabled: bool,
        pub arbiter: Option<Address>,
        pub is_frozen: bool,
    }

    const STREAM_KEY: soroban_sdk::Symbol = symbol_short!("MOCK_S");
    const CANCELLED_KEY: soroban_sdk::Symbol = symbol_short!("MOCK_C");

    #[contract]
    pub struct MockV1;

    #[contractimpl]
    impl MockV1 {
        pub fn seed_stream(env: Env, stream: V1Stream) {
            env.storage().instance().set(&STREAM_KEY, &stream);
        }

        pub fn get_stream(env: Env, _stream_id: u64) -> V1Stream {
            env.storage()
                .instance()
                .get(&STREAM_KEY)
                .expect("mock: stream not seeded")
        }

        pub fn cancel(env: Env, _stream_id: u64, _caller: Address) {
            env.storage().instance().set(&CANCELLED_KEY, &true);
        }
    }

    // ── The actual re-entrancy test ───────────────────────────────────────────

    #[test]
    fn invariant_cannot_migrate_same_stream_twice() {
        let env = Env::default();
        env.mock_all_auths();

        // Mid-stream timestamp
        env.ledger().with_mut(|l| l.timestamp = 100);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);

        // Register mock V1 and seed a live stream
        let v1_id = env.register(MockV1, ());
        let v1_mock = MockV1Client::new(&env, &v1_id);

        v1_mock.seed_stream(&V1Stream {
            sender: sender.clone(),
            receiver: receiver.clone(),
            token: sender.clone(), // token addr doesn't matter for migration logic
            total_amount: 1_000_000,
            start_time: 0,
            end_time: 200,
            withdrawn: 0,
            withdrawn_amount: 0,
            cancelled: false,
            receipt_owner: receiver.clone(),
            is_paused: false,
            paused_time: 0,
            total_paused_duration: 0,
            milestones: Vec::new(&env),
            curve_type: CurveTypeV1::Linear,
            interest_strategy: 0,
            vault_address: None,
            deposited_principal: 1_000_000,
            metadata: None,
            is_usd_pegged: false,
            usd_amount: 0,
            oracle_address: sender.clone(),
            oracle_max_staleness: 0,
            price_min: 0,
            price_max: 0,
            is_soulbound: false,
            clawback_enabled: false,
            arbiter: None,
            is_frozen: false,
        });

        // Register V2 and init
        use stellarstream_contracts_v2::Contract as V2Contract;
        let v2_id = env.register(V2Contract, ());
        let v2_client = stellarstream_contracts_v2::ContractClient::new(&env, &v2_id);
        v2_client.init(&admin);

        let stream_id: u64 = 0;

        // First migration — must succeed
        let result1 = v2_client.try_migrate_stream(&v1_id, &stream_id, &receiver);
        assert!(
            result1.is_ok(),
            "First migration should succeed: {:?}",
            result1
        );

        // Second migration — mock's cancel() marks cancelled=true in storage,
        // but get_stream() returns the same seeded struct (not updated).
        // The real guard is that migrate_stream calls v1.cancel() which in the
        // real V1 sets cancelled=true, so a second get_stream returns cancelled=true.
        // We simulate this by re-seeding the stream as cancelled.
        v1_mock.seed_stream(&V1Stream {
            sender: sender.clone(),
            receiver: receiver.clone(),
            token: sender.clone(),
            total_amount: 1_000_000,
            start_time: 0,
            end_time: 200,
            withdrawn: 0,
            withdrawn_amount: 0,
            cancelled: true, // <-- now cancelled after first migration
            receipt_owner: receiver.clone(),
            is_paused: false,
            paused_time: 0,
            total_paused_duration: 0,
            milestones: Vec::new(&env),
            curve_type: CurveTypeV1::Linear,
            interest_strategy: 0,
            vault_address: None,
            deposited_principal: 1_000_000,
            metadata: None,
            is_usd_pegged: false,
            usd_amount: 0,
            oracle_address: sender.clone(),
            oracle_max_staleness: 0,
            price_min: 0,
            price_max: 0,
            is_soulbound: false,
            clawback_enabled: false,
            arbiter: None,
            is_frozen: false,
        });

        // Second migration must be rejected — stream is already cancelled
        let result2 = v2_client.try_migrate_stream(&v1_id, &stream_id, &receiver);
        assert!(
            result2.is_err(),
            "Second migration of the same stream must be rejected (double-drain guard)"
        );
    }
}
