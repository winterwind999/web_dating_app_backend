import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  findAll(
    @Param('userId') userId: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.notificationsService.findAll(userId, page);
  }

  @Post()
  create(@Body(ValidationPipe) createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Patch(':userId')
  update(@Param('userId') userId: string) {
    return this.notificationsService.update(userId);
  }
}
