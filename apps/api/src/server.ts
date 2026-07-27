import http from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './db/connect';
import { startJobs } from './jobs';
import { cacheService } from './services/cache.service';
import { logger } from './services/logger.service';
import { mailService } from './services/mail.service';
import { createSocketServer } from './sockets/socket-server';

const bootstrap = async () => {
  await connectDatabase();
  await cacheService.connect();
  // Email is needed for verification flows, but SMTP availability must never
  // delay the HTTP server from becoming ready.
  void mailService.verifyConnection().catch((error) => {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'SMTP verification failed; email delivery will remain unavailable until it is fixed'
    );
  });
  const ioRef: { current?: ReturnType<typeof createSocketServer> } = {};
  const app = createApp(ioRef);
  const server = http.createServer(app);
  const io = createSocketServer(server);
  ioRef.current = io;
  startJobs();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down API server');
    io.close();
    server.close();
    await cacheService.disconnect();
    process.exit(0);
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  logger.error(
    {
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : String(error)
    },
    'Failed to bootstrap server'
  );
  process.exit(1);
});
