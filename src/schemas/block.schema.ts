import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { REPORT_REASONS, type ReportReason } from 'src/utils/constants';

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
    type: [String],
    enum: Object.values(REPORT_REASONS),
    required: true,
    validate: {
      validator: (arr: ReportReason[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one reason is required',
    },
  })
  reasons: ReportReason[];

  @Prop({ required: true })
  description: string;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

export type BlockDocument = HydratedDocument<Block>;
