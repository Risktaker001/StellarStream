# Nebula SDK

TypeScript SDK for StellarStream - Stellar Network Real-time Payment Streaming Protocol.

## Installation

```bash
npm install @stellarstream/nebula-sdk
```

## Quick Start

```typescript
import { Nebula, StreamStatus } from '@stellarstream/nebula-sdk';

// Initialize SDK
Nebula.initialize('https://api.stellarstream.com/api/v1');
Nebula.setAuthToken('your-jwt-token');

// Create a stream
const stream = await Nebula.createStream({
  receiver: 'GXXXXXX...',
  amount: '1000000000',
  tokenAddress: 'CUSDC...',
  duration: 2592000, // 30 days in seconds
  yieldEnabled: true,
});

console.log(`Stream created: ${stream.id}`);
```

## API Reference

### Initialization

```typescript
// Initialize with custom backend URL
Nebula.initialize('https://your-backend.com/api/v1');

// Set authentication token
Nebula.setAuthToken('your-jwt-token');
```

### Stream Operations

#### Create Stream
```typescript
const stream = await Nebula.createStream({
  receiver: 'GXXXXXX...',
  amount: '1000000000',
  tokenAddress: 'CUSDC...',
  duration: 2592000,
  yieldEnabled: true,
});
```

#### Get Stream
```typescript
const stream = await Nebula.getStream('stream-id');
```

#### Get All Streams
```typescript
const streams = await Nebula.getStreams('GXXXXXX...', limit, offset);
```

#### Withdraw from Stream
```typescript
const result = await Nebula.withdrawFromStream({
  streamId: 'stream-id',
  amount: '100000000', // Optional: withdraw specific amount
});
```

#### Cancel Stream
```typescript
const result = await Nebula.cancelStream({
  streamId: 'stream-id',
});
```

### Analytics

#### Get Stream History
```typescript
const history = await Nebula.getStreamHistory('stream-id');
// Returns: { stream, events, yield }
```

#### Get Stream Events
```typescript
const events = await Nebula.getStreamEvents('stream-id', limit);
```

#### Get Yield Data
```typescript
const yield = await Nebula.getYieldData('stream-id');
```

#### Calculate Projected Yield
```typescript
const projection = await Nebula.calculateYield('stream-id', 30); // 30 days
// Returns: { projected: '50000000', rate: 0.05 }
```

### Protocol Data

#### Get Statistics
```typescript
const stats = await Nebula.getStats();
// Returns: { totalStreams, totalVolume, activeUsers, ... }
```

#### Search Streams
```typescript
const results = await Nebula.searchStreams('query');
```

## Types

```typescript
import {
  Stream,
  StreamStatus,
  StreamEvent,
  StreamHistory,
  YieldData,
  CreateStreamParams,
  WithdrawParams,
  CancelStreamParams,
} from '@stellarstream/nebula-sdk';

// Stream Status Enum
enum StreamStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  ARCHIVED = 'ARCHIVED',
}

// Stream Interface
interface Stream {
  id: string;
  streamId?: string;
  sender: string;
  receiver: string;
  amount: string;
  tokenAddress: string;
  duration: number;
  status: StreamStatus;
  withdrawn: string;
  createdAt: Date;
  yieldEnabled: boolean;
  accruedInterest: string;
}

// Stream Event Interface
interface StreamEvent {
  id: string;
  eventType: string;
  streamId: string;
  txHash: string;
  ledger: number;
  ledgerClosedAt: string;
  sender?: string;
  receiver?: string;
  amount?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

## Error Handling

```typescript
try {
  const stream = await Nebula.createStream({
    receiver: 'GXXXXXX...',
    amount: '1000000000',
    tokenAddress: 'CUSDC...',
    duration: 2592000,
  });
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Unauthorized - check your token');
  } else if (error.response?.status === 400) {
    console.error('Invalid parameters:', error.response.data);
  } else {
    console.error('Error:', error.message);
  }
}
```

## Examples

### Complete Stream Lifecycle

```typescript
import { Nebula } from '@stellarstream/nebula-sdk';

async function streamLifecycle() {
  Nebula.initialize('https://api.stellarstream.com/api/v1');
  Nebula.setAuthToken('your-token');

  // 1. Create stream
  const stream = await Nebula.createStream({
    receiver: 'GXXXXXX...',
    amount: '1000000000',
    tokenAddress: 'CUSDC...',
    duration: 2592000,
    yieldEnabled: true,
  });
  console.log('Stream created:', stream.id);

  // 2. Get stream details
  const details = await Nebula.getStream(stream.id);
  console.log('Status:', details.status);

  // 3. Check yield
  const yield = await Nebula.getYieldData(stream.id);
  console.log('Accrued interest:', yield.accruedInterest);

  // 4. Withdraw
  const withdrawal = await Nebula.withdrawFromStream({
    streamId: stream.id,
    amount: '100000000',
  });
  console.log('Withdrawal tx:', withdrawal.txHash);

  // 5. Get history
  const history = await Nebula.getStreamHistory(stream.id);
  console.log('Events:', history.events.length);

  // 6. Cancel stream
  const cancellation = await Nebula.cancelStream({
    streamId: stream.id,
  });
  console.log('Canceled:', cancellation.txHash);
}

streamLifecycle().catch(console.error);
```

### Batch Operations

```typescript
async function batchCreateStreams(receivers: string[]) {
  Nebula.initialize('https://api.stellarstream.com/api/v1');
  Nebula.setAuthToken('your-token');

  const streams = await Promise.all(
    receivers.map((receiver) =>
      Nebula.createStream({
        receiver,
        amount: '1000000000',
        tokenAddress: 'CUSDC...',
        duration: 2592000,
      }),
    ),
  );

  return streams;
}
```

### Yield Monitoring

```typescript
async function monitorYield(streamId: string) {
  Nebula.initialize('https://api.stellarstream.com/api/v1');
  Nebula.setAuthToken('your-token');

  // Get current yield
  const current = await Nebula.getYieldData(streamId);
  console.log('Current accrued:', current.accruedInterest);

  // Project 30-day yield
  const projection = await Nebula.calculateYield(streamId, 30);
  console.log('30-day projection:', projection.projected);

  // Get all events
  const events = await Nebula.getStreamEvents(streamId);
  console.log('Total events:', events.length);
}
```

## Development

### Build
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Test
```bash
npm run test
```

## License

MIT

## Support

For issues and questions, visit: https://github.com/stellarstream/sdk
