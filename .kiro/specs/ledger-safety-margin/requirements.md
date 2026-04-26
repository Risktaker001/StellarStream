# Requirements Document

## Introduction

The Ledger Safety Margin feature prevents the Stellar blockchain indexer from indexing data that may be invalidated by chain reorganizations (rollbacks). By maintaining a configurable offset from the chain tip, the indexer avoids processing "ghost" transactions that could disappear during a reorganization event.

## Glossary

- **Indexer**: The system component that polls the Stellar blockchain and stores event data
- **RPC**: Remote Procedure Call interface to the Stellar blockchain network
- **Ledger**: A single block in the Stellar blockchain containing transactions and events
- **Chain_Tip**: The most recent ledger number available on the blockchain
- **Safety_Margin**: The number of ledgers to stay behind the Chain_Tip to avoid rollback issues
- **Polling_Logic**: The component that periodically fetches new events from the blockchain
- **Reorganization**: A blockchain event where recent ledgers are replaced with an alternative chain history

## Requirements

### Requirement 1: Retrieve Current Chain Tip

**User Story:** As an indexer operator, I want the system to know the current blockchain state, so that it can calculate the safe indexing boundary.

#### Acceptance Criteria

1. WHEN the Polling_Logic executes, THE Indexer SHALL fetch the Chain_Tip from the RPC
2. IF the RPC request fails, THEN THE Indexer SHALL log the error and retry on the next polling cycle
3. THE Indexer SHALL validate that the Chain_Tip is a positive integer
4. WHEN the Chain_Tip is received, THE Indexer SHALL use it to calculate the safe ledger boundary

### Requirement 2: Apply Safety Margin to Indexing Boundary

**User Story:** As an indexer operator, I want the system to stay behind the chain tip, so that indexed data is not invalidated by reorganizations.

#### Acceptance Criteria

1. THE Indexer SHALL define a Safety_Margin of 10 ledgers
2. WHEN calculating the indexing boundary, THE Indexer SHALL subtract the Safety_Margin from the Chain_Tip
3. THE Indexer SHALL only fetch events from ledgers less than or equal to (Chain_Tip minus Safety_Margin)
4. IF the calculated boundary is less than the last indexed ledger, THEN THE Indexer SHALL not fetch any new events for that polling cycle

### Requirement 3: Maintain Indexing Progress

**User Story:** As an indexer operator, I want the system to track which ledgers have been indexed, so that it can resume from the correct position.

#### Acceptance Criteria

1. THE Indexer SHALL maintain a record of the last successfully indexed ledger number
2. WHEN fetching events, THE Indexer SHALL start from the ledger immediately after the last indexed ledger
3. WHEN fetching events, THE Indexer SHALL stop at the ledger calculated as (Chain_Tip minus Safety_Margin)
4. WHEN a batch of events is successfully indexed, THE Indexer SHALL update the last indexed ledger number

### Requirement 4: Handle Edge Cases

**User Story:** As an indexer operator, I want the system to handle unusual blockchain states gracefully, so that indexing remains reliable.

#### Acceptance Criteria

1. IF the Chain_Tip is less than the Safety_Margin, THEN THE Indexer SHALL not fetch any events and SHALL log a warning
2. IF the calculated safe boundary equals the last indexed ledger, THEN THE Indexer SHALL skip fetching and wait for the next polling cycle
3. WHEN the blockchain experiences a reorganization that affects indexed ledgers, THE Indexer SHALL detect the inconsistency on the next polling cycle
4. THE Indexer SHALL log the Chain_Tip and calculated safe boundary for each polling cycle

### Requirement 5: Configuration and Observability

**User Story:** As an indexer operator, I want visibility into the safety margin behavior, so that I can monitor and tune the system.

#### Acceptance Criteria

1. THE Indexer SHALL log the current Chain_Tip value for each polling cycle
2. THE Indexer SHALL log the calculated safe indexing boundary for each polling cycle
3. THE Indexer SHALL log the number of ledgers processed in each polling cycle
4. WHERE configuration is supported, THE Indexer SHALL allow the Safety_Margin value to be configurable
5. IF the Safety_Margin is configurable, THEN THE Indexer SHALL validate that it is a non-negative integer
