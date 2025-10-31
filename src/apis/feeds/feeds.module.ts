import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { Dislike, DislikeSchema } from 'src/schemas/dislike.schema';
import { Like, LikeSchema } from 'src/schemas/like.schema';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { Report, ReportSchema } from 'src/schemas/report.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Like.name,
        schema: LikeSchema,
      },
      {
        name: Dislike.name,
        schema: DislikeSchema,
      },
      {
        name: Match.name,
        schema: MatchSchema,
      },
      {
        name: Block.name,
        schema: BlockSchema,
      },
      {
        name: Report.name,
        schema: ReportSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}
