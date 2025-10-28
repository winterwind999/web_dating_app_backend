import { Module } from '@nestjs/common';
import { CustomLoggerController } from './custom-logger.controller';
import { CustomLoggerService } from './custom-logger.service';

@Module({
  controllers: [CustomLoggerController],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
