import mongoose from 'mongoose';

import { env } from '../config/env';
import { logger } from '../services/logger.service';

export const connectDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
};
