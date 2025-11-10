import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  type ReportReason,
  type ReportStatus,
} from 'src/utils/constants';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  reportedUser: string;

  @IsArray()
  @IsEnum(Object.values(REPORT_REASONS), { each: true })
  @IsNotEmpty()
  reasons: ReportReason[];

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Object.values(REPORT_STATUSES))
  @IsNotEmpty()
  status: ReportStatus;
}
