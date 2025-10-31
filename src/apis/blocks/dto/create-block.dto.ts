import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Reason } from 'src/utils/enums';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  blockedUser: string;

  @IsArray()
  @IsEnum(Reason, { each: true })
  @IsNotEmpty()
  reasons: Reason[];

  @IsString()
  @IsNotEmpty()
  description: string;
}
