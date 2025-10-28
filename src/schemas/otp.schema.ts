import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Auto deletion of expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpDocument = HydratedDocument<Otp>;
