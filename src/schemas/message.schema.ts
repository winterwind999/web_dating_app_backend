import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ChatStatus } from 'src/utils/enums';

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversationId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  sender: mongoose.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'gif', 'sticker'],
    default: 'text',
  })
  type: string;

  @Prop({ type: String, enum: ChatStatus, default: ChatStatus.SENT })
  status: ChatStatus;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  seenAt?: Date;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = HydratedDocument<Message>;
