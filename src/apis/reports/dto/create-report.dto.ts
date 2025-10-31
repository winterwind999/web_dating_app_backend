import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Reason, ReportStatus } from 'src/utils/enums';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  reportedUser: string;

  @IsArray()
  @IsEnum(Reason, { each: true })
  @IsNotEmpty()
  reasons: Reason[];

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([ReportStatus])
  @IsNotEmpty()
  status: ReportStatus;
}
