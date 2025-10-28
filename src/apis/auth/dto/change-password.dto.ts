import { IsNotEmpty, IsString } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';

export class ChangePasswordDto extends VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
