import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { tryCatch } from 'src/utils/tryCatch';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private getLogDir(type: 'audit' | 'error') {
    return path.join(process.cwd(), 'logs', `${type}-logs`);
  }

  private formatLogMessage(input: any): string {
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input, null, 2);
    } catch {
      return String(input);
    }
  }

  private getWeekRange(date: Date = new Date()) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);

    const startOfWeek = new Date(start.setDate(diff));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const format = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;

    return {
      start: format(startOfWeek),
      end: format(endOfWeek),
    };
  }

  private async logToFile(entry: string, type: 'audit' | 'error') {
    const { start, end } = this.getWeekRange();
    const filename = `${type}-logs-${start}-${end}.log`;
    const logDir = this.getLogDir(type);

    if (!fs.existsSync(logDir)) {
      const { error } = await tryCatch(
        fsPromises.mkdir(logDir, { recursive: true }),
      );

      if (error) {
        console.error('Log Directory Error:', error.message);
      }
    }

    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Asia/Manila',
    }).format(new Date())}\t${entry}\n`;

    const { error } = await tryCatch(
      fsPromises.appendFile(path.join(logDir, filename), formattedEntry),
    );

    if (error) {
      console.error('Log Write Error:', error.message);
    }
  }

  log(message: any, context?: string) {
    const entry = `${context ?? ''}\t${this.formatLogMessage(message)}`;
    this.logToFile(entry, 'audit');
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext ?? ''}\t${this.formatLogMessage(message)}`;
    this.logToFile(entry, 'error');
    super.error(message, stackOrContext);
  }

  async findAll(
    tab: 'audit' | 'error' = 'audit',
    page: number = 1,
    search: string = '',
  ) {
    if (!['audit', 'error'].includes(tab)) {
      throw new BadRequestException('Tab must be either Audit or Error');
    }

    const logDir = this.getLogDir(tab);

    if (!fs.existsSync(logDir)) {
      return { files: [], total: 0, page };
    }

    const { data: files, error } = await tryCatch(fsPromises.readdir(logDir));

    if (error) {
      throw new BadRequestException('Failed to read log directory');
    }

    let filtered = (files as string[]).filter((f) => f.endsWith('.log'));

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((f) => f.toLowerCase().includes(lowerSearch));
    }

    filtered.sort((a, b) => b.localeCompare(a));

    const limit = 10;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      files: paginated,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async findOne(filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }

    let type: 'audit' | 'error';
    if (filename.startsWith('audit-')) {
      type = 'audit';
    } else if (filename.startsWith('error-')) {
      type = 'error';
    } else {
      throw new BadRequestException('Invalid filename format');
    }

    const filePath = path.join(this.getLogDir(type), filename);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    const { data: content, error } = await tryCatch(
      fsPromises.readFile(filePath, 'utf-8'),
    );

    if (error) {
      throw new BadRequestException('Failed to read log file');
    }

    return { filename, content };
  }
}
