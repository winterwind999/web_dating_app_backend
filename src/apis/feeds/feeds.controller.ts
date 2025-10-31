import { Controller, Get, Param } from '@nestjs/common';
import { FeedsService } from './feeds.service';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.feedsService.findOne(userId);
  }
}
