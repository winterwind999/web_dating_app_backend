import { IsNotEmpty, IsString } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';

export class VerifyOtpDto extends VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
