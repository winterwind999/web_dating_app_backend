import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum ReportStatus {
  PENDING = 'Pending',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
}

export enum ReportAction {
  NO_ACTION = 'No Action',
  WARNING_SENT = 'Warning Sent',
  CONTENT_REMOVED = 'Content Removed',
  ACCOUNT_SUSPENDED = 'Account Suspended',
  ACCOUNT_BANNED = 'Account Banned',
}

export enum Reason {
  HARASSMENT = 'Harassment',
  SUICIDE_OR_SELF_INJURY = 'Suicide or self-injury',
  VIOLENCE = 'Violence or dangerous organizations',
  NUDITY = 'Nudity or sexual activity',
  SELLING = 'Selling or promoting restricted items',
  SCAM_OR_FRAUD = 'Scam or fraud',
  BLACKMAIL = 'Blackmail',
  IDENTITY_THEFT = 'Identity Theft',
  OTHER = 'Other',
}

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
    type: [Reason],
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

  @Prop({ enum: ReportAction })
  action?: ReportAction;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  reviewedBy?: mongoose.Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewNotes?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

export type ReportDocument = HydratedDocument<Report>;
