import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from 'src/schemas/match.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<MatchDocument> {
    const newMatch = new this.matchModel(createMatchDto);

    const { data: match, error: errorMatch } = await tryCatch(newMatch.save());

    if (errorMatch) {
      throw new InternalServerErrorException(
        'Failed to create new Match:',
        errorMatch.message,
      );
    }

    return match;
  }
}
