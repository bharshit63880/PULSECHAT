import mongoose from 'mongoose';
import type { IndexDescriptionInfo } from 'mongodb';

import { connectDatabase } from '../src/db/connect';
import { MessageModel } from '../src/models/Message';
import { logger } from '../src/services/logger.service';

const expectedIndexName = 'sender_1_clientMessageId_1';

const isExpectedIndex = (index: IndexDescriptionInfo) => {
  const partialFilterExpression = index.partialFilterExpression as
    | { clientMessageId?: { $type?: unknown } }
    | undefined;

  return (
    index.key.sender === 1 &&
    index.key.clientMessageId === 1 &&
    index.unique === true &&
    partialFilterExpression?.clientMessageId?.$type === 'string'
  );
};

const migrate = async () => {
  await connectDatabase();

  try {
    await MessageModel.createCollection();
  } catch (error: unknown) {
    if ((error as { code?: number }).code !== 48) {
      throw error;
    }
  }

  const collection = MessageModel.collection;
  const indexes = await collection.indexes();

  for (const index of indexes) {
    const isLegacyIndex = index.name === 'clientMessageId_1';
    const isOutdatedCompoundIndex =
      index.key.sender === 1 && index.key.clientMessageId === 1 && !isExpectedIndex(index);

    if (isLegacyIndex || isOutdatedCompoundIndex) {
      if (index.name) {
        await collection.dropIndex(index.name);
        logger.info({ index: index.name }, 'Dropped obsolete message idempotency index');
      }
    }
  }

  const remainingIndexes = await collection.indexes();
  const matchingIndex = remainingIndexes.find(isExpectedIndex);

  if (!matchingIndex) {
    await collection.createIndex(
      { sender: 1, clientMessageId: 1 },
      {
        name: expectedIndexName,
        unique: true,
        partialFilterExpression: {
          clientMessageId: { $type: 'string' }
        }
      }
    );
    logger.info({ index: expectedIndexName }, 'Created sender-scoped message idempotency index');
  } else {
    logger.info({ index: matchingIndex.name }, 'Message idempotency index is already current');
  }
};

migrate()
  .catch((error: unknown) => {
    logger.error({ error }, 'Message idempotency index migration failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
