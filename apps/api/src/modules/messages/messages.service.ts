import type { MessageDto, MessageSearchResultDto } from '@chat-app/shared';
import type { Server } from 'socket.io';

import { Types } from 'mongoose';

import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { ChatModel } from '../../models/Chat';
import { MessageModel } from '../../models/Message';
import { cacheService } from '../../services/cache.service';
import { mapMessageDto, mapMessageSearchResultDto } from '../../services/mapper.service';
import { SOCKET_EVENTS, userRoom } from '../../sockets/socket.constants';
import { chatsService } from '../chats/chats.service';
import { notificationsService } from '../notifications/notifications.service';
import { presenceService } from '../presence/presence.service';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type SendMessageInput = {
  chatId: string;
  clientMessageId?: string | null;
  senderDeviceId: string;
  recipientDeviceId: string;
  type: 'text' | 'image' | 'file' | 'gif' | 'sticker';
  ciphertext: string;
  encryptionVersion: string;
  iv: string;
  digest: string;
  attachment?: {
    url: string;
    publicId?: string | null;
    fileName: string;
    mimeType: string;
    size: number;
    isEncrypted?: boolean;
    encryption?: {
      algorithm: 'AES-GCM';
      wrappedFileKey: string;
      iv: string;
      digest: string;
    } | null;
  } | null;
  replyToId?: string | null;
};

