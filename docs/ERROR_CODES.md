# StellarStream Error Code Reference

This document maps each contract error code to a human-readable explanation for the frontend team.

## Error Enum

All errors are returned as unique `u32` codes via the `#[contracterror]` enum.

| Code | Variant | Human-Readable Message | When It Occurs |
|------|---------|----------------------|----------------|
| 1 | `AlreadyInitialized` | Contract is already initialized | Calling `initialize()` more than once |
| 2 | `InvalidTimeRange` | Invalid time range provided | `start_time >= end_time` or invalid duration |
| 3 | `InvalidAmount` | Invalid amount specified | Amount is zero or negative |
| 4 | `StreamNotFound` | Stream not found | Querying a stream ID that doesn't exist |
| 5 | `Unauthorized` | Unauthorized — insufficient permissions | Caller lacks required role (e.g. Admin) |
| 6 | `AlreadyCancelled` | Stream has already been cancelled | Trying to cancel or withdraw from a cancelled stream |
| 7 | `InsufficientBalance` | Insufficient balance | Not enough tokens to fund the stream |
| 8 | `ProposalNotFound` | Proposal not found | Querying a proposal ID that doesn't exist |
| 9 | `ProposalExpired` | Proposal has expired | Approving or executing a proposal past its deadline |
| 10 | `AlreadyApproved` | Already approved | Signer has already approved this proposal |
| 11 | `ProposalAlreadyExecuted` | Proposal already executed | Trying to execute an already-executed proposal |
| 12 | `InvalidApprovalThreshold` | Invalid approval threshold | Threshold is zero or exceeds number of approvers |
| 13 | `NotReceiptOwner` | Not the receipt owner | Caller does not own the stream receipt NFT |
| 14 | `StreamPaused` | Stream is paused | Trying to withdraw from a paused stream |
| 15 | `OracleStalePrice` | Oracle price is stale | Price data is older than `max_staleness` seconds |
| 16 | `OracleFailed` | Oracle call failed | Could not fetch price from oracle |
| 17 | `PriceOutOfBounds` | Price out of acceptable bounds | Price is outside `min_price`/`max_price` range |
| 18 | `FlashLoanNotRepaid` | Flash loan not repaid | Flash loan amount not returned within same transaction |
| 19 | `FlashLoanInProgress` | Flash loan already in progress | Nested flash loan detected |
| 20 | `AlreadyExecuted` | Request already executed | Trying to execute an already approved/rejected contributor request |
