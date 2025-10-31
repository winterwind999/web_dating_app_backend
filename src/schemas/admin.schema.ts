import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'Admin' })
  role: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminDocument = HydratedDocument<Admin>;
