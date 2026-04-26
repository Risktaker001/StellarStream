# Implementation Plan: Ledger Safety Margin

## Overview

This implementation adds a configurable safety margin to the Stellar blockchain indexer's EventWatcher, preventing it from processing ledgers that may be invalidated by chain reorganizations. The work involves extending the configuration system, modifying the polling loop to calculate safe boundaries, and adding comprehensive logging for observability.

## Tasks

- [ ] 1. Extend configuration system with safety margin
  - [ ] 1.1 Add safetyMargin field to EventWatcherConfig interface
    - Add `safetyMargin: number` field to the existing interface
    - _Requirements: 2.1, 5.4_
  
  - [ ] 1.2 Implement safety margin configuration loading
    - Parse `SAFETY_MARGIN` environment variable with default value of 10
    - Add to `loadConfig()` function
    - _Requirements: 2.1, 5.4_
  
  - [ ] 1.3 Implement safety margin validation
    - Create `validateSafetyMargin()` function
    - Validate non-negative integer constraint
    - Add warning for values > 100
    - Call validation from `loadConfig()`
    - _Requirements: 5.5_
  
  - [ ]* 1.4 Write property test for configuration validation
    - **Property 8: Configuration Validation**
    - **Validates: Requirements 5.5**
  
  - [ ]* 1.5 Write unit test for default safety margin
    - Test that default value is 10 when env var not set
    - _Requirements: 2.1_

- [ ] 2. Implement safe boundary calculation
  - [ ] 2.1 Create calculateSafeBoundary() private method in EventWatcher
    - Fetch latest ledger from RPC using `this.server.getLatestLedger()`
    - Calculate safe boundary as `chainTip - safetyMargin`
    - Handle edge case where `safeBoundary < 0` (return null and log warning)
    - Add structured logging with chain tip, safety margin, and boundary values
    - Catch and log RPC errors, then re-throw
    - _Requirements: 1.1, 1.4, 2.2, 4.1, 4.4, 5.1, 5.2_
  
  - [ ]* 2.2 Write property test for safe boundary calculation
    - **Property 1: Safe Boundary Calculation**
    - **Validates: Requirements 1.4, 2.2**
  
  - [ ]* 2.3 Write property test for configurable safety margin
    - **Property 9: Configurable Safety Margin**
    - **Validates: Requirements 5.4**
  
  - [ ]* 2.4 Write unit test for chain tip less than margin edge case
    - Test that null is returned when chain tip < safety margin
    - Verify warning is logged
    - _Requirements: 4.1_

- [ ] 3. Checkpoint - Verify configuration and boundary calculation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Modify event fetching logic
  - [ ] 4.1 Update fetchAndProcessEvents() to use safe boundary
    - Call `calculateSafeBoundary()` at start of method
    - Skip fetching if `safeBoundary === null`
    - Calculate `startLedger = lastProcessedLedger + 1`
    - Skip fetching if `startLedger > safeBoundary`
    - Pass `startLedger` and apply boundary limit to RPC call
    - Filter fetched events to only include those with `ledger <= safeBoundary`
    - Add logging for fetch operations with boundary context
    - _Requirements: 2.3, 2.4, 3.2, 3.3, 4.2_
  
  - [ ]* 4.2 Write property test for event filtering within boundary
    - **Property 2: Event Filtering Within Boundary**
    - **Validates: Requirements 2.3, 3.3**
  
  - [ ]* 4.3 Write property test for cursor-based fetching
    - **Property 4: Cursor-Based Fetching**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.4 Write property test for skip fetching when caught up
    - **Property 5: Skip Fetching When Caught Up**
    - **Validates: Requirements 2.4**
  
  - [ ]* 4.5 Write unit test for boundary equals cursor edge case
    - Test that no events are fetched when boundary equals last processed
    - _Requirements: 4.2_

- [ ] 5. Implement cursor management with safety margin
  - [ ] 5.1 Update cursor advancement logic
    - Update `lastProcessedLedger` after each successfully processed event
    - Ensure cursor advances to highest ledger in batch
    - Update cursor to safe boundary even when no events found
    - Add logging for cursor updates
    - _Requirements: 3.1, 3.4, 5.3_
  
  - [ ]* 5.2 Write property test for cursor advancement
    - **Property 3: Cursor Advancement**
    - **Validates: Requirements 3.1, 3.4**
  
  - [ ]* 5.3 Write unit test for cursor update with no events
    - Test that cursor advances to safe boundary when no events found
    - _Requirements: 3.1_

- [ ] 6. Implement error handling and resilience
  - [ ] 6.1 Add RPC error handling in calculateSafeBoundary()
    - Catch network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
    - Log errors with structured context (RPC URL, retry count)
    - Allow error to propagate to poll loop for retry logic
    - _Requirements: 1.2_
  
  - [ ] 6.2 Add chain tip validation
    - Validate that chain tip is a positive integer
    - Throw descriptive error for invalid values
    - _Requirements: 1.3_
  
  - [ ]* 6.3 Write property test for RPC error resilience
    - **Property 6: RPC Error Resilience**
    - **Validates: Requirements 1.2**
  
  - [ ]* 6.4 Write property test for chain tip validation
    - **Property 7: Chain Tip Validation**
    - **Validates: Requirements 1.3**

- [ ] 7. Add observability logging
  - [ ] 7.1 Implement comprehensive logging for polling cycles
    - Log chain tip, safety margin, and safe boundary in calculateSafeBoundary()
    - Log start ledger and safe boundary in fetchAndProcessEvents()
    - Log number of events processed after each batch
    - Log skip conditions (null boundary, caught up)
    - Use structured logging format with consistent field names
    - _Requirements: 4.4, 5.1, 5.2, 5.3_
  
  - [ ]* 7.2 Write property test for observability logging
    - **Property 10: Observability Logging**
    - **Validates: Requirements 4.4, 5.1, 5.2, 5.3**

- [ ] 8. Checkpoint - Verify complete implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Integration and final validation
  - [ ] 9.1 Wire all components together
    - Verify configuration flows from env vars to EventWatcher
    - Verify boundary calculation integrates with polling loop
    - Verify cursor updates work correctly with safe boundary
    - Verify logging appears in all code paths
    - _Requirements: All_
  
  - [ ]* 9.2 Write integration test for full polling cycle
    - Test complete flow: config → boundary calc → fetch → process → cursor update
    - Mock RPC responses with events at various ledger heights
    - Verify events beyond safe boundary are filtered
    - Verify cursor advances correctly
    - _Requirements: All_

- [ ] 10. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript as specified in the design document
- All logging uses structured format for observability
- Error handling ensures graceful degradation without data loss
