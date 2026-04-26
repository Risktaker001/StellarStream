# Usage Examples

## Basic Usage

### Starting the Service

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build && npm start
```

## Example Event Outputs

### Stream Created Event

When a new payment stream is   created:

```json
[2024-02-24T10:30:45.123Z] [INFO] EVENT: stream_created {
  "id": "0001234567890-0000000001",
  "type": "contract",
  "ledger": 1234567,
  "ledgerClosedAt": "2024-02-24T10:30:40.000Z",
  "contractId": "CBTLXQEUBC6RN3HQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZ",
  "txHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "topics": [
    "AAAADwAAAA1zdHJlYW1fY3JlYXRlZA==",
    "AAAAAwAAAAE=",
    "AAAAAQAAAAA="
  ],
  "value": {
    "stream_id": "42",
    "sender": "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "receiver": "GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "token": "CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "amount": "1000000000",
    "start_time": "1708772400",
    "end_time": "1711450800"
  },
  "inSuccessfulContractCall": true
}
```

### Withdrawal Event

When a receiver withdraws funds:

```json
[2024-02-24T11:15:30.456Z] [INFO] EVENT: stream_withdrawn {
  "id": "0001234567891-0000000002",
  "type": "contract",
  "ledger": 1234568,
  "ledgerClosedAt": "2024-02-24T11:15:25.000Z",
  "contractId": "CBTLXQEUBC6RN3HQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZ",
  "txHash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1",
  "topics": [
    "AAAADwAAAA5zdHJlYW1fd2l0aGRyYXdu",
    "AAAAAwAAAAE="
  ],
  "value": {
    "stream_id": "42",
    "receiver": "GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "amount": "250000000",
    "withdrawn_at": "1708775700"
  },
  "inSuccessfulContractCall": true
}
```

### Stream Cancelled Event

When a stream is terminated early:

```json
[2024-02-24T12:00:15.789Z] [INFO] EVENT: stream_cancelled {
  "id": "0001234567892-0000000003",
  "type": "contract",
  "ledger": 1234569,
  "ledgerClosedAt": "2024-02-24T12:00:10.000Z",
  "contractId": "CBTLXQEUBC6RN3HQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZ",
  "txHash": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2",
  "topics": [
    "AAAADwAAAA9zdHJlYW1fY2FuY2VsbGVk",
    "AAAAAwAAAAE="
  ],
  "value": {
    "stream_id": "42",
    "cancelled_by": "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "refunded_amount": "750000000",
    "receiver_amount": "250000000",
    "cancelled_at": "1708778415"
  },
  "inSuccessfulContractCall": true
}
```

## Configuration Examples

### Testnet Configuration

```env
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
CONTRACT_ID=CBTLXQEUBC6RN3HQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZQKJQVMXZ
POLL_INTERVAL_MS=5000
MAX_RETRIES=3
RETRY_DELAY_MS=2000
LOG_LEVEL=info
```

### Mainnet Configuration

```env
STELLAR_RPC_URL=https://soroban-mainnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
POLL_INTERVAL_MS=5000
MAX_RETRIES=5
RETRY_DELAY_MS=3000
LOG_LEVEL=warn
```

### High-Frequency Monitoring

For contracts with high activity:

```env
POLL_INTERVAL_MS=2000
MAX_RETRIES=10
RETRY_DELAY_MS=1000
LOG_LEVEL=info
```

### Low-Frequency Monitoring

For contracts with low activity (saves RPC calls):

```env
POLL_INTERVAL_MS=15000
MAX_RETRIES=3
RETRY_DELAY_MS=5000
LOG_LEVEL=warn
```

## Extending the Service

### Example: Save Events to Database

```typescript
// Add to event-watcher.ts

import { Pool } from 'pg';

private pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

private async handleEventByType(
  eventType: string,
  event: ParsedContractEvent
): Promise<void> {
  // Save to database
  await this.pool.query(
    `INSERT INTO contract_events 
     (event_type, ledger, tx_hash, contract_id, data, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [eventType, event.ledger, event.txHash, event.contractId, event.value]
  );

  // Original logging
  logger.event(eventType, event);
}
```

### Example: Send Webhook Notifications

```typescript
// Add to event-watcher.ts

private async handleEventByType(
  eventType: string,
  event: ParsedContractEvent
): Promise<void> {
  // Send webhook for important events
  if (eventType === 'stream_created' || eventType === 'stream_cancelled') {
    await fetch(process.env.WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        data: event,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  logger.event(eventType, event);
}
```

### Example: Real-time WebSocket Broadcasting

```typescript
// Add to index.ts

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Modify EventWatcher to accept callback
const watcher = new EventWatcher(config, (event) => {
  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
});
```

### Example: Prometheus Metrics

```typescript
// Add to event-watcher.ts

import { Counter, Gauge, register } from 'prom-client';

private eventsProcessed = new Counter({
  name: 'stellarstream_events_processed_total',
  help: 'Total number of events processed',
  labelNames: ['event_type'],
});

private lastLedger = new Gauge({
  name: 'stellarstream_last_processed_ledger',
  help: 'Last processed ledger number',
});

private async processEvent(event: SorobanRpc.Api.EventResponse): Promise<void> {
  const parsed = parseContractEvent(event);
  if (!parsed) return;

  const eventType = extractEventType(parsed.topics);
  
  // Update metrics
  this.eventsProcessed.inc({ event_type: eventType });
  this.lastLedger.set(parsed.ledger);

  logger.event(eventType, parsed);
}

// Expose metrics endpoint
import express from 'express';
const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
app.listen(9090);
```

## Testing

### Manual Testing

1. Deploy your contract to testnet
2. Start the watcher with your contract ID
3. Interact with the contract using Stellar CLI or frontend
4. Observe events in the watcher logs

### Testing with Stellar CLI

```bash
# Create a stream
stellar contract invoke \
  --id CXXX... \
  --source SENDER_SECRET \
  --network testnet \
  -- create_stream \
  --receiver GXXX... \
  --amount 1000000000 \
  --start_time 1708772400 \
  --cliff_time 1708772400 \
  --end_time 1711450800

# Watch the backend logs for the event
```

## Monitoring in Production

### Health Check Endpoint

Add to `index.ts`:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  const state = watcher.getState();
  res.json({
    status: state.isRunning ? 'healthy' : 'unhealthy',
    lastProcessedLedger: state.lastProcessedLedger,
    errorCount: state.errorCount,
    uptime: process.uptime(),
  });
});

app.listen(3000);
```

### Log Aggregation

Use structured logging with tools like:
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Grafana Loki**: Lightweight log aggregation
- **CloudWatch**: AWS native logging
- **Datadog**: Full observability platform

### Alerting

Set up alerts for:
- Service downtime (no logs for > 1 minute)
- High error rate (errorCount > 5)
- Ledger lag (lastProcessedLedger falling behind)
- Memory/CPU usage spikes
