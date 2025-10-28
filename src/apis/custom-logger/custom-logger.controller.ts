import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';

@Controller('custom-logger')
export class CustomLoggerController {
  constructor(private readonly customLoggerService: CustomLoggerService) {}

  @Get()
  findAll(
    @Query('tab') tab: 'audit' | 'error',
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
  ) {
    return this.customLoggerService.findAll(tab, page, search);
  }

  @Get('file')
  findOne(@Query('filename') filename: string) {
    return this.customLoggerService.findOne(filename);
  }
}
