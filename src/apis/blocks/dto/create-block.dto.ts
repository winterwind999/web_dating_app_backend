import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { REPORT_REASONS, type ReportReason } from 'src/utils/constants';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  blockedUser: string;

  @IsArray()
  @IsEnum(Object.values(REPORT_REASONS), { each: true })
  @IsNotEmpty()
  reasons: ReportReason[];

  @IsString()
  @IsNotEmpty()
  description: string;
}
