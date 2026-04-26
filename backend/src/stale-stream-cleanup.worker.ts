import { schedule, type ScheduledTask } from 'node-cron';
import { StaleStreamCleanupService } from './services/stale-stream-cleanup.service.js';
import { logger } from './logger.js';

// Every hour at minute 0  (e.g. 01:00, 02:00, …)
const CLEANUP_SCHEDULE = '0 * * * *';

/**
 * Background worker that periodically expires stale streams.
 *
 * Streams that have passed their endTime but received no further on-chain
 * events are transitioned to COMPLETED by running a bulk DB update on a
 * fixed schedule. This keeps the DB consistent even when the on-chain
 * activity for a stream has naturally ceased.
 */
export class StaleStreamCleanupWorker {
  private task: ScheduledTask | null = null;
  private readonly service: StaleStreamCleanupService;

  constructor(service: StaleStreamCleanupService = new StaleStreamCleanupService()) {
    this.service = service;
  }

  start(): void {
    if (this.task !== null) {
      logger.warn('StaleStreamCleanupWorker is already running');
      return;
    }

    this.task = schedule(CLEANUP_SCHEDULE, async () => {
      logger.info('Stale stream cleanup job triggered');
      try {
        const { updatedCount } = await this.service.markExpiredStreamsCompleted();
        logger.info('Stale stream cleanup job finished', { updatedCount });
      } catch (error) {
        logger.error('Stale stream cleanup job encountered an error', error);
      }
    });

    logger.info('StaleStreamCleanupWorker started', { schedule: CLEANUP_SCHEDULE });
  }

  stop(): void {
    if (this.task === null) {
      return;
    }

    this.task.stop();
    this.task = null;
    logger.info('StaleStreamCleanupWorker stopped');
  }
}
