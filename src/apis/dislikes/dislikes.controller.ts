import { Body, Controller, Post } from '@nestjs/common';
import { DislikesService } from './dislikes.service';
import { CreateDislikeDto } from './dto/create-dislike.dto';

@Controller('dislikes')
export class DislikesController {
  constructor(private readonly dislikesService: DislikesService) {}

  @Post()
  create(@Body() createDislikeDto: CreateDislikeDto) {
    return this.dislikesService.create(createDislikeDto);
  }
}
