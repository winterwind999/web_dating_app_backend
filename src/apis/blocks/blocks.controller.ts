import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(createBlockDto);
  }

  @Patch(':blockId')
  update(
    @Param('blockId') blockId: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(blockId, updateBlockDto);
  }
}
