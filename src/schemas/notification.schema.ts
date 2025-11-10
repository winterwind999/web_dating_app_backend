import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = HydratedDocument<Notification>;
