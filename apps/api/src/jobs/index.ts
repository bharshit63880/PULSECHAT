import { logger } from '../services/logger.service';
import { messagesService } from '../modules/messages/messages.service';

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export const startJobs = () => {
  if (cleanupTimer) {
    return;
  }

  cleanupTimer = setInterval(() => {
    void messagesService
      .purgeExpiredMessages()
      .then((removedCount) => {
        if (removedCount > 0) {
          logger.info({ removedCount }, 'Purged expired disappearing messages');
        }
      })
      .catch((error) => {
        logger.error({ error }, 'Failed to purge expired disappearing messages');
      });
  }, 60_000);
};
