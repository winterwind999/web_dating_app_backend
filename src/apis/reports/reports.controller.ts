import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Patch(':reportId')
  update(
    @Param('reportId') reportId: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(reportId, updateReportDto);
  }
}
