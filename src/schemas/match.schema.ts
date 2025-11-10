import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Match {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  matchedUser: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
  lastMessage: mongoose.Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  lastMessageAt: Date | null;

  // { userId: count }
  @Prop({
    type: Map,
    of: Number,
    default: {},
  })
  unreadCount: Map<string, number>;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

export type MatchDocument = HydratedDocument<Match>;
