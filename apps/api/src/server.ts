import http from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './db/connect';
import { startJobs } from './jobs';
import { logger } from './services/logger.service';
import { mailService } from './services/mail.service';
import { createSocketServer } from './sockets/socket-server';

const bootstrap = async () => {
  await connectDatabase();
  await mailService.verifyConnection();
  const ioRef: { current?: ReturnType<typeof createSocketServer> } = {};
  const app = createApp(ioRef);
  const server = http.createServer(app);
  const io = createSocketServer(server);
  ioRef.current = io;
  startJobs();

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap server');
  process.exit(1);
});
