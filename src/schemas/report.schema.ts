import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Reason, ReportAction, ReportStatus } from 'src/utils/enums';

@Schema({ timestamps: true })
export class Report {
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
  reportedUser: mongoose.Types.ObjectId;

  @Prop({
    type: [String],
    enum: Reason,
    validate: {
      validator: (arr: Reason[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one reason is required',
    },
  })
  reasons: Reason[];

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Prop({ type: String, enum: ReportAction, default: null })
  action: ReportAction | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null })
  reviewedBy: mongoose.Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null })
  reviewNotes: string | null;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

export type ReportDocument = HydratedDocument<Report>;
