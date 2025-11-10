import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dtos/create-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':matchId')
  findAll(
    @Param('matchId') matchId: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.chatsService.findAll(matchId, page);
  }

  @Post()
  create(@Body(ValidationPipe) createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }
}
