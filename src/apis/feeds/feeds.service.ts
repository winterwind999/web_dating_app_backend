import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { Block, BlockDocument } from 'src/schemas/block.schema';
import { Dislike, DislikeDocument } from 'src/schemas/dislike.schema';
import { Like, LikeDocument } from 'src/schemas/like.schema';
import { Match, MatchDocument } from 'src/schemas/match.schema';
import { Report, ReportDocument } from 'src/schemas/report.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserStatus } from 'src/utils/enums';
import { tryCatch } from 'src/utils/tryCatch';
import { UsersService } from '../users/users.service';

@Injectable()
export class FeedsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Dislike.name) private dislikeModel: Model<DislikeDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async findOne(
    userId: string,
  ): Promise<{ feeds: UserDocument[]; message: string; total: number }> {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.findOne(userId),
    );

    if (errorUser) {
      throw errorUser;
    }

    if (user.status !== UserStatus.ACTIVE) {
      return {
        feeds: [],
        message: 'User account is not active',
        total: 0,
      };
    }

    const [
      { data: likedUsers, error: errorLikedUsers },
      { data: dislikedUsers, error: errorDislikedUsers },
      { data: matchedUsers, error: errorMatchedUsers },
      { data: blockedByCurrentUser, error: errorBlockedByCurrentUser },
      { data: blockedCurrentUser, error: errorBlockedCurrentUser },
      { data: reportedUsers, error: errorReportedUsers },
      { data: reportedCurrentUser, error: errorReportedCurrentUser },
    ] = await Promise.all([
      // Users the current user has liked
      tryCatch(this.likeModel.find({ user: userId }).distinct('likedUser')),

      // Users the current user has disliked
      tryCatch(
        this.dislikeModel.find({ user: userId }).distinct('dislikedUser'),
      ),

      // Users the current user has matched with
      tryCatch(
        this.matchModel
          .find({
            $or: [{ user: userId }, { matchedUser: userId }],
          })
          .then((matches) => {
            return matches
              .flatMap((match) => [
                match.user.toString(),
                match.matchedUser.toString(),
              ])
              .filter((id) => id !== userId);
          }),
      ),

      // Users blocked by the current user
      tryCatch(this.blockModel.find({ user: userId }).distinct('blockedUser')),

      // Users who blocked the current user
      tryCatch(this.blockModel.find({ blockedUser: userId }).distinct('user')),

      // Users reported by the current user
      tryCatch(
        this.reportModel.find({ user: userId }).distinct('reportedUser'),
      ),

      // Users who reported the current user
      tryCatch(
        this.reportModel.find({ reportedUser: userId }).distinct('user'),
      ),
    ]);

    if (errorLikedUsers) {
      throw new InternalServerErrorException(
        'Failed to get liked Users:',
        errorLikedUsers.message,
      );
    }

    if (errorDislikedUsers) {
      throw new InternalServerErrorException(
        'Failed to get disliked Users:',
        errorDislikedUsers.message,
      );
    }

    if (errorMatchedUsers) {
      throw new InternalServerErrorException(
        'Failed to get matched Users:',
        errorMatchedUsers.message,
      );
    }

    if (errorBlockedByCurrentUser) {
      throw new InternalServerErrorException(
        'Failed to get blocked by User:',
        errorBlockedByCurrentUser.message,
      );
    }

    if (errorBlockedCurrentUser) {
      throw new InternalServerErrorException(
        'Failed to get blocks to User:',
        errorBlockedCurrentUser.message,
      );
    }

    if (errorReportedUsers) {
      throw new InternalServerErrorException(
        'Failed to get reported by User:',
        errorReportedUsers.message,
      );
    }

    if (errorReportedCurrentUser) {
      throw new InternalServerErrorException(
        'Failed to get reports to User:',
        errorReportedCurrentUser.message,
      );
    }

    const excludedUserIds = new Set([
      userId, // Exclude self
      ...likedUsers.map((id) => id.toString()),
      ...dislikedUsers.map((id) => id.toString()),
      ...matchedUsers,
      ...blockedByCurrentUser.map((id) => id.toString()),
      ...blockedCurrentUser.map((id) => id.toString()),
      ...reportedUsers.map((id) => id.toString()),
      ...reportedCurrentUser.map((id) => id.toString()),
    ]);

    // Calculate age range based on current date
    const today = new Date();
    const currentYear = today.getFullYear();

    const minBirthDate = new Date(
      currentYear - user.preferences.maxAge - 1,
      today.getMonth(),
      today.getDate(),
    );

    const maxBirthDate = new Date(
      currentYear - user.preferences.minAge,
      today.getMonth(),
      today.getDate(),
    );

    // Build the query
    const query: any = {
      _id: { $nin: Array.from(excludedUserIds) },
      status: UserStatus.ACTIVE,
      gender: { $in: user.preferences.genderPreference },
      birthday: {
        $gte: minBirthDate,
        $lte: maxBirthDate,
      },
    };

    // Add geospatial query if user has coordinates
    if (user.address.coordinates && user.address.coordinates.length === 2) {
      const maxDistanceInMeters = user.preferences.maxDistance * 1000;

      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.address.coordinates,
          },
          $maxDistance: maxDistanceInMeters,
        },
      };
    }

    const { data: feeds, error: errorFeeds } = await tryCatch(
      this.userModel
        .find(query)
        .select('-password')
        .limit(50)
        .lean<UserDocument[]>()
        .exec(),
    );

    if (errorFeeds) {
      throw new InternalServerErrorException(
        'Failed to get Feeds:',
        errorFeeds.message,
      );
    }

    return {
      feeds,
      message: '',
      total: feeds.length,
    };
  }
}
