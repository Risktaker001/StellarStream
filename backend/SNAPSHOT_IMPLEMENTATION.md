# Snapshot Service Implementation

## Summary

Implemented a comprehensive snapshot service for managing long-running stream data with the following features:

### ✅ Completed Tasks

1. **Database Schema** (`backend/prisma/schema.prisma`)
   - Added `StreamSnapshot` model for monthly stream state snapshots
   - Added `StreamArchive` model for archived event logs
   - Proper indexing and unique constraints

2. **Snapshot Service** (`backend/src/services/snapshot.service.ts`)
   - `createMonthlySnapshots()` - Captures current state of all streams
   - `archiveOldLogs()` - Moves logs older than 3 months to archive
   - `runMaintenance()` - Executes both operations
   - Query methods for snapshots and archives

3. **Scheduler** (`backend/src/services/snapshot.scheduler.ts`)
   - Automatic monthly execution (1st of month at 2 AM)
   - Self-rescheduling mechanism
   - Manual trigger support

4. **API Endpoints** (`backend/src/api/snapshot.routes.ts`)
   - `POST /api/v1/snapshots/maintenance` - Manual trigger
   - `GET /api/v1/snapshots/:streamId` - Get all snapshots
   - `GET /api/v1/snapshots/:streamId/:month` - Get specific snapshot
   - `GET /api/v1/snapshots/:streamId/archive` - Get archived logs

5. **Integration** (`backend/src/index.ts`)
   - Scheduler initialized on server start
   - Graceful shutdown handling

## Running the Migration

Once your database is configured:

```bash
cd backend

# Generate and apply migration
npx prisma migrate dev --name add_snapshot_and_archive_tables

# Or for production
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

## Usage Examples

### Automatic (Default)
The scheduler runs automatically when the server starts. Snapshots are created and logs archived on the 1st of each month at 2 AM.

### Manual Trigger
```bash
curl -X POST http://localhost:3000/api/v1/snapshots/maintenance
```

### Query Snapshots
```bash
# Get all snapshots for a stream
curl http://localhost:3000/api/v1/snapshots/stream123

# Get February 2026 snapshot
curl http://localhost:3000/api/v1/snapshots/stream123/2026-02

# Get archived logs
curl http://localhost:3000/api/v1/snapshots/stream123/archive
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Scheduler (Monthly)             │
│  Runs 1st of month at 2 AM              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      SnapshotService.runMaintenance()   │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  Snapshot   │  │   Archive    │
│  Creation   │  │   Old Logs   │
└─────────────┘  └──────────────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│StreamSnapshot│ │StreamArchive │
│   Table     │  │   Table      │
└─────────────┘  └──────────────┘
```

## Benefits

1. **Database Performance** - Keeps EventLog table lean by archiving old data
2. **Historical Analysis** - Monthly snapshots enable trend analysis
3. **Data Retention** - Archives preserve all historical data
4. **Query Efficiency** - Indexed snapshots for fast retrieval
5. **Automatic Maintenance** - No manual intervention required

## Configuration

To disable automatic scheduling, comment out in `src/index.ts`:
```typescript
// scheduleSnapshotMaintenance();
```

## Monitoring

Logs include:
- Snapshot creation count
- Archive operation results
- Scheduler timing
- Error details

Check logs:
```bash
grep "snapshot" logs/app.log
```

## Next Steps

1. Set up DATABASE_URL in `.env`
2. Run migration: `npx prisma migrate dev`
3. Start server: `npm run dev`
4. Verify scheduler initialized in logs
5. Test manual trigger endpoint

See `SNAPSHOT_MIGRATION.md` for detailed migration guide.
