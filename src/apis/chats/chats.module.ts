import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from 'src/schemas/conversation.schema';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
