import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    validate: {
      validator: (v: mongoose.Types.ObjectId[]) => v.length === 2,
      message: 'Conversations must have exactly 2 participants',
    },
  })
  participants: mongoose.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage?: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  // { userId: count }
  @Prop({
    type: Map,
    of: Number,
    default: {},
  })
  unreadCount: Map<string, number>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

export type ConversationDocument = HydratedDocument<Conversation>;
