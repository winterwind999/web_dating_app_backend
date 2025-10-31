import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  likedUser: string;
}
