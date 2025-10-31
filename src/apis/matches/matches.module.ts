import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Match.name,
        schema: MatchSchema,
      },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
