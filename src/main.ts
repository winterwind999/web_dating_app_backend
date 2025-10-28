import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { CustomLoggerService } from './apis/custom-logger/custom-logger.service';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { createCorsOptions } from './middlewares/cors/cors.options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix('api');

  app.use(helmet());

  const configService = app.get(ConfigService);

  app.enableCors(createCorsOptions(configService));

  app.use(cookieParser());

  app.useLogger(app.get(CustomLoggerService));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3500;

  await app.listen(port);
}
bootstrap();
