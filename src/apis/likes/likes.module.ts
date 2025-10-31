import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from 'src/schemas/like.schema';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
