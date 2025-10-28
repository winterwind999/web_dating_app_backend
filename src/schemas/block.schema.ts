import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Reason } from './report.schema';

@Schema({ timestamps: true })
export class Block {
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
  blockedUser: mongoose.Types.ObjectId;

  @Prop({
    type: [Reason],
    required: true,
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one reason is required',
    },
  })
  reasons: string[];

  @Prop({ required: true })
  description: string;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

export type BlockDocument = HydratedDocument<Block>;
