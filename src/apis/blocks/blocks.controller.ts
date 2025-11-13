import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { tryCatch } from 'src/utils/tryCatch';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  async create(@Body() createBlockDto: CreateBlockDto) {
    const { error } = await tryCatch(this.blocksService.create(createBlockDto));

    if (error) {
      throw error;
    }

    return { message: 'User blocked' };
  }

  @Patch(':blockId')
  update(
    @Param('blockId') blockId: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(blockId, updateBlockDto);
  }
}
