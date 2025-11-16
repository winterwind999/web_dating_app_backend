import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  type ReportReason,
  type ReportStatus,
} from 'src/utils/constants';

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

  @Prop({
    type: String,
    required: true,
    enum: Object.values(REPORT_STATUSES),
    default: REPORT_STATUSES.PENDING,
  })
  status: ReportStatus;

  // @Prop({ type: String, enum: Object.values(REPORT_ACTIONS), default: null })
  // action: ReportAction | null;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null })
  // reviewedBy: mongoose.Types.ObjectId | null;

  // @Prop({ type: Date, default: null })
  // reviewedAt: Date | null;

  // @Prop({ type: String, default: null })
  // reviewNotes: string | null;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

export type ReportDocument = HydratedDocument<Report>;
