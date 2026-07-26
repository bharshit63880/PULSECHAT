import { ERROR_CODES } from '../../constants/http';
import { AppError } from '../../errors/AppError';
import { ChatModel } from '../../models/Chat';
import { cacheService } from '../../services/cache.service';
import { mapChatDto } from '../../services/mapper.service';
import { chatsService } from '../chats/chats.service';

const groupPopulate = [
  { path: 'participants' },
  { path: 'admins' },
  {
    path: 'latestMessage',
    populate: [{ path: 'sender' }, { path: 'replyTo', populate: { path: 'sender' } }]
  }
];

export const groupsService = {
  async createGroup(userId: string, name: string, participantIds: string[]) {
    const participants = [...new Set([userId, ...participantIds])];

    if (participants.length < 3) {
      throw new AppError(
        'A group chat needs at least three unique members including the creator',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const group = await ChatModel.create({
      isGroupChat: true,
      encryptionMode: 'server-group',
      name,
      participants,
      admins: [userId],
      createdBy: userId,
      disappearingModeSeconds: 0,
      lastActivityAt: new Date()
    });

    const populated = await ChatModel.findById(group.id).populate(groupPopulate);

    if (!populated) {
      throw new AppError('Group could not be created', 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    await cacheService.invalidateChatLists(participants);

    return mapChatDto(populated, 0);
  },

  async renameGroup(userId: string, chatId: string, name: string) {
    const group = await this.getAdminGroup(chatId, userId);
    group.name = name;
    await group.save();

    const refreshed = await ChatModel.findById(chatId).populate(groupPopulate);

    if (!refreshed) {
      throw new AppError('Group not found after update', 404, ERROR_CODES.NOT_FOUND);
    }

    await cacheService.invalidateChatLists(refreshed.participants.map((participant) => participant.toString()));

    return chatsService.attachUnreadCount(refreshed, userId);
  },

  async addMember(userId: string, chatId: string, memberId: string) {
    const group = await this.getAdminGroup(chatId, userId);

    if (group.participants.some((participant) => participant.toString() === memberId)) {
      throw new AppError('User is already in the group', 409, ERROR_CODES.CONFLICT);
    }

    group.participants.push(memberId as any);
    await group.save();

    const refreshed = await ChatModel.findById(chatId).populate(groupPopulate);

    if (!refreshed) {
      throw new AppError('Group not found after update', 404, ERROR_CODES.NOT_FOUND);
    }

    await cacheService.invalidateChatLists(refreshed.participants.map((participant) => participant.toString()));

    return chatsService.attachUnreadCount(refreshed, userId);
  },

  async removeMember(userId: string, chatId: string, memberId: string) {
    const group = await this.getAdminGroup(chatId, userId);

    group.participants = group.participants.filter((participant) => participant.toString() !== memberId);
    group.admins = group.admins.filter((admin) => admin.toString() !== memberId);

    if (group.participants.length < 2) {
      throw new AppError('Group must keep at least two members', 400, ERROR_CODES.BAD_REQUEST);
    }

    await group.save();

    const refreshed = await ChatModel.findById(chatId).populate(groupPopulate);

    if (!refreshed) {
      throw new AppError('Group not found after update', 404, ERROR_CODES.NOT_FOUND);
    }

    await cacheService.invalidateChatLists(refreshed.participants.map((participant) => participant.toString()));

    return chatsService.attachUnreadCount(refreshed, userId);
  },

  async getAdminGroup(chatId: string, userId: string) {
    const group = await ChatModel.findOne({
      _id: chatId,
      isGroupChat: true,
      participants: userId
    });

    if (!group) {
      throw new AppError('Group chat not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (!group.admins.some((admin) => admin.toString() === userId)) {
      throw new AppError('Only group admins can perform this action', 403, ERROR_CODES.FORBIDDEN);
    }

    return group;
  }
};
