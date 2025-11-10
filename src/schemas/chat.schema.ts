import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  CHAT_STATUSES,
  CHAT_TYPES,
  type ChatStatus,
  type ChatType,
} from 'src/utils/constants';

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  })
  match: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderUser: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  receiverUser: mongoose.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(CHAT_TYPES),
    default: CHAT_TYPES.TEXT,
  })
  type: ChatType;

  @Prop({
    type: String,
    enum: Object.values(CHAT_STATUSES),
    default: CHAT_STATUSES.SENDING,
  })
  status: ChatStatus;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export type ChatDocument = HydratedDocument<Chat>;
