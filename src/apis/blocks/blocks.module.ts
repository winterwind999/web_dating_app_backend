import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Block.name,
        schema: BlockSchema,
      },
    ]),
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
