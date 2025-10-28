import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Dislike {
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
  dislikedUser: mongoose.Types.ObjectId;
}

export const DislikeSchema = SchemaFactory.createForClass(Dislike);

export type DislikeDocument = HydratedDocument<Dislike>;
