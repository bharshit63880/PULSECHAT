import { describe, expect, it, vi } from 'vitest';

const findOneMock = vi.fn();
const assertMemberMock = vi.fn();
const mapMessageDtoMock = vi.fn();

vi.mock('../src/models/Chat', () => ({
  ChatModel: {}
}));

vi.mock('../src/models/Message', () => ({
  MessageModel: {
    findOne: findOneMock
  }
}));

vi.mock('../src/services/cache.service', () => ({
  cacheService: {}
}));

vi.mock('../src/services/mapper.service', () => ({
  mapMessageDto: mapMessageDtoMock
}));

vi.mock('../src/sockets/socket.constants', () => ({
  SOCKET_EVENTS: {},
  userRoom: vi.fn()
}));

vi.mock('../src/modules/chats/chats.service', () => ({
  chatsService: {
    assertMember: assertMemberMock
  }
}));

vi.mock('../src/modules/notifications/notifications.service', () => ({
  notificationsService: {}
}));

vi.mock('../src/modules/presence/presence.service', () => ({
  presenceService: {}
}));

describe('message idempotency', () => {
  it('looks up a client message id only within the authenticated sender scope', async () => {
    const existingQuery = { populate: vi.fn() };
    existingQuery.populate.mockReturnValueOnce(existingQuery).mockResolvedValueOnce({ id: 'message-id' });
    findOneMock.mockReturnValue(existingQuery);
    assertMemberMock.mockResolvedValue({});
    mapMessageDtoMock.mockReturnValue({ id: 'message-id' });

    const { messagesService } = await import('../src/modules/messages/messages.service');

    await expect(
      messagesService.sendMessage('sender-id', {
        chatId: 'chat-id',
        clientMessageId: 'client-message-id',
        senderDeviceId: 'sender-device',
        recipientDeviceId: 'recipient-device',
        type: 'text',
        ciphertext: 'encrypted-payload',
        encryptionVersion: 'dm-e2ee-v1',
        iv: 'iv',
        digest: 'digest'
      })
    ).resolves.toEqual({ id: 'message-id' });

    expect(findOneMock).toHaveBeenCalledWith({
      sender: 'sender-id',
      clientMessageId: 'client-message-id'
    });
  });
});
