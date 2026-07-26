import type { Server } from 'socket.io';

import { mapNotificationDto } from '../../services/mapper.service';
import { SOCKET_EVENTS, userRoom } from '../../sockets/socket.constants';

export const notificationsService = {
  emitMessageNotification(io: Server | undefined, params: { chat: any; message: any; sender: any; recipientIds: string[] }) {
    if (!io) {
      return;
    }

    const notification = mapNotificationDto(params.message, params.chat, params.sender);

    params.recipientIds.forEach((recipientId) => {
      io.to(userRoom(recipientId)).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
    });
  }
};
