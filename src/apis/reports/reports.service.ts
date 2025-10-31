import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { Report, ReportDocument } from 'src/schemas/report.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<ReportDocument> {
    const newReport = new this.reportModel(createReportDto);

    const { data: report, error: errorReport } = await tryCatch(
      newReport.save(),
    );

    if (errorReport) {
      throw new InternalServerErrorException(
        'Failed to create new Report:',
        errorReport.message,
      );
    }

    return report;
  }

  async update(
    reportId: string,
    updateReportDto: UpdateReportDto,
  ): Promise<ReportDocument> {
    if (!isObjectIdOrHexString(reportId)) {
      throw new BadRequestException('Invalid Report ID format');
    }

    const { data: report, error: errorReport } = await tryCatch(
      this.reportModel
        .findByIdAndUpdate(reportId, updateReportDto, {
          new: true,
          runValidators: true,
        })
        .exec(),
    );

    if (errorReport) {
      throw new InternalServerErrorException(
        'Failed to update Report:',
        errorReport.message,
      );
    }

    if (!report) {
      throw new NotFoundException('Updated Report not found');
    }

    return report;
  }
}
