import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Block, BlockSchema } from 'src/schemas/block.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Match.name,
        schema: MatchSchema,
      },
      {
        name: Block.name,
        schema: BlockSchema,
      },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
