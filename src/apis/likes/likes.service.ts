import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from 'src/schemas/like.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikesService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async create(createLikeDto: CreateLikeDto): Promise<LikeDocument> {
    const newLike = new this.likeModel(createLikeDto);

    const { data: like, error: errorLike } = await tryCatch(newLike.save());

    if (errorLike) {
      throw new InternalServerErrorException(
        'Failed to create new Like:',
        errorLike.message,
      );
    }

    return like;
  }
}