export const messagesService = {
  async sendMessage(senderId: string, input: SendMessageInput, io?: Server) {
    const chat = await chatsService.assertMember(input.chatId, senderId);

    if (!input.ciphertext?.trim()) {
      throw new AppError('Encrypted messages must include ciphertext', 400, ERROR_CODES.BAD_REQUEST);
    }

    if (input.type !== 'text' && !input.attachment) {
      throw new AppError(
        'Media and file messages require attachment metadata',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    if (input.replyToId) {
      const replyTarget = await MessageModel.findOne({ _id: input.replyToId, chat: input.chatId });

      if (!replyTarget) {
        throw new AppError('Reply target was not found in this chat', 404, ERROR_CODES.NOT_FOUND);
      }
    }

    if (input.clientMessageId) {
      const existing = await MessageModel.findOne({ clientMessageId: input.clientMessageId })
        .populate('sender')
        .populate({
          path: 'replyTo',
          populate: { path: 'sender' },
          select: 'sender type createdAt'
        });

      if (existing) {
        return mapMessageDto(existing);
      }
    }

    const participantIds = chat.participants.map((participant) => participant.toString());
    const recipientId = participantIds.find((participantId) => participantId !== senderId);
    const recipientOnline = recipientId ? await presenceService.isUserOnline(recipientId) : false;
    const deliveryStatus = chat.isGroupChat
      ? 'sent'
      : recipientOnline
        ? 'delivered'
        : 'sent';
    const now = new Date();
    const expiresAt =
      chat.disappearingModeSeconds > 0
        ? new Date(now.getTime() + chat.disappearingModeSeconds * 1000)
        : null;

    const message = await MessageModel.create({
      chat: input.chatId,
      sender: senderId,
      senderDeviceId: input.senderDeviceId,
      recipientDeviceId: input.recipientDeviceId,
      clientMessageId: input.clientMessageId ?? null,
      type: input.type,
      ciphertext: input.ciphertext,
      encryptionVersion: input.encryptionVersion,
      iv: input.iv,
      digest: input.digest,
      attachment: input.attachment ?? null,
      replyTo: input.replyToId ?? null,
      reactions: [],
      status: deliveryStatus,
      seenBy: [{ user: senderId, seenAt: now }],
      deletedFor: [],
      expiresAt
    });

    await ChatModel.findByIdAndUpdate(input.chatId, {
      latestMessage: message.id,
      updatedAt: now,
      lastActivityAt: now
    });
    await cacheService.invalidateChatLists(participantIds);

    const populatedMessage = await MessageModel.findById(message.id)
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender' },
        select: 'sender type createdAt'
      });

    if (!populatedMessage) {
      throw new AppError(
        'Message was created but could not be loaded',
        500,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    const dto = {
      ...mapMessageDto(populatedMessage),
      clientMessageId: input.clientMessageId ?? null
    } as MessageDto;

    if (io) {
      participantIds.forEach((participantId) => {
        io.to(userRoom(participantId)).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
          chatId: input.chatId,
          message: dto
        });
      });

      io.to(userRoom(senderId)).emit(SOCKET_EVENTS.MESSAGE_ACK, {
        chatId: input.chatId,
        clientMessageId: input.clientMessageId ?? null,
        message: dto
      });

      notificationsService.emitMessageNotification(io, {
        chat,
        message: populatedMessage,
        sender: populatedMessage.sender,
        recipientIds: participantIds.filter((participantId) => participantId !== senderId)
      });
    }

    return dto;
  },

  async listMessages(userId: string, chatId: string, page: number, limit: number) {
    const result = await chatsService.listChatMessages(userId, chatId, page, limit);

    return {
      messages: result.messages.map(mapMessageDto),
      meta: result.meta
    };
  },

  async searchMessages(userId: string, chatId: string, query: string, limit: number): Promise<MessageSearchResultDto[]> {
    const chat = await chatsService.assertMember(chatId, userId);
    const regex = new RegExp(escapeRegex(query.trim()), 'i');
    const orFilters: Array<Record<string, RegExp>> = [{ 'attachment.fileName': regex }];

    if (chat.isGroupChat) {
      orFilters.unshift({ ciphertext: regex });
    }

    const messages = await MessageModel.find({
      chat: chatId,
      $or: orFilters
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender');

    return messages.map((message) => {
      const sender = message.sender as { name?: string } | null;
      const senderName = sender?.name ?? 'Unknown sender';
      const attachmentName = message.attachment?.fileName ?? null;
      const previewText =
        chat.isGroupChat && regex.test(message.ciphertext)
          ? message.ciphertext.slice(0, 180)
          : attachmentName && regex.test(attachmentName)
            ? `Attachment: ${attachmentName}`
            : `Message from ${senderName}`;
      const matchSource: MessageSearchResultDto['matchSource'] =
        chat.isGroupChat && regex.test(message.ciphertext)
          ? 'ciphertext'
          : 'attachment';

      return mapMessageSearchResultDto(message, previewText, matchSource);
    });
  },

  async markMessagesSeen(userId: string, chatId: string, io?: Server) {
    await chatsService.assertMember(chatId, userId);

    const unseenMessages = await MessageModel.find({
      chat: chatId,
      sender: { $ne: userId },
      'seenBy.user': { $ne: userId }
    }).select('_id');

    if (unseenMessages.length === 0) {
      return [];
    }

    const now = new Date();

    await MessageModel.updateMany(
      {
        _id: { $in: unseenMessages.map((message) => message._id) }
      },
      {
        $set: {
          status: 'seen'
        },
        $push: {
          seenBy: {
            user: new Types.ObjectId(userId),
            seenAt: now
          }
        }
      }
    );

    const messageIds = unseenMessages.map((message) => message.id);
    const participantIds = await chatsService.getChatParticipants(chatId);
    await cacheService.invalidateChatLists(participantIds);

    if (io) {
      participantIds.forEach((participantId) => {
        io.to(userRoom(participantId)).emit(SOCKET_EVENTS.MESSAGES_SEEN, {
          chatId,
          userId,
          messageIds
        });
      });
    }

    return messageIds;
  },

  async syncMissedMessages(userId: string, chatId: string, after: string) {
    await chatsService.assertMember(chatId, userId);

    const since = new Date(after);
    const messages = await MessageModel.find({
      chat: chatId,
      createdAt: { $gt: since }
    })
      .sort({ createdAt: 1 })
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender' },
        select: 'sender type createdAt'
      });

    return messages.map(mapMessageDto);
  },

  async reactToMessage(userId: string, messageId: string, emoji: string, io?: Server) {
    const message = await MessageModel.findById(messageId);

    if (!message) {
      throw new AppError('Message not found', 404, ERROR_CODES.NOT_FOUND);
    }

    await chatsService.assertMember(message.chat.toString(), userId);

    const normalizedEmoji = emoji.trim();
    const currentReaction = message.reactions.find((reaction) => reaction.emoji === normalizedEmoji);
    const userObjectId = new Types.ObjectId(userId);

    if (!currentReaction) {
      message.reactions.push({
        emoji: normalizedEmoji,
        userIds: [userObjectId]
      });
    } else if (currentReaction.userIds.some((id) => id.toString() === userId)) {
      currentReaction.userIds = currentReaction.userIds.filter((id) => id.toString() !== userId);
      message.reactions = message.reactions.filter((reaction) => reaction.userIds.length > 0);
    } else {
      currentReaction.userIds.push(userObjectId);
    }

    await message.save();

    const populated = await MessageModel.findById(message.id)
      .populate('sender')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender' },
        select: 'sender type createdAt'
      });

    if (!populated) {
      throw new AppError('Updated message could not be loaded', 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    const dto = mapMessageDto(populated);

    if (io) {
      const participantIds = await chatsService.getChatParticipants(message.chat.toString());
      participantIds.forEach((participantId) => {
        io.to(userRoom(participantId)).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
          chatId: message.chat.toString(),
          message: dto
        });
      });
    }

    return dto;
  },

  async purgeExpiredMessages() {
    const now = new Date();
    const expiredMessages = await MessageModel.find({
      expiresAt: { $lte: now }
    }).select('_id chat');

    if (expiredMessages.length === 0) {
      return 0;
    }

    const affectedChatIds = [...new Set(expiredMessages.map((message) => message.chat.toString()))];

    await MessageModel.deleteMany({
      _id: { $in: expiredMessages.map((message) => message._id) }
    });

    await Promise.all(
      affectedChatIds.map(async (chatId) => {
        const latestMessage = await MessageModel.findOne({ chat: chatId }).sort({ createdAt: -1 });
        await ChatModel.findByIdAndUpdate(chatId, {
          latestMessage: latestMessage?._id ?? null,
          lastActivityAt: latestMessage?.createdAt ?? now,
          updatedAt: latestMessage?.createdAt ?? now
        });
      })
    );

    return expiredMessages.length;
  }
};
