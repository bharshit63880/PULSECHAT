import type { ChatDto } from '@chat-app/shared';

import { buildPaginationMeta, normalizePagination } from '@chat-app/shared';

import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { ChatModel } from '../../models/Chat';
import { MessageModel } from '../../models/Message';
import { mapChatDto } from '../../services/mapper.service';

const chatPopulate = [
  { path: 'participants' },
  { path: 'admins' },
  {
    path: 'latestMessage',
    populate: [
      { path: 'sender' },
      {
        path: 'replyTo',
        populate: { path: 'sender' }
      }
    ]
  }
];

export const chatsService = {
  async getOrCreateDirectChat(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new AppError('You cannot create a direct chat with yourself', 400, ERROR_CODES.BAD_REQUEST);
    }

    const existing = await ChatModel.findOne({
      isGroupChat: false,
      participants: { $all: [userId, otherUserId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    }).populate(chatPopulate);

    if (existing) {
      return this.attachUnreadCount(existing, userId);
    }

    const chat = await ChatModel.create({
      isGroupChat: false,
      encryptionMode: 'e2ee-direct',
      participants: [userId, otherUserId],
      admins: [userId],
      createdBy: userId,
      disappearingModeSeconds: 0,
      lastActivityAt: new Date()
    });

    const populated = await ChatModel.findById(chat.id).populate(chatPopulate);

    if (!populated) {
      throw new AppError('Chat could not be created', 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    return this.attachUnreadCount(populated, userId);
  },

  async listChats(userId: string) {
    const chats = await ChatModel.find({ participants: userId })
      .sort({ lastActivityAt: -1, updatedAt: -1 })
      .populate(chatPopulate);

    return Promise.all(chats.map((chat) => this.attachUnreadCount(chat, userId)));
  },

  async getChatOrThrow(chatId: string, userId: string) {
    const chat = await ChatModel.findOne({ _id: chatId, participants: userId }).populate(chatPopulate);

    if (!chat) {
      throw new AppError('Chat not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return chat;
  },

  async assertMember(chatId: string, userId: string) {
    const chat = await ChatModel.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      throw new AppError('You do not have access to this chat', 403, ERROR_CODES.FORBIDDEN);
    }

    return chat;
  },

  async attachUnreadCount(chat: any, userId: string): Promise<ChatDto> {
    const unreadCount = await MessageModel.countDocuments({
      chat: chat._id,
      sender: { $ne: userId },
      'seenBy.user': { $ne: userId }
    });

    return mapChatDto(chat, unreadCount);
  },

  async getChatParticipants(chatId: string) {
    const chat = await ChatModel.findById(chatId).select('participants');

    if (!chat) {
      throw new AppError('Chat not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return chat.participants.map((participant) => participant.toString());
  },

  async listChatMessages(userId: string, chatId: string, page: number, limit: number) {
    await this.assertMember(chatId, userId);

    const pagination = normalizePagination(page, limit);
    const [messages, total] = await Promise.all([
      MessageModel.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender' },
        select: 'sender type createdAt'
      }),
      MessageModel.countDocuments({ chat: chatId })
    ]);

    return {
      messages: messages.reverse(),
      meta: buildPaginationMeta(pagination.page, pagination.limit, total)
    };
  },

  async updateDisappearingMode(chatId: string, userId: string, seconds: number) {
    const chat = await this.assertMember(chatId, userId);

    if (chat.isGroupChat) {
      throw new AppError(
        'Secure disappearing timers are only enabled for direct chats in this version',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const updated = await ChatModel.findByIdAndUpdate(
      chatId,
      { disappearingModeSeconds: seconds },
      { new: true }
    ).populate(chatPopulate);

    if (!updated) {
      throw new AppError('Chat not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return this.attachUnreadCount(updated, userId);
  }
};
