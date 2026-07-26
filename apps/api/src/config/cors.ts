import type { CorsOptions } from 'cors';

import { env } from './env';

export const corsOptions: CorsOptions = {
  origin:
    env.NODE_ENV === 'development'
      ? [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
      : env.CLIENT_URL,
  credentials: true,
};
