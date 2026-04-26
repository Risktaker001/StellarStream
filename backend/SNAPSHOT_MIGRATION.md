# Snapshot Service Migration Guide

## Overview
This migration adds snapshot and archival functionality to manage long-running stream data efficiently.

## Database Changes

### New Tables

1. **StreamSnapshot** - Monthly snapshots of stream states
   - Stores complete stream state for each month
   - Unique constraint on (streamId, snapshotMonth)
   - Indexed by streamId and snapshotMonth

2. **StreamArchive** - Archived event logs (older than 3 months)
   - Mirrors EventLog structure
   - Includes archivedAt timestamp
   - Indexed by streamId and createdAt

## Migration Steps

1. **Generate Prisma migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_snapshot_and_archive_tables
   ```

2. **Apply migration to production:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify tables created:**
   ```bash
   npx prisma studio
   ```

## Features

### Automatic Maintenance
- Runs monthly on the 1st at 2 AM
- Creates snapshots for all streams
- Archives logs older than 3 months

### Manual Trigger
```bash
curl -X POST http://localhost:3000/api/v1/snapshots/maintenance
```

### API Endpoints

1. **Get stream snapshots:**
   ```
   GET /api/v1/snapshots/:streamId
   ```

2. **Get specific month snapshot:**
   ```
   GET /api/v1/snapshots/:streamId/:month
   ```
   Example: `/api/v1/snapshots/stream123/2026-02`

3. **Get archived logs:**
   ```
   GET /api/v1/snapshots/:streamId/archive
   ```

4. **Trigger maintenance:**
   ```
   POST /api/v1/snapshots/maintenance
   ```

## Service Usage

```typescript
import { SnapshotService } from './services/snapshot.service';

const snapshotService = new SnapshotService();

// Create snapshots
await snapshotService.createMonthlySnapshots();

// Archive old logs
const archivedCount = await snapshotService.archiveOldLogs();

// Run both operations
const result = await snapshotService.runMaintenance();

// Query snapshots
const snapshot = await snapshotService.getSnapshot('streamId', '2026-02');
const allSnapshots = await snapshotService.getStreamSnapshots('streamId');
const archives = await snapshotService.getArchivedLogs('streamId');
```

## Configuration

The scheduler runs automatically on server start. To disable:
1. Comment out `scheduleSnapshotMaintenance()` in `src/index.ts`
2. Use manual API trigger instead

## Monitoring

Check logs for maintenance execution:
```bash
grep "snapshot maintenance" logs/app.log
```

## Rollback

If needed, rollback the migration:
```bash
npx prisma migrate resolve --rolled-back add_snapshot_and_archive_tables
```

Then manually drop tables:
```sql
DROP TABLE "StreamArchive";
DROP TABLE "StreamSnapshot";
```
