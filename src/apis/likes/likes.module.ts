import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from 'src/schemas/like.schema';
import { MatchesModule } from '../matches/matches.module';
import { UsersModule } from '../users/users.module';
import { WebsocketsModule } from '../websockets/websockets.module';
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
    MatchesModule,
    WebsocketsModule,
    UsersModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
