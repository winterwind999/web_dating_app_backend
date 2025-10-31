import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  matchedUser: string;
}
