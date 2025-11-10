import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { REPORT_ACTIONS, type ReportAction } from 'src/utils/constants';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends CreateReportDto {
  @IsEnum(Object.values(REPORT_ACTIONS))
  @IsNotEmpty()
  action: ReportAction;

  @IsString()
  @IsNotEmpty()
  reviewedBy: string;

  @IsString()
  @IsNotEmpty()
  reviewedAt: string;

  @IsString()
  @IsNotEmpty()
  reviewNotes: string;
}
