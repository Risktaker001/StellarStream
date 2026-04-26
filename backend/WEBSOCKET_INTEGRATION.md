# WebSocket Integration: Live "Pulse" Updates

## Overview

The StellarStream backend now supports real-time WebSocket connections using Socket.IO to push live updates to the frontend instead of requiring polling.

## Features

### Stream Room System
- Each user address gets a dedicated "stream room" (`stream-{userAddress}`)
- Clients can join/leave rooms to receive targeted updates
- Automatic cleanup when clients disconnect

### Event Types

#### NEW_STREAM Event
Emitted when:
- A new stream is created (`upsertCreatedStream`)
- A stream is canceled (`cancelStream`)

Payload:
```typescript
{
  streamId: string;
  sender: string;
  receiver: string;
  amount?: string;
  status: string;
  timestamp: string;
}
```

#### BALANCE_UPDATE Event
Emitted when:
- A withdrawal is registered (`registerWithdrawal`)

Payload:
```typescript
{
  address: string;
  newBalance: string;
  timestamp: string;
}
```

## API Endpoints

### WebSocket Events

#### Client → Server
- `join-stream-room` (userAddress: string)
- `leave-stream-room` (userAddress: string)

#### Server → Client
- `new-stream` (StreamEventPayload)
- `balance-update` (BalanceUpdatePayload)
- `joined-room` ({ userAddress, roomName })
- `left-room` ({ userAddress, roomName })

### HTTP Endpoints

#### GET /health
Enhanced health check with WebSocket status:
```json
{
  "status": "ok",
  "message": "StellarStream Backend is running",
  "websocket": true,
  "connectedUsers": 2
}
```

#### GET /ws-status
WebSocket connection status:
```json
{
  "connectedUsers": ["GDUSER1...", "GDUSER2..."],
  "userConnections": {
    "GDUSER1...": 1,
    "GDUSER2...": 2
  }
}
```

#### POST /api/test/test-stream
Test endpoint to create a stream and emit WebSocket events:
```json
{
  "streamId": "test-stream-123",
  "sender": "GDSENDER...",
  "receiver": "GDRECEIVER...",
  "amount": "1000000000"
}
```

#### POST /api/test/test-withdrawal
Test endpoint to register a withdrawal and emit balance updates:
```json
{
  "streamId": "test-stream-123",
  "amount": "500000000"
}
```

#### POST /api/test/test-cancellation
Test endpoint to cancel a stream and emit events:
```json
{
  "streamId": "test-stream-123",
  "toReceiver": "750000000",
  "toSender": "250000000"
}
```

## Frontend Integration

### Client Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  
  // Join user's stream room
  socket.emit('join-stream-room', userAddress);
});

// Listen for new streams
socket.on('new-stream', (payload) => {
  console.log('New stream:', payload);
  // Update UI with new stream data
});

// Listen for balance updates
socket.on('balance-update', (payload) => {
  console.log('Balance updated:', payload);
  // Update UI with new balance
});
```

## Architecture

### WebSocketService
- Manages Socket.IO server instance
- Handles room management
- Provides methods for emitting events
- Tracks connected users and socket counts

### StreamLifecycleService Integration
- Emits WebSocket events immediately after database writes
- Error handling ensures WebSocket failures don't break database operations
- Events are sent to both sender and receiver for stream events

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: CORS allowed origin (default: http://localhost:5173)

### CORS Configuration
WebSocket server is configured to accept connections from the frontend URL specified in the FRONTEND_URL environment variable.

## Testing

### Manual Testing
1. Start the backend server: `npm run dev`
2. Connect a WebSocket client to `ws://localhost:3000`
3. Join a stream room: `socket.emit('join-stream-room', 'GDTESTUSER...')`
4. Call test API endpoints to trigger events
5. Verify events are received in real-time

### Test Endpoints
Use the `/api/test/*` endpoints to simulate stream events and verify WebSocket functionality without needing actual Stellar transactions.

## Error Handling

- WebSocket emission failures are logged but don't interrupt database operations
- Invalid room joins/leaves are handled gracefully
- Automatic cleanup of disconnected clients
- CORS protection for WebSocket connections

## Performance Considerations

- Events are emitted immediately after successful database writes
- Room-based targeting prevents broadcasting to all clients
- Minimal payload size for efficient transmission
- Connection pooling via Socket.IO for scalability
