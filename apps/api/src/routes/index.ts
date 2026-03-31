import type { Express } from 'express';

import { API_PREFIX } from '@chat-app/shared';
import { Router } from 'express';

import { healthController } from '../controllers/health.controller';
import { authRouter } from './auth.routes';
import { chatsRouter } from './chats.routes';
import { devicesRouter } from './devices.routes';
import { groupsRouter } from './groups.routes';
import { keysRouter } from './keys.routes';
import { messagesRouter } from './messages.routes';
import { uploadsRouter } from './uploads.routes';
import { usersRouter } from './users.routes';

export const apiRouter = Router();

apiRouter.get('/health', healthController);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/devices', devicesRouter);
apiRouter.use('/keys', keysRouter);
apiRouter.use('/chats', chatsRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.use('/groups', groupsRouter);
apiRouter.use('/uploads', uploadsRouter);

export const mountApiRoutes = (app: Express) => {
  app.use(API_PREFIX, apiRouter);
};
