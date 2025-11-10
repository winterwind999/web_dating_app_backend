import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':userId')
  findAll(
    @Param('userId') userId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
  ) {
    return this.matchesService.findAll(userId, page, search);
  }

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }
}
