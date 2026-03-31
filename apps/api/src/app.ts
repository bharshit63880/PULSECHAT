import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import type { Server } from 'socket.io';

import { corsOptions } from './config/cors';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';
import { mountApiRoutes } from './routes';
import { logger } from './services/logger.service';

type IoRef = {
  current?: Server;
};

export const createApp = (ioRef?: IoRef) => {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use((request, _response, next) => {
    if (ioRef?.current) {
      request.io = ioRef.current;
    }
    next();
  });

  mountApiRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
