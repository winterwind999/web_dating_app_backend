import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dislike, DislikeDocument } from 'src/schemas/dislike.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateDislikeDto } from './dto/create-dislike.dto';

@Injectable()
export class DislikesService {
  constructor(
    @InjectModel(Dislike.name) private dislikeModel: Model<DislikeDocument>,
  ) {}

  async create(createDislikeDto: CreateDislikeDto): Promise<DislikeDocument> {
    const newDislike = new this.dislikeModel(createDislikeDto);

    const { data: dislike, error: errorDislike } = await tryCatch(
      newDislike.save(),
    );

    if (errorDislike) {
      throw new InternalServerErrorException(
        `Failed to create new Dislike: ${errorDislike.message}`,
      );
    }

    return dislike;
  }
}
