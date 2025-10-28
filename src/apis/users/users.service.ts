import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(page: number = 0, search: string = '') {
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }];
    }

    const [
      { data: users, error: errorUsers },
      { data: count, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.userModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
      ),
      tryCatch(this.userModel.countDocuments(filter).exec()),
    ]);

    if (errorUsers || errorCount) {
      throw new InternalServerErrorException(
        'Failed to get Users:',
        errorUsers?.message || errorCount?.message,
      );
    }

    const totalPages = Math.ceil(count / limit);

    return {
      users,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserDocument> {
    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel
        .findById(id)
        .select('-password')
        .lean<UserDocument>()
        .exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        'Failed to get User:',
        errorUser.message,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { data: duplicateEmail, error: errorDuplicateEmail } = await tryCatch(
      this.findByField('email', createUserDto.email),
    );

    if (errorDuplicateEmail) {
      throw new InternalServerErrorException(
        'Failed to check Email Address:',
        errorDuplicateEmail.message,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch(
      bcrypt.hash(createUserDto.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        'Failed to encrypt Password:',
        errorHashedPwd.message,
      );
    }

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPwd,
    });

    const { data: user, error: errorUser } = await tryCatch(newUser.save());

    if (errorUser) {
      throw new InternalServerErrorException(
        'Failed to create new User:',
        errorUser.message,
      );
    }

    user.password = '';

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { data: duplicateEmail, error: errorDuplicateEmail } = await tryCatch(
      this.findByField('email', updateUserDto.email, id),
    );

    if (errorDuplicateEmail) {
      throw new InternalServerErrorException(
        'Failed to check Email Address:',
        errorDuplicateEmail.message,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch(
      bcrypt.hash(updateUserDto.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        'Failed to encrypt Password:',
        errorHashedPwd.message,
      );
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel
        .findByIdAndUpdate(
          id,
          { ...updateUserDto, password: hashedPwd },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        'Failed to update User:',
        errorUser.message,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = '';

    return user;
  }

  async findByField<K extends keyof UserDocument>(
    field: K,
    value: UserDocument[K],
    excludeId?: string,
  ): Promise<UserDocument | null> {
    const query: any = { [field]: value };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return this.userModel.findOne(query).exec();
  }
}
