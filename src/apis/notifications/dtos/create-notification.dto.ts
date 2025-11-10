import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsNotEmpty()
  isRead: boolean;
}
