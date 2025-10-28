import { InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment, {
    message: 'NODE_ENV must be one of: development, production, test',
  })
  @IsNotEmpty({ message: 'NODE_ENV is required' })
  NODE_ENV: Environment = Environment.Development;

  @IsString({ message: 'NODE_VERSION must be a string' })
  @IsNotEmpty({ message: 'NODE_VERSION is required' })
  NODE_VERSION: string;

  @IsNumber({}, { message: 'PORT must be a number' })
  PORT: number = 3500;

  @IsString({ message: 'ACCESS_TOKEN_SECRET must be a string' })
  @IsNotEmpty({ message: 'ACCESS_TOKEN_SECRET is required' })
  ACCESS_TOKEN_SECRET: string;

  @IsString({ message: 'REFRESH_TOKEN_SECRET must be a string' })
  @IsNotEmpty({ message: 'REFRESH_TOKEN_SECRET is required' })
  REFRESH_TOKEN_SECRET: string;

  @IsString({ message: 'CSRF_SECRET must be a string' })
  @IsNotEmpty({ message: 'CSRF_SECRET is required' })
  CSRF_SECRET: string;

  @IsString({ message: 'MONGODB_URI must be a string' })
  @IsNotEmpty({ message: 'MONGODB_URI is required' })
  MONGODB_URI: string;

  @IsString({ message: 'RESEND_API_KEY must be a string' })
  @IsNotEmpty({ message: 'RESEND_API_KEY is required' })
  RESEND_API_KEY: string;

  @IsString({ message: 'GOOGLE_CLIENT_ID must be a string' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_ID is required' })
  GOOGLE_CLIENT_ID: string;

  @IsString({ message: 'GOOGLE_CLIENT_SECRET must be a string' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_SECRET is required' })
  GOOGLE_CLIENT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => {
        const constraints = error.constraints;
        return Object.values(constraints || {}).join(', ');
      })
      .join('\n');

    throw new InternalServerErrorException(
      `Environment validation failed: ${messages}`,
    );
  }

  return validatedConfig;
}

const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  NODE_VERSION: process.env.NODE_VERSION,
  PORT: Number(process.env.PORT) || 3500,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  CSRF_SECRET: process.env.CSRF_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

export default configuration;
