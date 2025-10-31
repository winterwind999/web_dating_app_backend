// src/chats/chats.service.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from 'src/schemas/conversation.schema';
import { Message, MessageDocument } from 'src/schemas/message.schema';
import { ChatsGateway } from './chats.gateway';
import { CreateMessageDto } from './dtos/create-message.dto';
import { PaginationDto } from './dtos/pagination.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @Inject(forwardRef(() => ChatsGateway)) private gateway: ChatsGateway,
  ) {}

  // List conversations where user participates. Populate counterpart user and lastMessage.
  async findAllConversationsForUser(userId: string) {
    const uid = new Types.ObjectId(userId);

    // Find conversations that include userId
    const conversations = await this.conversationModel
      .find({ participants: uid })
      .sort({ lastMessageAt: -1 })
      .populate([
        {
          path: 'participants',
          select: '_id firstName lastName avatar', // adjust fields to your User schema
        },
        {
          path: 'lastMessage',
          select: 'content sender type createdAt',
        },
      ])
      .lean();

    // Transform to attach the other participant, unread count for user
    const result = conversations.map((conv: any) => {
      const participants: any[] = conv.participants || [];
      const other =
        participants.find((p) => p._id.toString() !== userId) ||
        participants[0];

      // unreadCount stored as Map<string, number> -> when lean it becomes object
      const unread = conv.unreadCount
        ? (conv.unreadCount[userId]?.valueOf?.() ??
          conv.unreadCount[userId] ??
          0)
        : 0;

      return {
        conversationId: conv._id,
        other,
        lastMessage: conv.lastMessage || null,
        lastMessageAt: conv.lastMessageAt || conv.updatedAt,
        unreadCount: typeof unread === 'number' ? unread : Number(unread) || 0,
      };
    });

    return result;
  }

  // Get or create conversation between userId & receiverId; return messages (paginated)
  async getConversationMessages(
    userId: string,
    receiverId: string,
    pagination: PaginationDto,
  ) {
    const u1 = new Types.ObjectId(userId);
    const u2 = new Types.ObjectId(receiverId);

    // Find conversation with exactly those two participants (order agnostic)
    let conversation = await this.conversationModel.findOne({
      participants: { $all: [u1, u2], $size: 2 },
    });

    if (!conversation) {
      // If not found, create (participants only)
      conversation = await this.conversationModel.create({
        participants: [u1, u2],
        unreadCount: {}, // default
      });
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    // Get messages in conversation paginated, newest last (ascending createdAt)
    const messages = await this.messageModel
      .find({ conversationId: conversation._id })
      .sort({ createdAt: -1 }) // fetch newest first, then reverse for client or return as is
      .skip(skip)
      .limit(limit)
      .lean();

    // Optionally reverse to ascending chronological order:
    const orderedMessages = messages.reverse();

    return {
      conversationId: conversation._id,
      messages: orderedMessages,
      meta: {
        page,
        limit,
        count: await this.messageModel.countDocuments({
          conversationId: conversation._id,
        }),
      },
    };
  }

  // Send message: creates Message document, updates conversation (last message/at), increments unread for recipient, emits events
  async sendMessage(dto: CreateMessageDto) {
    const convId = new Types.ObjectId(dto.conversationId);
    const senderId = new Types.ObjectId(dto.sender);

    const conversation = await this.conversationModel.findById(convId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Create message
    const message = await this.messageModel.create({
      conversationId: convId,
      sender: senderId,
      content: dto.content ?? '',
      type: dto.type ?? 'text',
      status: 'SENT', // will rely on ChatStatus enum in schema; ensure string matches enum
    });

    // Update conversation last message & time
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt || new Date();

    // Determine recipient(s) — conversation has exactly 2 participants
    const participants = (conversation.participants as Types.ObjectId[]).map(
      (p) => p.toString(),
    );
    const recipientIds = participants.filter((id) => id !== dto.sender);

    // increment unreadCount for each recipient
    recipientIds.forEach((rid) => {
      const prev =
        conversation.unreadCount?.get?.(rid) ??
        conversation.unreadCount?.[rid] ??
        0;
      // Mongoose Map stored; use set if Map
      if (conversation.unreadCount instanceof Map) {
        conversation.unreadCount.set(rid, Number(prev) + 1);
      } else if (typeof conversation.unreadCount === 'object') {
        // when it's plain object
        (conversation.unreadCount as any)[rid] = Number(prev) + 1;
      } else {
        conversation.unreadCount = new Map([[rid, Number(prev) + 1]]) as any;
      }
    });

    await conversation.save();

    // Populate message sender for event
    const messagePopulated = await this.messageModel
      .findById(message._id)
      .populate('sender', '_id firstName lastName avatar')
      .lean();

    // Emit socket events to the recipient(s) and sender
    // gateway exposes Server instance and has join rooms per user id
    recipientIds.forEach((rid) => {
      this.gateway.emitToUser(rid, 'message:new', {
        conversationId: conversation._id,
        message: messagePopulated,
        unreadCount:
          conversation.unreadCount?.get?.(rid) ??
          (conversation.unreadCount as any)?.[rid] ??
          0,
      });
    });

    // notify sender as ack
    this.gateway.emitToUser(dto.sender, 'message:sent', {
      conversationId: conversation._id,
      message: messagePopulated,
    });

    return { message: messagePopulated };
  }

  // mark conversation as read by user (set unreadCount[userId] = 0)
  async markAsRead(conversationId: string, userId: string) {
    const conv = await this.conversationModel.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');

    if (conv.unreadCount instanceof Map) {
      conv.unreadCount.set(userId, 0);
    } else if (typeof conv.unreadCount === 'object') {
      (conv.unreadCount as any)[userId] = 0;
    } else {
      conv.unreadCount = new Map([[userId, 0]]) as any;
    }

    await conv.save();

    // notify user
    this.gateway.emitToUser(userId, 'conversation:read', { conversationId });

    return { ok: true };
  }

  // Mark specific message as seen by user (set message.seenAt and optionally update conversation unread)
  async markMessageSeen(
    conversationId: string,
    messageId: string,
    userId: string,
  ) {
    const msg = await this.messageModel.findById(messageId);
    if (!msg) throw new NotFoundException('Message not found');

    if (!msg.seenAt) {
      msg.seenAt = new Date();
      await msg.save();
    }

    // decrement unread count for conversation for this user to zero
    const conv = await this.conversationModel.findById(conversationId);
    if (conv) {
      if (conv.unreadCount instanceof Map) {
        conv.unreadCount.set(userId, 0);
      } else if (typeof conv.unreadCount === 'object') {
        (conv.unreadCount as any)[userId] = 0;
      } else {
        conv.unreadCount = new Map([[userId, 0]]) as any;
      }
      await conv.save();
    }

    // notify participants
    const participants =
      conv?.participants?.map((p: any) => p.toString()) ?? [];
    participants.forEach((pid) =>
      this.gateway.emitToUser(pid, 'message:seen', {
        conversationId,
        messageId,
        seenBy: userId,
        seenAt: msg.seenAt,
      }),
    );

    return { ok: true };
  }
}
