# Streams Dashboard API

## Endpoint

`GET /api/v1/streams/:address`

Returns all streams associated with a given Stellar address, with optional filtering capabilities.

## Path Parameters

- `address` (required): Stellar wallet address

## Query Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `direction` | string | `inbound` \| `outbound` | Filter by stream direction relative to the address |
| `status` | string | `active` \| `paused` \| `completed` | Filter by stream status |
| `tokens` | string | Comma-separated addresses | Filter by token contract addresses (e.g., `USDC_ADDRESS,USDT_ADDRESS`) |

## Examples

### Get all streams for an address
```bash
GET /api/v1/streams/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Get only incoming streams
```bash
GET /api/v1/streams/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?direction=inbound
```

### Get active outgoing streams
```bash
GET /api/v1/streams/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?direction=outbound&status=active
```

### Get USDC streams only
```bash
GET /api/v1/streams/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?tokens=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Combined filters
```bash
GET /api/v1/streams/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?direction=inbound&status=active&tokens=USDC_ADDRESS,USDT_ADDRESS
```

## Response Format

```json
{
  "success": true,
  "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "count": 5,
  "filters": {
    "direction": "inbound",
    "status": "active",
    "tokenAddresses": ["CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"]
  },
  "streams": [
    {
      "id": "stream_123",
      "sender": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "receiver": "GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
      "tokenAddress": "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "amountPerSecond": "1000000",
      "totalAmount": "86400000000",
      "status": "ACTIVE"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Address is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to retrieve streams"
}
```

## Implementation Details

- Streams are ordered by ID (descending) - newest first
- Multiple token addresses can be filtered using comma-separated values
- When no `direction` is specified, returns both inbound and outbound streams
- Status values map to database enum: `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELED`
