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
import { CloudinaryService } from 'src/helpers/cloudinary/cloudinary.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Album } from 'src/utils/constants';
import { geocoder } from 'src/utils/geocoder';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UploadAlbumsDto } from './dtos/upload-albums.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(
    page: number = 0,
    search: string = '',
  ): Promise<{ users: UserDocument[]; totalPages: number }> {
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
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<UserDocument[]>()
          .exec(),
      ),
      tryCatch(this.userModel.countDocuments(filter).exec()),
    ]);

    if (errorUsers) {
      throw new InternalServerErrorException(
        `Failed to get Users: ${errorUsers.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Users count: ${errorCount.message}`,
      );
    }

    const totalPages = Math.ceil(count / limit);

    return {
      users,
      totalPages,
    };
  }

  async findOne(userId: string): Promise<UserDocument> {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel
        .findById(userId)
        .select('-password')
        .lean<UserDocument>()
        .exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
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
        `Failed to check Email Address: ${errorDuplicateEmail.message}`,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch<string>(
      bcrypt.hash(createUserDto.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        `Failed to encrypt Password: ${errorHashedPwd.message}`,
      );
    }

    const fullAddress = `${createUserDto.address.street || ''} ${createUserDto.address.city}, ${createUserDto.address.province}, ${createUserDto.address.country}`;

    const { data: geoData, error: geoError } = await tryCatch(
      geocoder.geocode(fullAddress),
    );

    if (geoError) {
      throw new InternalServerErrorException(
        `Failed to geocode address: ${geoError.message}`,
      );
    }

    let coordinates: number[] = [];
    if (geoData && geoData.length > 0) {
      // NodeGeocoder returns { latitude, longitude }
      coordinates = [geoData[0].longitude!, geoData[0].latitude!];
    }

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPwd,
      address: {
        ...createUserDto.address,
        coordinates,
      },
    });

    const { data: user, error: errorUser } = await tryCatch(newUser.save());

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to create new User: ${errorUser.message}`,
      );
    }

    user.password = '';

    return user;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: duplicateEmail, error: errorDuplicateEmail } = await tryCatch(
      this.findByField('email', updateUserDto.email!, userId),
    );

    if (errorDuplicateEmail) {
      throw new InternalServerErrorException(
        `Failed to check Email Address: ${errorDuplicateEmail.message}`,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.findByField('email', updateUserDto.email!),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to check Email Address: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let newPwd: string = user.password;
    if (updateUserDto.password) {
      const { data: hashedPwd, error: errorHashedPwd } = await tryCatch<string>(
        bcrypt.hash(updateUserDto.password, 10),
      );

      if (errorHashedPwd) {
        throw new InternalServerErrorException(
          `Failed to encrypt Password: ${errorHashedPwd.message}`,
        );
      }

      newPwd = hashedPwd;
    }

    const fullAddress = `${updateUserDto.address?.street || ''} ${updateUserDto.address?.city}, ${updateUserDto.address?.province}, ${updateUserDto.address?.country}`;

    const { data: geoData, error: geoError } = await tryCatch(
      geocoder.geocode(fullAddress),
    );

    if (geoError) {
      throw new InternalServerErrorException(
        `Failed to geocode address: ${geoError.message}`,
      );
    }

    let coordinates: number[] = [];
    if (geoData && geoData.length > 0) {
      // NodeGeocoder returns { latitude, longitude }
      coordinates = [geoData[0].longitude!, geoData[0].latitude!];
    }

    const { data: updateUser, error: errorUpdateUser } = await tryCatch(
      this.userModel
        .findByIdAndUpdate(
          userId,
          {
            ...updateUserDto,
            password: newPwd,
            address: {
              ...updateUserDto.address,
              coordinates,
            },
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec(),
    );

    if (errorUpdateUser) {
      throw new InternalServerErrorException(
        `Failed to update User: ${errorUpdateUser.message}`,
      );
    }

    if (!updateUser) {
      throw new NotFoundException('User not found');
    }

    updateUser.password = '';

    return updateUser;
  }

  async uploadPhoto(userId: string, photo: Express.Multer.File) {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel.findById(userId).select('-password').exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.photo?.public_id) {
      const { error: errorDelete } = await tryCatch(
        this.cloudinaryService.destroyMedia(user.photo.public_id),
      );

      if (errorDelete) {
        throw new InternalServerErrorException(
          `Failed to delete a photo in Cloudinary: ${user.photo.public_id}, ${errorDelete.message}`,
        );
      }
    }

    const { data: uploadedPhoto, error: errorUploadedPhoto } = await tryCatch(
      this.cloudinaryService.uploadBuffer(photo, 'dating-app'),
    );

    if (errorUploadedPhoto) {
      throw new InternalServerErrorException(
        `Failed to upload photo to Cloudinary: ${errorUploadedPhoto.message}`,
      );
    }

    user.photo!.public_id = uploadedPhoto.public_id;
    user.photo!.secure_url = uploadedPhoto.secure_url;

    const { error: errorUpdate } = await tryCatch(user.save());

    if (errorUpdate) {
      throw new NotFoundException(
        `Failed to update User: ${errorUpdate.message}`,
      );
    }

    return user;
  }

  async uploadAlbums(
    userId: string,
    uploadAlbumsDto: UploadAlbumsDto,
    albums: Express.Multer.File[],
  ) {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel.findById(userId).exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingAlbums = user.albums || [];
    const uploadedAlbums = uploadAlbumsDto.albums || [];

    const deletedAlbums = existingAlbums.filter(
      (album) =>
        !uploadedAlbums.some((uploadedAlbum) => uploadedAlbum.id === album.id),
    );

    for (const deletedAlbum of deletedAlbums) {
      const { error: errorDelete } = await tryCatch(
        this.cloudinaryService.destroyMedia(deletedAlbum.public_id),
      );

      if (errorDelete) {
        throw new InternalServerErrorException(
          `Failed to delete an album in Cloudinary: ${deletedAlbum.public_id}, ${errorDelete.message}`,
        );
      }
    }

    const finalAlbums: Album[] = [];

    for (const uploadedAlbum of uploadedAlbums) {
      const album = albums.find(
        (file) => file.originalname === uploadedAlbum.filename,
      );

      if (album) {
        const { data: result, error: errorResult } = await tryCatch(
          this.cloudinaryService.uploadBuffer(album, 'dating-app'),
        );

        if (errorResult) {
          throw new InternalServerErrorException(
            `Failed to upload album ${album.originalname} to Cloudinary: ${errorResult.message}`,
          );
        }

        finalAlbums.push({
          id: uploadedAlbum.id,
          public_id: result.public_id,
          secure_url: result.secure_url,
          type: uploadedAlbum.type,
        });
      } else {
        const existing = existingAlbums.find(
          (existingAlbum) => existingAlbum.id === uploadedAlbum.id,
        );

        if (existing) {
          finalAlbums.push(existing);
        }
      }
    }

    user.albums = finalAlbums;

    const { data: update, error: errorUpdate } = await tryCatch(user.save());

    if (errorUpdate) {
      throw new InternalServerErrorException(
        `Failed to update User: ${errorUpdate.message}`,
      );
    }

    update.password = '';

    return update;
  }

  async removeAlbum(userId: string, albumId: number) {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.userModel.findById(userId).exec(),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const album = user.albums.find((album) => album.id === albumId);

    if (!album) {
      throw new NotFoundException(`Album ${albumId} not found`);
    }

    const { error: errorDelete } = await tryCatch(
      this.cloudinaryService.destroyMedia(album.public_id),
    );

    if (errorDelete) {
      throw new InternalServerErrorException(
        `Failed to delete album ${albumId} in Cloudinary: ${errorDelete.message}`,
      );
    }

    const filteredAlbums = user.albums.filter((album) => album.id !== albumId);

    user.albums = filteredAlbums;

    const { data: update, error: errorUpdate } = await tryCatch(user.save());

    if (errorUpdate) {
      throw new InternalServerErrorException(
        `Failed to update User: ${errorUpdate.message}`,
      );
    }

    update.password = '';

    return update;
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
