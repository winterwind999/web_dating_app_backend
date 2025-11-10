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

  async findAll(
    userId: string,
    page: number = 1,
    search: string = '',
  ): Promise<{ matches: MatchDocument[]; totalPages: number }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter: any = { $or: [{ user: userId }, { matchedUser: userId }] };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');
      filter.$and = [
        {
          $or: [
            { 'user.firstName': regex },
            { 'user.middleName': regex },
            { 'user.lastName': regex },
            { 'matchedUser.firstName': regex },
            { 'matchedUser.middleName': regex },
            { 'matchedUser.lastName': regex },
          ],
        },
      ];
    }

    const [
      { data: matches, error: errorMatches },
      { data: count, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.matchModel
          .find(filter)
          .populate([
            {
              path: 'user',
              select: 'photo firstName middleName lastName',
            },
            {
              path: 'matchedUser',
              select: 'photo firstName middleName lastName',
            },
          ])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<MatchDocument[]>()
          .exec(),
      ),
      tryCatch(this.matchModel.countDocuments(filter).exec()),
    ]);

    if (errorMatches) {
      throw new InternalServerErrorException(
        `Failed to get Matches: ${errorMatches.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Matches count: ${errorCount.message}`,
      );
    }

    const totalPages = Math.ceil(count / limit);

    return {
      matches,
      totalPages,
    };
  }

  async create(createMatchDto: CreateMatchDto): Promise<MatchDocument> {
    const { data: existingMatch, error: errorExistingMatch } = await tryCatch(
      this.matchModel
        .findOne({
          $or: [
            {
              user: createMatchDto.user,
              matchedUser: createMatchDto.matchedUser,
            },
            {
              user: createMatchDto.matchedUser,
              matchedUser: createMatchDto.user,
            },
          ],
        })
        .exec(),
    );

    if (errorExistingMatch) {
      throw new InternalServerErrorException(
        `Failed to verify existing match: ${errorExistingMatch.message}`,
      );
    }

    if (existingMatch) {
      return existingMatch;
    }

    const newMatch = new this.matchModel(createMatchDto);

    const { data: match, error: errorMatch } = await tryCatch(newMatch.save());

    if (errorMatch) {
      throw new InternalServerErrorException(
        `Failed to create new Match: ${errorMatch.message}`,
      );
    }

    return match;
  }
}
