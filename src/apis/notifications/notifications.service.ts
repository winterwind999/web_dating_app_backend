import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateNotificationDto } from './dtos/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(
    userId: string,
    page: number,
  ): Promise<{ notifications: NotificationDocument[]; totalPages: number }> {
    if (!isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    const [
      { data: notifications, error: errorNotifications },
      { data: totalCount, error: errorCount },
    ] = await Promise.all([
      tryCatch(
        this.notificationModel
          .find({ user: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<NotificationDocument[]>()
          .exec(),
      ),
      tryCatch(this.notificationModel.countDocuments({ user: userId }).exec()),
    ]);

    if (errorNotifications) {
      throw new InternalServerErrorException(
        `Failed to get Notifications: ${errorNotifications.message}`,
      );
    }

    if (errorCount) {
      throw new InternalServerErrorException(
        `Failed to get Notifications count: ${errorCount.message}`,
      );
    }

    const totalPages = Math.ceil(totalCount / limit);

    return { notifications, totalPages };
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const newNotification = new this.notificationModel(createNotificationDto);

    const { data: notification, error: errorNotification } = await tryCatch(
      newNotification.save(),
    );

    if (errorNotification) {
      throw new InternalServerErrorException(
        `Failed to create new Notification: ${errorNotification.message}`,
      );
    }

    return notification;
  }

  async update(userId: string): Promise<{ message: string }> {
    const { error } = await tryCatch(
      this.notificationModel
        .updateMany({ user: userId }, { isRead: true })
        .exec(),
    );

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update notifications: ${error.message}`,
      );
    }

    return { message: 'Updated unread notifications of User' };
  }
}
