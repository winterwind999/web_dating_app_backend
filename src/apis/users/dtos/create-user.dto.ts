import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Gender, UserStatus } from 'src/utils/enums';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class PreferencesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Gender, { each: true })
  genderPreference: Gender[];

  @IsNumber()
  @Min(18)
  @Max(100)
  @IsNotEmpty()
  minAge: number;

  @IsNumber()
  @Min(18)
  @Max(100)
  @IsNotEmpty()
  maxAge: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  @IsNotEmpty()
  maxDistance: number;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  middleName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  birthday: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  shortBio: string;

  @IsArray()
  @ArrayMinSize(3)
  @IsString({ each: true })
  interests: string[];

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}
