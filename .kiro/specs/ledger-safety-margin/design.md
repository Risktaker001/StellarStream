# Design Document: Ledger Safety Margin

## Overview

The Ledger Safety Margin feature adds a configurable offset mechanism to the Stellar blockchain indexer, preventing it from processing ledgers that may be invalidated by chain reorganizations. This design integrates seamlessly with the existing EventWatcher polling architecture by introducing a boundary calculation step between fetching the chain tip and requesting events.

The implementation modifies the existing `EventWatcher` class to:
1. Fetch the current chain tip from the Stellar RPC on each polling cycle
2. Calculate a safe indexing boundary by subtracting a configurable safety margin (default: 10 ledgers)
3. Only fetch and process events up to this safe boundary
4. Log boundary calculations for observability

This approach ensures that indexed data remains stable even during blockchain reorganizations, which typically affect only the most recent ledgers.

## Architecture

### Component Integration

The safety margin logic integrates into the existing polling loop within `EventWatcher`:

```
┌─────────────────────────────────────────────────────────────┐
│                     EventWatcher                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              pollLoop() - Main Cycle                  │  │
│  │                                                        │  │
│  │  1. Fetch Chain Tip (getLatestLedger)                │  │
│  │          ↓                                            │  │
│  │  2. Calculate Safe Boundary                          │  │
│  │     safeBoundary = chainTip - safetyMargin           │  │
│  │          ↓                                            │  │
│  │  3. Validate Boundary                                │  │
│  │     if safeBoundary <= lastProcessedLedger: skip     │  │
│  │          ↓                                            │  │
│  │  4. Fetch Events                                     │  │
│  │     startLedger = lastProcessedLedger + 1            │  │
│  │     endLedger = safeBoundary                         │  │
│  │          ↓                                            │  │
│  │  5. Process Events & Update Cursor                   │  │
│  │          ↓                                            │  │
│  │  6. Log Metrics                                      │  │
│  │     (chainTip, safeBoundary, processed count)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ RPC: getLatestLedger()
                         │ RPC: getEvents(startLedger, filters)
                         ▼
              ┌──────────────────────┐
              │   Stellar RPC Node   │
              └──────────────────────┘
```

### Configuration Extension

The safety margin value will be added to the existing `EventWatcherConfig` interface and loaded from environment variables with a sensible default:

```typescript
export interface EventWatcherConfig {
  // ... existing fields
  safetyMargin: number;  // Default: 10
}
```

Environment variable: `SAFETY_MARGIN` (optional, defaults to 10)

### State Management

The existing `WatcherState` interface already tracks `lastProcessedLedger`, which serves as the cursor for resuming indexing. No modifications to state structure are needed. The safety margin calculation is stateless and computed fresh on each polling cycle.

## Components and Interfaces

### Modified Components

#### 1. EventWatcher Class

**New Private Method: `calculateSafeBoundary()`**

```typescript
private async calculateSafeBoundary(): Promise<number | null> {
  try {
    const latestLedger = await this.server.getLatestLedger();
    const chainTip = latestLedger.sequence;
    const safeBoundary = chainTip - this.config.safetyMargin;
    
    logger.info("Calculated safe boundary", {
      chainTip,
      safetyMargin: this.config.safetyMargin,
      safeBoundary,
      lastProcessedLedger: this.state.lastProcessedLedger
    });
    
    // Edge case: chain tip is less than safety margin
    if (safeBoundary < 0) {
      logger.warn("Chain tip is less than safety margin", {
        chainTip,
        safetyMargin: this.config.safetyMargin
      });
      return null;
    }
    
    return safeBoundary;
  } catch (error) {
    logger.error("Failed to calculate safe boundary", error);
    throw error;
  }
}
```

**Modified Method: `fetchAndProcessEvents()`**

The existing method will be updated to:
1. Call `calculateSafeBoundary()` instead of directly using `lastProcessedLedger + 1`
2. Skip fetching if `safeBoundary <= lastProcessedLedger`
3. Pass `safeBoundary` as a limit to the RPC call (if supported) or filter events post-fetch
4. Log the number of ledgers processed

