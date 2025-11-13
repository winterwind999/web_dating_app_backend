import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from 'src/schemas/like.schema';
import { type NotificationPayload } from 'src/utils/constants';
import { tryCatch } from 'src/utils/tryCatch';
import { MatchesService } from '../matches/matches.service';
import { UsersService } from '../users/users.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikesService {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly usersService: UsersService,
    private readonly websocketsGateway: WebsocketsGateway,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  async create(createLikeDto: CreateLikeDto): Promise<LikeDocument> {
    const newLike = new this.likeModel(createLikeDto);

    const { data: like, error: errorLike } = await tryCatch(newLike.save());

    if (errorLike) {
      throw new InternalServerErrorException(
        `Failed to create new Like: ${errorLike.message}`,
      );
    }

    const { data: reverseLike, error: errorReverseLike } = await tryCatch(
      this.likeModel
        .findOne({
          user: createLikeDto.likedUser,
          likedUser: createLikeDto.user,
        })
        .exec(),
    );

    if (errorReverseLike) {
      throw new InternalServerErrorException(
        `Failed to check reverse like: ${errorReverseLike.message}`,
      );
    }

    if (reverseLike) {
      const { error: errorMatch } = await tryCatch(
        this.matchesService.create({
          user: createLikeDto.user,
          matchedUser: createLikeDto.likedUser,
        }),
      );

      if (errorMatch) {
        throw errorMatch;
      }

      const { data: user, error: errorUser } = await tryCatch(
        this.usersService.findOne(createLikeDto.user),
      );

      if (errorUser) {
        throw errorUser;
      }

      const userPayload: NotificationPayload = {
        user: createLikeDto.likedUser,
        message: `💘 It's a match! You and ${user.firstName} ${user.lastName} are connected. Start chatting now!`,
        isRead: false,
      };

      await this.websocketsGateway.handleReceiveNotification(userPayload);

      const { data: likedUser, error: errorLikedUser } = await tryCatch(
        this.usersService.findOne(createLikeDto.likedUser),
      );

      if (errorLikedUser) {
        throw errorLikedUser;
      }

      const likedUserPayload: NotificationPayload = {
        user: createLikeDto.user,
        message: `💘 It's a match! You and ${likedUser.firstName} ${likedUser.lastName} are connected. Start chatting now!`,
        isRead: false,
      };

      await this.websocketsGateway.handleReceiveNotification(likedUserPayload);
    }

    return like;
  }
}
