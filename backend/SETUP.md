# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- Access to a Stellar RPC endpoint
- Your deployed StellarStream contract ID

## Installation Steps

### 1. Install Dependencies

**Windows (PowerShell with execution policy issues):**
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then in the backend directory:
npm install
```

**Windows (Command Prompt):**
```cmd
cd backend
npm install
```

**Linux/Mac:**
```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
POLL_INTERVAL_MS=5000
```

### 3. Run the Service

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Verifying It Works

Once running, you should see:

```
[2024-02-24T10:30:45.123Z] [INFO] Starting StellarStream Event Watcher Service
[2024-02-24T10:30:45.234Z] [INFO] Configuration loaded {"rpcUrl":"https://soroban-testnet.stellar.org","contractId":"CXXX...","pollInterval":"5000ms"}
[2024-02-24T10:30:45.345Z] [INFO] EventWatcher initialized
[2024-02-24T10:30:45.456Z] [INFO] EventWatcher started
[2024-02-24T10:30:45.567Z] [INFO] Cursor initialized {"startingLedger":123456}
```

## Testing Event Detection

To test the service, interact with your contract on-chain:

1. Create a stream using your frontend or CLI
2. Watch the backend logs for event output
3. You should see structured event logs like:

```json
[2024-02-24T10:31:00.000Z] [INFO] EVENT: stream_created {
  "id": "0001234567890-0000000001",
  "type": "contract",
  "ledger": 1234567,
  "contractId": "CXXX...",
  "txHash": "abc123...",
  "topics": [...],
  "value": {...}
}
```

## Troubleshooting

### PowerShell Script Execution Error

If you see "running scripts is disabled", run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or use Command Prompt (cmd.exe) instead.

### Missing Dependencies

```bash
npm install @stellar/stellar-sdk dotenv
npm install -D typescript tsx @types/node
```

### Contract ID Format

Ensure your CONTRACT_ID:
- Starts with 'C'
- Is exactly 56 characters
- Contains only uppercase letters and numbers

### RPC Connection Issues

Test your RPC endpoint:
```bash
curl https://soroban-testnet.stellar.org/health
```

## Next Steps

1. **Add Database**: Persist events to PostgreSQL/MongoDB
2. **Add API**: Expose REST endpoints for querying events
3. **Add Webhooks**: Send notifications on specific events
4. **Add Metrics**: Prometheus/Grafana monitoring
5. **Add Tests**: Unit and integration tests

## Production Deployment

### Using PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name stellarstream-watcher
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

### Using systemd

Create `/etc/systemd/system/stellarstream-watcher.service`:

```ini
[Unit]
Description=StellarStream Event Watcher
After=network.target

[Service]
Type=simple
User=stellarstream
WorkingDirectory=/opt/stellarstream-backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable stellarstream-watcher
sudo systemctl start stellarstream-watcher
sudo systemctl status stellarstream-watcher
```
