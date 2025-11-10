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
import { USER_STATUSES } from 'src/utils/constants';
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

  async getFeeds(
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

    if (user.status !== USER_STATUSES.ACTIVE) {
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
      tryCatch(this.likeModel.find({ user: userId }).distinct('likedUser')),

      tryCatch(
        this.dislikeModel.find({ user: userId }).distinct('dislikedUser'),
      ),

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

      tryCatch(this.blockModel.find({ user: userId }).distinct('blockedUser')),

      tryCatch(this.blockModel.find({ blockedUser: userId }).distinct('user')),

      tryCatch(
        this.reportModel.find({ user: userId }).distinct('reportedUser'),
      ),

      tryCatch(
        this.reportModel.find({ reportedUser: userId }).distinct('user'),
      ),
    ]);

    if (errorLikedUsers) {
      throw new InternalServerErrorException(
        `Failed to get liked Users: ${errorLikedUsers.message}`,
      );
    }

    if (errorDislikedUsers) {
      throw new InternalServerErrorException(
        `Failed to get disliked Users: ${errorDislikedUsers.message}`,
      );
    }

    if (errorMatchedUsers) {
      throw new InternalServerErrorException(
        `Failed to get matched Users: ${errorMatchedUsers.message}`,
      );
    }

    if (errorBlockedByCurrentUser) {
      throw new InternalServerErrorException(
        `Failed to get blocked by User: ${errorBlockedByCurrentUser.message}`,
      );
    }

    if (errorBlockedCurrentUser) {
      throw new InternalServerErrorException(
        `Failed to get blocks to User: ${errorBlockedCurrentUser.message}`,
      );
    }

    if (errorReportedUsers) {
      throw new InternalServerErrorException(
        `Failed to get reported by User: ${errorReportedUsers.message}`,
      );
    }

    if (errorReportedCurrentUser) {
      throw new InternalServerErrorException(
        `Failed to get reports to User: ${errorReportedCurrentUser.message}`,
      );
    }

    const excludedUserIds = new Set([
      userId,
      ...likedUsers.map((id) => id.toString()),
      ...dislikedUsers.map((id) => id.toString()),
      ...matchedUsers,
      ...blockedByCurrentUser.map((id) => id.toString()),
      ...blockedCurrentUser.map((id) => id.toString()),
      ...reportedUsers.map((id) => id.toString()),
      ...reportedCurrentUser.map((id) => id.toString()),
    ]);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const minBirthDate = new Date(
      currentYear - user.preferences.maxAge,
      currentMonth,
      currentDay,
    );

    const maxBirthDate = new Date(
      currentYear - user.preferences.minAge,
      currentMonth,
      currentDay,
    );
    maxBirthDate.setDate(maxBirthDate.getDate() + 1);

    const minBirthDateStr = minBirthDate.toISOString().split('T')[0];
    const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

    const query: any = {
      _id: { $nin: Array.from(excludedUserIds) },
      status: USER_STATUSES.ACTIVE,
      gender: { $in: user.preferences.genderPreference },
      birthday: {
        $gte: minBirthDateStr,
        $lt: maxBirthDateStr,
      },
    };
    const countQuery = { ...query };

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

      countQuery['address.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            user.address.coordinates,
            maxDistanceInMeters / 6378100,
          ],
        },
      };
    }

    const [
      { data: feeds, error: errorFeeds },
      { data: totalCount, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.userModel
          .find(query)
          .select('-password')
          .limit(1)
          .lean<UserDocument[]>()
          .exec(),
      ),
      tryCatch(this.userModel.countDocuments(countQuery).exec()),
    ]);

    if (errorFeeds) {
      throw new InternalServerErrorException(
        `Failed to get Feeds: ${errorFeeds.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Feeds count: ${errorCount.message}`,
      );
    }

    return {
      feeds,
      message: '',
      total: totalCount,
    };
  }
}
