import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dislike, DislikeSchema } from 'src/schemas/dislike.schema';
import { DislikesController } from './dislikes.controller';
import { DislikesService } from './dislikes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Dislike.name,
        schema: DislikeSchema,
      },
    ]),
  ],
  controllers: [DislikesController],
  providers: [DislikesService],
})
export class DislikesModule {}
