use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum DataKey {
    Admin,
    QuorumAdmins,
    NextProposalId,
    Token,
    FeeBps,
    Treasury,
    StrictMode,
    VerifiedUsers(Address),
    Proposal(u64),
    NextSplitId,
    ScheduledSplit(u64),
    ClaimableBalance(Address, Address),
    CouncilKeys,
    // #924: migration version to prevent re-running migration logic
    MigrationVersion,
    // #927: whitelist map and flag
    Whitelisted(Address),
    WhitelistOnly,
}
