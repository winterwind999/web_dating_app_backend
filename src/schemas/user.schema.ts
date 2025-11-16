import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  type Address,
  type Album,
  ALBUM_TYPES,
  type AlbumType,
  type Gender,
  GENDERS,
  type Photo,
  type Preferences,
  // USER_ROLES,
  USER_STATUSES,
  // type UserRole,
  type UserStatus,
} from 'src/utils/constants';

@Schema({ _id: false })
export class AddressSchema {
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
export class PreferencesSchema {
  @Prop({
    type: [String],
    enum: Object.values(GENDERS),
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
export class AlbumSchema {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  public_id: string;

  @Prop({ required: true })
  secure_url: string;

  @Prop({ type: String, enum: Object.values(ALBUM_TYPES), required: true })
  type: AlbumType;
}

@Schema({ _id: false })
export class PhotoSchema {
  @Prop({ type: String, default: null })
  public_id: string | null;

  @Prop({ type: String, default: null })
  secure_url: string | null;
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: PhotoSchema,
    default: () => ({ public_id: null, secure_url: null }),
  })
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

  @Prop({ type: String, enum: Object.values(GENDERS), required: true })
  gender: Gender;

  @Prop({
    type: AddressSchema,
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

  @Prop({ type: PreferencesSchema, required: true })
  preferences: Preferences;

  @Prop({
    type: [AlbumSchema],
    default: [],
  })
  albums: Album[];

  @Prop({ type: String, enum: Object.values(USER_STATUSES), required: true })
  status: UserStatus;

  // @Prop({ type: String, default: USER_ROLES.USER })
  // role: UserRole;

  @Prop({ type: Number, default: 0 })
  warningCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
