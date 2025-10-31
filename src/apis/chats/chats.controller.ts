// src/chats/chats.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { PaginationDto } from './dtos/pagination.dto';
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':userId')
  async findAll(@Param('userId') userId: string) {
    return this.chatsService.findAllConversationsForUser(userId);
  }

  @Get(':userId/:receiverId')
  async findOne(
    @Param('userId') userId: string,
    @Param('receiverId') receiverId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatsService.getConversationMessages(
      userId,
      receiverId,
      pagination,
    );
  }

  @Post('message')
  async sendMessage(@Body() dto: CreateMessageDto) {
    if (!dto.sender) throw new BadRequestException('sender is required');
    return this.chatsService.sendMessage(dto);
  }

  @Patch(':conversationId/mark-read')
  async markRead(
    @Param('conversationId') conversationId: string,
    @Body('userId') userId: string,
  ) {
    return this.chatsService.markAsRead(conversationId, userId);
  }

  // PATCH /chats/:conversationId/mark-seen -> mark a message as seen
  @Patch(':conversationId/mark-seen')
  async markSeen(
    @Param('conversationId') conversationId: string,
    @Body('messageId') messageId: string,
    @Body('userId') userId: string,
  ) {
    return this.chatsService.markMessageSeen(conversationId, messageId, userId);
  }
}
