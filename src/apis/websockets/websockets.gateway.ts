import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  type ChatPayload,
  type NotificationPayload,
} from 'src/utils/constants';
import { tryCatch } from 'src/utils/tryCatch';
import { ChatsService } from '../chats/chats.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(WebsocketsGateway.name);

  constructor(
    private readonly chatsService: ChatsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('newUser')
  async handleNewUser(
    @MessageBody() userId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!userId) {
      this.logger.warn('newUser called without userId');
      return;
    }

    const roomName = `user:${userId}`;
    socket.join(roomName);

    this.logger.log(
      `User ${userId} joined room "${roomName}" with socket ${socket.id}`,
    );

    const rooms = Array.from(socket.rooms);
    this.logger.log(`Socket ${socket.id} is now in rooms: ${rooms.join(', ')}`);
  }

  @SubscribeMessage('logout')
  handleLogout(
    @MessageBody() userId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!userId) {
      return;
    }
    socket.leave(`user:${userId}`);
    this.logger.log(`User ${userId} logged out`);
  }

  @SubscribeMessage('sendChat')
  async handleSendChat(
    @MessageBody()
    payload: ChatPayload,
  ) {
    this.logger.log('backend sendChatsendChatsendChatsendChat');

    const senderRoom = `user:${payload.senderUser}`;
    const receiverRoom = `user:${payload.receiverUser}`;

    const { data: chat, error: errorChat } = await tryCatch(
      this.chatsService.create(payload),
    );

    if (errorChat) {
      this.server.to(senderRoom).emit('receiveChat', {
        isError: true,
        errorMessage: errorChat.message,
      });
      return;
    }

    const { data: populatedChat, error: errorPopulatedChat } = await tryCatch(
      this.chatsService.findOne(chat._id.toString()),
    );

    if (errorPopulatedChat) {
      this.server.to(senderRoom).emit('receiveChat', {
        isError: true,
        errorMessage: errorPopulatedChat.message,
      });
      return;
    }

    this.server.to(senderRoom).emit('receiveChat', {
      chat: populatedChat,
    });

    this.server.to(receiverRoom).emit('receiveChat', {
      chat: populatedChat,
    });

    this.logger.log(`Chat sent from ${senderRoom} to ${receiverRoom}`);
  }

  async handleReceiveNotification(
    @MessageBody()
    payload: NotificationPayload,
  ) {
    const receiverRoom = `user:${payload.user}`;

    const { data: notification, error: errorNotification } = await tryCatch(
      this.notificationsService.create(payload),
    );

    if (errorNotification) {
      this.server.to(receiverRoom).emit('receiveNotification', {
        isError: true,
        errorMessage: errorNotification.message,
      });
      return;
    }

    this.server.to(receiverRoom).emit('receiveNotification', {
      notification: notification,
    });

    this.logger.log(`Notification sent to ${receiverRoom}`);
  }
}
