import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
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
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: {
    origin: '*', // tighten in prod
    credentials: true,
  },
  namespace: '/chats',
})
@Injectable()
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatsGateway.name);

  constructor(
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

  // helper to emit to a user's room
  emitToUser(userId: string, event: string, payload: any) {
    if (!this.server) return;
    // users should join room named `user:${userId}` or just userId
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // we'll wait for explicit 'join' with userId
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // client should emit { userId } to join their room
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { userId } = payload || {};
    if (!userId) return;
    socket.join(`user:${userId}`);
    this.logger.log(`Socket ${socket.id} joined user:${userId}`);
    // optionally send ack
    socket.emit('joined', { ok: true, userId });
  }

  // leaving room
  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() payload: { userId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { userId } = payload || {};
    if (!userId) return;
    socket.leave(`user:${userId}`);
    socket.emit('left', { ok: true, userId });
  }

  // handle send message via socket (shortcut) — service will emit result
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: any,
    @ConnectedSocket() socket: Socket,
  ) {
    // payload must include { conversationId, sender, content, type? } OR { receiverId, sender, content } to create conversation
    try {
      // ensure required fields exist
      if (!payload.sender) {
        socket.emit('error', { message: 'sender is required' });
        return;
      }
      // if conversationId given, call service sendMessage
      if (payload.conversationId) {
        const result = await this.chatsService?.sendMessage(payload);
        socket.emit('message:sent', result);
      } else if (payload.receiverId && payload.sender) {
        // find or create conversation then send
        // Attempt to get conversation between sender & receiver
        // We use a small helper in service by calling getConversationMessages (which creates conv if not exists)
        const convRes = await this.chatsService?.getConversationMessages(
          payload.sender,
          payload.receiverId,
          { page: 1, limit: 1 },
        );
        if (!convRes?.conversationId) {
          throw new Error('Conversation ID not found');
        }
        const conversationId = convRes?.conversationId;
        const result = await this.chatsService?.sendMessage({
          conversationId: conversationId?.toString(),
          sender: payload.sender,
          content: payload.content,
          type: payload.type,
        });
        socket.emit('message:sent', result);
      } else {
        socket.emit('error', { message: 'invalid payload' });
      }
    } catch (err) {
      socket.emit('error', { message: err.message || 'send failed' });
    }
  }

  // mark message seen via socket
  @SubscribeMessage('markSeen')
  async handleMarkSeen(
    @MessageBody()
    payload: {
      conversationId: string;
      messageId: string;
      userId: string;
    },
  ) {
    if (!payload) return;
    const { conversationId, messageId, userId } = payload;
    await this.chatsService?.markMessageSeen(conversationId, messageId, userId);
    // service will broadcast seen event
  }
}
