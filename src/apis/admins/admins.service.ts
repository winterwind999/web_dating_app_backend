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
import { Admin, AdminDocument } from 'src/schemas/admin.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async findAll(
    page: number = 0,
    search: string = '',
  ): Promise<{ admins: AdminDocument[]; totalPages: number }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ username: regex }];
    }

    const [
      { data: admins, error: errorAdmins },
      { data: count, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.adminModel
          .find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<AdminDocument[]>()
          .exec(),
      ),
      tryCatch(this.adminModel.countDocuments(filter).exec()),
    ]);

    if (errorAdmins) {
      throw new InternalServerErrorException(
        `Failed to get Admins: ${errorAdmins.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Admins count: ${errorCount.message}`,
      );
    }

    const totalPages = Math.ceil(count / limit);

    return {
      admins,
      totalPages,
    };
  }

  async findOne(adminId: string): Promise<AdminDocument> {
    if (!isObjectIdOrHexString(adminId)) {
      throw new BadRequestException('Invalid Admin ID format');
    }

    const { data: admin, error: errorAdmin } = await tryCatch(
      this.adminModel
        .findById(adminId)
        .select('-password')
        .lean<AdminDocument>()
        .exec(),
    );

    if (errorAdmin) {
      throw new InternalServerErrorException(
        `Failed to get Admin: ${errorAdmin.message}`,
      );
    }

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async create(createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    const { data: duplicateUsername, error: errorDuplicateUsername } =
      await tryCatch(this.findByField('username', createAdminDto.username));

    if (errorDuplicateUsername) {
      throw new InternalServerErrorException(
        `Failed to check Username: ${errorDuplicateUsername.message}`,
      );
    }

    if (duplicateUsername) {
      throw new ConflictException('Username already exists');
    }

    const { data: duplicateEmail, error: errorDuplicateEmail } = await tryCatch(
      this.findByField('email', createAdminDto.email),
    );

    if (errorDuplicateEmail) {
      throw new InternalServerErrorException(
        `Failed to check Email Address: ${errorDuplicateEmail.message}`,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch(
      bcrypt.hash(createAdminDto.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        `Failed to encrypt Password: ${errorHashedPwd.message}`,
      );
    }

    const newAdmin = new this.adminModel({
      ...createAdminDto,
      password: hashedPwd,
    });

    const { data: admin, error: errorAdmin } = await tryCatch(newAdmin.save());

    if (errorAdmin) {
      throw new InternalServerErrorException(
        `Failed to create new Admin: ${errorAdmin.message}`,
      );
    }

    admin.password = '';

    return admin;
  }

  async update(
    adminId: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<AdminDocument> {
    if (!isObjectIdOrHexString(adminId)) {
      throw new BadRequestException('Invalid Admin ID format');
    }

    const { data: duplicateUsername, error: errorDuplicateUsername } =
      await tryCatch(
        this.findByField('username', updateAdminDto.username, adminId),
      );

    if (errorDuplicateUsername) {
      throw new InternalServerErrorException(
        `Failed to check Username: ${errorDuplicateUsername.message}`,
      );
    }

    if (duplicateUsername) {
      throw new ConflictException('Username already exists');
    }

    const { data: duplicateEmail, error: errorDuplicateEmail } = await tryCatch(
      this.findByField('email', updateAdminDto.email, adminId),
    );

    if (errorDuplicateEmail) {
      throw new InternalServerErrorException(
        `Failed to check Email Address: ${errorDuplicateEmail.message}`,
      );
    }

    if (duplicateEmail) {
      throw new ConflictException('Email Address already exists');
    }

    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch(
      bcrypt.hash(updateAdminDto.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        `Failed to encrypt Password: ${errorHashedPwd.message}`,
      );
    }

    const { data: admin, error: errorAdmin } = await tryCatch(
      this.adminModel
        .findByIdAndUpdate(
          adminId,
          { ...updateAdminDto, password: hashedPwd },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec(),
    );

    if (errorAdmin) {
      throw new InternalServerErrorException(
        `Failed to update Admin: ${errorAdmin.message}`,
      );
    }

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.password = '';

    return admin;
  }

  async findByField<K extends keyof AdminDocument>(
    field: K,
    value: AdminDocument[K],
    excludeId?: string,
  ): Promise<AdminDocument | null> {
    const query: any = { [field]: value };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return this.adminModel.findOne(query).exec();
  }
}
