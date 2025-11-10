import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { USER_ROLES, type UserRole } from 'src/utils/constants';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: USER_ROLES.ADMIN })
  role: UserRole;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminDocument = HydratedDocument<Admin>;
