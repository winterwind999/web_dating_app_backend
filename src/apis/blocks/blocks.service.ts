import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
  ) {}

  async create(createBlockDto: CreateBlockDto): Promise<BlockDocument> {
    const newBlock = new this.blockModel(createBlockDto);

    const { data: block, error: errorBlock } = await tryCatch(newBlock.save());

    if (errorBlock) {
      throw new InternalServerErrorException(
        `Failed to create new Block: ${errorBlock.message}`,
      );
    }

    return block;
  }

  async update(
    blockId: string,
    updateBlockDto: UpdateBlockDto,
  ): Promise<BlockDocument> {
    if (!isObjectIdOrHexString(blockId)) {
      throw new BadRequestException('Invalid Block ID format');
    }

    const { data: block, error: errorBlock } = await tryCatch(
      this.blockModel
        .findByIdAndUpdate(blockId, updateBlockDto, {
          new: true,
          runValidators: true,
        })
        .exec(),
    );

    if (errorBlock) {
      throw new InternalServerErrorException(
        `Failed to update Block: ${errorBlock.message}`,
      );
    }

    if (!block) {
      throw new NotFoundException('Updated Block not found');
    }

    return block;
  }
}
