import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non Binary',
  OTHER = 'Other',
}

export enum AlbumType {
  IMAGE = 'Image',
  VIDEO = 'Video',
}

export enum Status {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  BANNED = 'Banned',
  DELETED = 'Deleted',
}

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
  @Prop({ type: [Number] })
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
  @Prop({ min: 1, max: 500, default: 50 })
  maxDistance: number;
}

@Schema({ _id: false })
export class Album {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  src: string;

  @Prop({ type: String, enum: AlbumType, required: true })
  type: AlbumType;

  @Prop({ required: true })
  sortOrder: number;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  photo: string;

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
  birthday: Date;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop({ required: true })
  shortBio: string;

  @Prop({
    type: Address,
    required: true,
  })
  address: Address;

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
    required: true,
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length > 2,
      message: 'At least three items are required',
    },
  })
  albums: Album[];

  @Prop({ type: String, enum: Status, required: true })
  status: Status;

  @Prop({ default: 'User' })
  role: string;

  @Prop({ required: true })
  warningCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
