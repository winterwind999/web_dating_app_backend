import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AlbumType, Gender, UserStatus } from 'src/utils/enums';

@Schema({ _id: false })
export class Address {
  @Prop({ default: '' })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  country: string;

  // [longitude, latitude]
  @Prop({ type: [Number], default: [], index: '2dsphere' })
  coordinates: number[];
}

@Schema({ _id: false })
export class Preferences {
  @Prop({
    type: [String],
    enum: Gender,
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one gender preference is required',
    },
  })
  genderPreference: Gender[];

  @Prop({ min: 18, max: 100 })
  minAge: number;

  @Prop({ min: 18, max: 100 })
  maxAge: number;

  // in kilometers
  @Prop({ min: 10, max: 100, default: 50 })
  maxDistance: number;
}

@Schema({ _id: false })
export class Album {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  public_id: string;

  @Prop({ required: true })
  secure_url: string;

  @Prop({ type: String, enum: AlbumType, required: true })
  type: AlbumType;

  @Prop({ required: true })
  sortOrder: number;
}

@Schema({ _id: false })
export class Photo {
  @Prop({ type: String, default: null })
  public_id: string | null;

  @Prop({ type: String, default: null })
  secure_url: string | null;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Photo, default: null })
  photo: Photo | null;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  birthday: string;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop({
    type: Address,
    required: true,
  })
  address: Address;

  @Prop({ required: true })
  shortBio: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length > 2,
      message: 'At least three interests are required',
    },
  })
  interests: string[];

  @Prop({ type: Preferences, required: true })
  preferences: Preferences;

  @Prop({
    type: [Album],
    default: [],
  })
  albums: Album[];

  @Prop({ type: String, enum: UserStatus, required: true })
  status: UserStatus;

  @Prop({ default: 'User' })
  role: string;

  @Prop({ default: 0 })
  warningCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
