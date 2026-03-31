import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { connectDatabase } from '../src/db/connect';
import { ChatModel } from '../src/models/Chat';
import { DeviceSessionModel } from '../src/models/DeviceSession';
import { MessageModel } from '../src/models/Message';
import { RefreshTokenModel } from '../src/models/RefreshToken';
import { UserModel } from '../src/models/User';
import { logger } from '../src/services/logger.service';

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    MessageModel.deleteMany({}),
    ChatModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
    DeviceSessionModel.deleteMany({}),
    UserModel.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const users = await UserModel.insertMany([
    {
      name: 'Aarav Mehta',
      username: 'aarav',
      email: 'aarav@example.com',
      passwordHash,
      isEmailVerified: true,
      bio: 'Design systems and coffee.',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      isOnline: true
    },
    {
      name: 'Sara Khan',
      username: 'sara',
      email: 'sara@example.com',
      passwordHash,
      isEmailVerified: true,
      bio: 'PM who lives in backlog grooming.',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      isOnline: true
    },
    {
      name: 'Rohan Iyer',
      username: 'rohan',
      email: 'rohan@example.com',
      passwordHash,
      isEmailVerified: true,
      bio: 'Backend, infra, and late-night debugging.',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      isOnline: false,
      lastSeen: new Date()
    },
    {
      name: 'Nina Kapoor',
      username: 'nina',
      email: 'nina@example.com',
      passwordHash,
      isEmailVerified: true,
      bio: 'Frontend engineer focused on product polish.',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
      isOnline: false,
      lastSeen: new Date()
    }
  ]);
  const [aarav, sara, rohan, nina] = users;

  if (!aarav || !sara || !rohan || !nina) {
    throw new Error('Seed users could not be created');
  }

  await ChatModel.create({
    isGroupChat: false,
    encryptionMode: 'e2ee-direct',
    participants: [aarav._id, sara._id],
    admins: [aarav._id],
    createdBy: aarav._id,
    disappearingModeSeconds: 0,
    lastActivityAt: new Date()
  });

  logger.info('Seed completed successfully with users and an empty secure direct chat');
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  logger.error({ error }, 'Seed failed');
  await mongoose.disconnect();
  process.exit(1);
});