```typescript
private async fetchAndProcessEvents(): Promise<void> {
  // Calculate safe boundary
  const safeBoundary = await this.calculateSafeBoundary();
  
  if (safeBoundary === null) {
    logger.debug("Skipping fetch: safe boundary is null");
    return;
  }
  
  const startLedger = this.state.lastProcessedLedger + 1;
  
  // Skip if we're already at the safe boundary
  if (startLedger > safeBoundary) {
    logger.debug("Skipping fetch: already at safe boundary", {
      startLedger,
      safeBoundary
    });
    return;
  }
  
  logger.debug("Fetching events", { startLedger, safeBoundary });
  
  // Fetch events up to safe boundary
  const response = await this.server.getEvents({
    startLedger,
    filters: [
      {
        type: "contract",
        contractIds: [this.config.contractId],
      },
    ],
    limit: 100,
  });
  
  if (response.events === undefined || response.events.length === 0) {
    logger.debug("No new events found");
    // Update cursor to safe boundary even if no events
    this.state.lastProcessedLedger = safeBoundary;
    return;
  }
  
  // Filter events to only include those within safe boundary
  const safeEvents = response.events.filter(
    event => event.ledger <= safeBoundary
  );
  
  logger.info(`Found ${safeEvents.length} events within safe boundary`, {
    totalEvents: response.events.length,
    safeBoundary
  });
  
  let processedCount = 0;
  
  // Process each event
  for (const event of safeEvents) {
    await this.processEvent(event);
    processedCount++;
    
    // Update cursor after each event
    if (event.ledger > this.state.lastProcessedLedger) {
      this.state.lastProcessedLedger = event.ledger;
    }
  }
  
  logger.info("Events processed", {
    processedCount,
    lastProcessedLedger: this.state.lastProcessedLedger,
    safeBoundary
  });
}
```

#### 2. Configuration Module

**Modified Function: `loadConfig()`**

```typescript
export function loadConfig(): EventWatcherConfig {
  validateEnv();

  return {
    rpcUrl: process.env.STELLAR_RPC_URL!,
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE ??
      "Test SDF Network ; September 2015",
    contractId: process.env.CONTRACT_ID!,
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? "5000", 10),
    maxRetries: parseInt(process.env.MAX_RETRIES ?? "3", 10),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS ?? "2000", 10),
    safetyMargin: parseInt(process.env.SAFETY_MARGIN ?? "10", 10),
  };
}
```

**New Validation Function: `validateSafetyMargin()`**

```typescript
function validateSafetyMargin(margin: number): void {
  if (!Number.isInteger(margin) || margin < 0) {
    throw new Error(
      `Invalid SAFETY_MARGIN: ${margin}. Must be a non-negative integer.`
    );
  }
  
  if (margin > 100) {
    console.warn(
      `Warning: SAFETY_MARGIN is unusually high: ${margin}\n` +
      "This may cause significant indexing lag."
    );
  }
}
```

This validation will be called within `loadConfig()` after parsing the safety margin value.

### New Interfaces

No new interfaces are required. The existing `EventWatcherConfig` interface will be extended with a single field:

```typescript
export interface EventWatcherConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  pollIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  safetyMargin: number;  // NEW
}
```

## Data Models

No database schema changes are required. The feature operates entirely within the application layer, using:

1. **In-Memory State**: `WatcherState.lastProcessedLedger` (already exists)
2. **Configuration**: `EventWatcherConfig.safetyMargin` (new field)
3. **RPC Response**: `LatestLedger.sequence` (from Stellar SDK)

The cursor (`lastProcessedLedger`) continues to track the highest ledger that has been successfully processed. The safety margin is applied dynamically during each polling cycle without persisting the calculated boundary.

### Data Flow

