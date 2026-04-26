# Quick Start Guide - 5 Minutes to Running

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

## Installation (2 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env
```

## Configuration (1 minute)

Edit `.env` file:

```env
# Required: Your Stellar RPC endpoint
STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Required: Your deployed contract ID
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Adjust polling (default 5000ms = 5 seconds)
POLL_INTERVAL_MS=5000
```

**Where to get CONTRACT_ID?**
- After deploying your StellarStream contract
- Check your deployment logs
- Or use: `stellar contract info --id CXXX... --network testnet`

## Run (30 seconds)

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build && npm start
```

## Verify It's Working

You should see:

```
[2024-02-24T10:30:45.123Z] [INFO] Starting StellarStream Event Watcher Service
[2024-02-24T10:30:45.234Z] [INFO] Configuration loaded
[2024-02-24T10:30:45.345Z] [INFO] EventWatcher initialized
[2024-02-24T10:30:45.456Z] [INFO] EventWatcher started
[2024-02-24T10:30:45.567Z] [INFO] Cursor initialized {"startingLedger":123456}
```

## Test Event Detection (1 minute)

1. Open another terminal
2. Interact with your contract (create a stream, withdraw, etc.)
3. Watch the watcher logs for events:

```json
[2024-02-24T10:31:00.000Z] [INFO] EVENT: stream_created {
  "id": "0001234567890-0000000001",
  "txHash": "abc123...",
  "value": { "stream_id": "42", "amount": "1000000000" }
}
```

## Common Issues

### "Missing required environment variables"
→ Make sure `.env` exists and has `STELLAR_RPC_URL` and `CONTRACT_ID`

### "PowerShell script execution disabled" (Windows)
→ Run PowerShell as Admin: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
→ Or use Command Prompt (cmd.exe) instead

### "Cannot connect to RPC"
→ Check your internet connection
→ Verify RPC URL is correct
→ Test: `curl https://soroban-testnet.stellar.org/health`

### "No events appearing"
→ Verify CONTRACT_ID is correct
→ Make sure contract has been interacted with
→ Check you're on the right network (testnet vs mainnet)

## Next Steps

- **Add Database**: See `EXAMPLES.md` for PostgreSQL integration
- **Add API**: Expose events via REST endpoints
- **Deploy**: See `SETUP.md` for PM2/Docker/systemd deployment
- **Monitor**: Add Prometheus metrics (see `ARCHITECTURE.md`)

## Stop the Service

Press `Ctrl+C` - the service will shut down gracefully

## Useful Commands

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Type checking only
npm run type-check

# View logs (if using PM2)
pm2 logs stellarstream-watcher

# Restart service (PM2)
pm2 restart stellarstream-watcher
```

## Configuration Cheat Sheet

| Variable | Example | Description |
|----------|---------|-------------|
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` | RPC endpoint |
| `CONTRACT_ID` | `CBTLXQEUBC6RN3HQ...` | Contract to watch |
| `POLL_INTERVAL_MS` | `5000` | Poll every 5 seconds |
| `MAX_RETRIES` | `3` | Stop after 3 errors |
| `LOG_LEVEL` | `info` | debug/info/warn/error |

## Network Endpoints

**Testnet:**
```
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

**Mainnet:**
```
STELLAR_RPC_URL=https://soroban-mainnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
```

## That's It!

You now have a production-ready event watcher running. Check the other docs for advanced features:

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `EXAMPLES.md` - Usage examples
- `ARCHITECTURE.md` - System design
- `IMPLEMENTATION_SUMMARY.md` - Technical details
