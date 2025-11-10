import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateChatDto } from './dtos/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async findAll(
    matchId: string,
    page: number,
  ): Promise<{ chats: ChatDocument[]; totalPages: number }> {
    if (!isObjectIdOrHexString(matchId)) {
      throw new BadRequestException('Invalid Match ID format');
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    const [
      { data: chats, error: errorChats },
      { data: totalCount, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.chatModel
          .find({ match: matchId })
          .populate([
            {
              path: 'senderUser',
              select: 'photo firstName middleName lastName',
            },
            {
              path: 'receiverUser',
              select: 'photo firstName middleName lastName',
            },
          ])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<ChatDocument[]>()
          .exec(),
      ),
      tryCatch(this.chatModel.countDocuments({ match: matchId }).exec()),
    ]);

    if (errorChats) {
      throw new InternalServerErrorException(
        `Failed to get Chats: ${errorChats.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Chats count: ${errorCount.message}`,
      );
    }

    const totalPages = Math.ceil(totalCount / limit);

    const orderedChats = chats.reverse();

    return { chats: orderedChats, totalPages };
  }

  async findOne(chatId: string): Promise<ChatDocument> {
    if (!isObjectIdOrHexString(chatId)) {
      throw new BadRequestException('Invalid Chat ID format');
    }

    const { data: chat, error: errorChat } = await tryCatch(
      this.chatModel
        .findById(chatId)
        .populate(
          'senderUser receiverUser',
          'photo firstName middleName lastName',
        )
        .lean<ChatDocument>()
        .exec(),
    );

    if (errorChat) {
      throw new InternalServerErrorException(
        `Failed to get Chat: ${errorChat.message}`,
      );
    }

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async create(createChatDto: CreateChatDto): Promise<ChatDocument> {
    const newChat = new this.chatModel(createChatDto);

    const { data: chat, error: errorChat } = await tryCatch(newChat.save());

    if (errorChat) {
      throw new InternalServerErrorException(
        `Failed to create new Chat: ${errorChat.message}`,
      );
    }

    return chat;
  }
}