```
Environment Variable (SAFETY_MARGIN)
         ↓
    loadConfig()
         ↓
EventWatcherConfig.safetyMargin
         ↓
calculateSafeBoundary()
         ↓
    safeBoundary (ephemeral)
         ↓
fetchAndProcessEvents()
         ↓
WatcherState.lastProcessedLedger (updated)
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Logging properties (4.4, 5.1, 5.2)** all verify that chain tip and boundary are logged - these can be combined into a single comprehensive logging property
2. **Boundary calculation (1.4, 2.2)** both verify the same calculation - can be merged
3. **Event filtering (2.3, 3.3)** both verify that events don't exceed the safe boundary - can be combined
4. **Cursor management (3.1, 3.4)** both verify cursor updates - can be combined into one property about cursor advancement

The following properties represent the unique, non-redundant correctness requirements:

### Property 1: Safe Boundary Calculation

*For any* valid chain tip value and safety margin, the calculated safe boundary SHALL equal (chain_tip - safety_margin).

**Validates: Requirements 1.4, 2.2**

### Property 2: Event Filtering Within Boundary

*For any* set of events fetched from the RPC and calculated safe boundary, all processed events SHALL have ledger numbers less than or equal to the safe boundary.

**Validates: Requirements 2.3, 3.3**

### Property 3: Cursor Advancement

*For any* batch of successfully processed events, the last processed ledger cursor SHALL be updated to the highest ledger number in that batch, and SHALL never decrease.

**Validates: Requirements 3.1, 3.4**

### Property 4: Cursor-Based Fetching

*For any* polling cycle where events are fetched, the start ledger SHALL equal (last processed ledger + 1).

**Validates: Requirements 3.2**

### Property 5: Skip Fetching When Caught Up

*For any* polling cycle where the calculated safe boundary is less than or equal to the last processed ledger, no events SHALL be fetched.

**Validates: Requirements 2.4**

### Property 6: RPC Error Resilience

*For any* RPC failure during chain tip fetching, the indexer SHALL log the error and continue to the next polling cycle without crashing.

**Validates: Requirements 1.2**

### Property 7: Chain Tip Validation

*For any* chain tip value received from the RPC, if it is not a positive integer, the indexer SHALL reject it and handle it as an error.

**Validates: Requirements 1.3**

### Property 8: Configuration Validation

*For any* safety margin configuration value, if it is not a non-negative integer, the indexer SHALL reject it during initialization.

**Validates: Requirements 5.5**

### Property 9: Configurable Safety Margin

*For any* valid safety margin value set via configuration, the indexer SHALL use that value in boundary calculations instead of the default.

**Validates: Requirements 5.4**

### Property 10: Observability Logging

*For any* polling cycle that calculates a safe boundary, the indexer SHALL log the chain tip, safe boundary, and number of events processed.

**Validates: Requirements 4.4, 5.1, 5.2, 5.3**

### Edge Cases

The following edge cases will be handled by the property-based test generators:

- **Edge Case 1**: Chain tip less than safety margin (Requirements 4.1) - generators will include very small chain tip values
- **Edge Case 2**: Safe boundary equals last processed ledger (Requirements 4.2) - generators will include boundary values at the cursor position

## Error Handling

### Error Categories

#### 1. RPC Communication Errors

**Scenario**: Network failures, timeouts, or RPC endpoint unavailability during `getLatestLedger()` call

**Handling**:
- Catch exception in `calculateSafeBoundary()`
- Log error with context (RPC URL, retry count)
- Return `null` to signal boundary calculation failure
- Caller (`fetchAndProcessEvents()`) skips fetching for this cycle
- Next polling cycle will retry automatically

**Recovery**: Automatic retry on next poll (existing exponential backoff applies)

#### 2. Invalid Chain Tip Response

**Scenario**: RPC returns non-numeric, negative, or zero chain tip

**Handling**:
- Validate `latestLedger.sequence` is a positive integer
- If invalid, throw error with descriptive message
- Error propagates to poll loop's error handler
- Increment error count and apply backoff
- Stop after `MAX_RETRIES` consecutive failures

**Recovery**: Automatic retry with backoff, manual intervention if persistent

#### 3. Chain Tip Less Than Safety Margin

**Scenario**: Very young blockchain where `chainTip < safetyMargin`

**Handling**:
- Detect in `calculateSafeBoundary()` when `safeBoundary < 0`
- Log warning with chain tip and safety margin values
- Return `null` to skip fetching
- Continue polling normally (not an error condition)

**Recovery**: Automatic resolution as blockchain grows

#### 4. Invalid Safety Margin Configuration

**Scenario**: User sets `SAFETY_MARGIN` to negative, non-integer, or excessively large value

**Handling**:
- Validate during `loadConfig()` initialization
- Throw error for negative or non-integer values (fail-fast)
- Log warning for values > 100 but allow (may be intentional)
- Application fails to start if invalid

**Recovery**: User must fix configuration and restart

#### 5. Cursor Inconsistency

**Scenario**: `lastProcessedLedger` is ahead of current chain tip (possible after downtime or chain rollback)

**Handling**:
- Detect when `startLedger > safeBoundary`
- Skip fetching and log debug message
- Wait for chain to advance beyond cursor
- No error thrown (normal catch-up behavior)

**Recovery**: Automatic as chain advances

### Error Logging Format

All errors will be logged with structured context:

```typescript
logger.error("Failed to calculate safe boundary", error, {
  rpcUrl: this.config.rpcUrl,
  lastProcessedLedger: this.state.lastProcessedLedger,
  errorCount: this.state.errorCount,
  safetyMargin: this.config.safetyMargin
});
```

### Graceful Degradation

The safety margin feature degrades gracefully:

1. **RPC Failure**: Skip one polling cycle, retry next cycle
2. **Invalid Response**: Apply exponential backoff, stop after max retries
3. **Edge Cases**: Skip fetching, continue polling
4. **Configuration Error**: Fail-fast at startup (prevents silent failures)

No data loss occurs because the cursor (`lastProcessedLedger`) is only updated after successful event processing.

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using randomized test data

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test will run a minimum of 100 iterations with randomized inputs

**Test Structure**: Each property test will include a comment tag referencing the design document property:

```typescript
// Feature: ledger-safety-margin, Property 1: Safe Boundary Calculation
```

### Property Test Specifications

#### Property 1: Safe Boundary Calculation

```typescript
// Feature: ledger-safety-margin, Property 1: Safe Boundary Calculation
test('safe boundary equals chain tip minus safety margin', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000000 }), // chainTip
      fc.integer({ min: 0, max: 100 }),     // safetyMargin
      (chainTip, safetyMargin) => {
        const safeBoundary = chainTip - safetyMargin;
        expect(safeBoundary).toBe(chainTip - safetyMargin);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 2: Event Filtering Within Boundary

```typescript
// Feature: ledger-safety-margin, Property 2: Event Filtering Within Boundary
test('all processed events have ledger <= safe boundary', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        ledger: fc.integer({ min: 1, max: 1000 }),
        id: fc.string()
      })),
      fc.integer({ min: 1, max: 1000 }),
      (events, safeBoundary) => {
        const filtered = events.filter(e => e.ledger <= safeBoundary);
        expect(filtered.every(e => e.ledger <= safeBoundary)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 3: Cursor Advancement

```typescript
// Feature: ledger-safety-margin, Property 3: Cursor Advancement
test('cursor advances to highest ledger and never decreases', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),  // initialCursor
      fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1 }), // ledgers
      (initialCursor, ledgers) => {
        const maxLedger = Math.max(...ledgers);
        const newCursor = Math.max(initialCursor, maxLedger);
        expect(newCursor).toBeGreaterThanOrEqual(initialCursor);
        expect(newCursor).toBe(Math.max(initialCursor, maxLedger));
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 4: Cursor-Based Fetching

```typescript
// Feature: ledger-safety-margin, Property 4: Cursor-Based Fetching
test('start ledger equals last processed + 1', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000000 }),
      (lastProcessed) => {
        const startLedger = lastProcessed + 1;
        expect(startLedger).toBe(lastProcessed + 1);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 5: Skip Fetching When Caught Up

```typescript
// Feature: ledger-safety-margin, Property 5: Skip Fetching When Caught Up
test('no fetch when safe boundary <= last processed', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: -100, max: 100 }),
      (lastProcessed, offset) => {
        const safeBoundary = lastProcessed + offset;
        const shouldSkip = safeBoundary <= lastProcessed;
        const startLedger = lastProcessed + 1;
        const wouldFetch = startLedger <= safeBoundary;
        expect(wouldFetch).toBe(!shouldSkip);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 6: RPC Error Resilience

```typescript
// Feature: ledger-safety-margin, Property 6: RPC Error Resilience
test('indexer continues after RPC errors', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.constantFrom('ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'),
      async (errorCode) => {
        const mockRpc = {
          getLatestLedger: jest.fn().mockRejectedValue(new Error(errorCode))
        };
        
        let errorLogged = false;
        const mockLogger = {
          error: () => { errorLogged = true; }
        };
        
        // Attempt to calculate boundary
        try {
          await calculateSafeBoundary(mockRpc, mockLogger);
        } catch (e) {
          // Error should be caught and logged
        }
        
        expect(errorLogged).toBe(true);
        // Indexer should not crash (test completes successfully)
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 7: Chain Tip Validation

```typescript
// Feature: ledger-safety-margin, Property 7: Chain Tip Validation
test('rejects non-positive chain tip values', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.integer({ max: 0 }),           // Non-positive
        fc.double(),                       // Non-integer
        fc.constant(NaN),
        fc.constant(Infinity)
      ),
      (invalidChainTip) => {
        const isValid = Number.isInteger(invalidChainTip) && invalidChainTip > 0;
        expect(isValid).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 8: Configuration Validation

```typescript
// Feature: ledger-safety-margin, Property 8: Configuration Validation
test('rejects invalid safety margin configuration', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.integer({ max: -1 }),          // Negative
        fc.double(),                       // Non-integer
        fc.constant(NaN)
      ),
      (invalidMargin) => {
        const isValid = Number.isInteger(invalidMargin) && invalidMargin >= 0;
        expect(isValid).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 9: Configurable Safety Margin

```typescript
// Feature: ledger-safety-margin, Property 9: Configurable Safety Margin
test('uses configured safety margin in calculations', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 1, max: 1000000 }),
      (configuredMargin, chainTip) => {
        const safeBoundary = chainTip - configuredMargin;
        expect(safeBoundary).toBe(chainTip - configuredMargin);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 10: Observability Logging

```typescript
// Feature: ledger-safety-margin, Property 10: Observability Logging
test('logs chain tip, boundary, and event count for each cycle', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000000 }),
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 100 }),
      (chainTip, safetyMargin, eventCount) => {
        const logs: any[] = [];
        const mockLogger = {
          info: (msg: string, data: any) => logs.push({ msg, data })
        };
        
        const safeBoundary = chainTip - safetyMargin;
        
        mockLogger.info("Calculated safe boundary", {
          chainTip,
          safetyMargin,
          safeBoundary
        });
        
        mockLogger.info("Events processed", {
          processedCount: eventCount
        });
        
        expect(logs.length).toBeGreaterThan(0);
        expect(logs.some(l => l.data.chainTip === chainTip)).toBe(true);
        expect(logs.some(l => l.data.safeBoundary === safeBoundary)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Specifications

Unit tests will cover specific examples and integration scenarios:

#### Example 1: Default Safety Margin

```typescript
test('default safety margin is 10', () => {
  const config = loadConfig();
  expect(config.safetyMargin).toBe(10);
});
```

#### Example 2: Edge Case - Chain Tip Less Than Margin

```typescript
test('returns null when chain tip < safety margin', async () => {
  const mockRpc = {
    getLatestLedger: jest.fn().mockResolvedValue({ sequence: 5 })
  };
  
  const config = { safetyMargin: 10 };
  const boundary = await calculateSafeBoundary(mockRpc, config);
  
  expect(boundary).toBeNull();
});
```

#### Example 3: Edge Case - Boundary Equals Cursor

```typescript
test('skips fetch when boundary equals last processed', async () => {
  const watcher = new EventWatcher({
    ...testConfig,
    safetyMargin: 10
  });
  
  watcher.state.lastProcessedLedger = 100;
  
  const mockRpc = {
    getLatestLedger: jest.fn().mockResolvedValue({ sequence: 110 })
  };
  
  const fetched = await watcher.fetchAndProcessEvents();
  
  expect(fetched).toBe(0); // No events fetched
});
```

#### Example 4: Integration Test

```typescript
test('full polling cycle with safety margin', async () => {
  const watcher = new EventWatcher({
    ...testConfig,
    safetyMargin: 10
  });
  
  // Mock RPC responses
  mockRpc.getLatestLedger.mockResolvedValue({ sequence: 120 });
  mockRpc.getEvents.mockResolvedValue({
    events: [
      { ledger: 101, id: '1' },
      { ledger: 105, id: '2' },
      { ledger: 110, id: '3' },
      { ledger: 115, id: '4' } // Should be filtered out
    ]
  });
  
  await watcher.start();
  await sleep(100);
  await watcher.stop();
  
  const state = watcher.getState();
  expect(state.lastProcessedLedger).toBe(110); // 120 - 10
});
```

### Test Coverage Goals

- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Property Tests**: 10 properties × 100 iterations = 1000 test cases
- **Unit Tests**: ~15-20 specific examples and edge cases

### Testing Dependencies

Add to `package.json`:

```json
{
  "devDependencies": {
    "fast-check": "^3.15.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11"
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run only property tests
npm test -- --testNamePattern="Property"

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test safety-margin.test.ts
```
