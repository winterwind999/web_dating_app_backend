import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportAction } from 'src/utils/enums';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends CreateReportDto {
  @IsEnum(ReportAction)
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
