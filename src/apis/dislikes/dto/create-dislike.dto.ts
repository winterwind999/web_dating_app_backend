import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDislikeDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  dislikedUser: string;
}
