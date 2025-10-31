import { InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import { Environment } from 'src/utils/enums';

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

  @IsString({ message: 'FRONTEND_URL must be a string' })
  @IsNotEmpty({ message: 'FRONTEND_URL is required' })
  FRONTEND_URL: string;

  @IsString({ message: 'BACKEND_URL must be a string' })
  @IsNotEmpty({ message: 'BACKEND_URL is required' })
  BACKEND_URL: string;

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

  @IsString({ message: 'CLOUDINARY_API_KEY must be a string' })
  @IsNotEmpty({ message: 'CLOUDINARY_API_KEY is required' })
  CLOUDINARY_API_KEY: string;

  @IsString({ message: 'CLOUDINARY_API_SECRET must be a string' })
  @IsNotEmpty({ message: 'CLOUDINARY_API_SECRET is required' })
  CLOUDINARY_API_SECRET: string;

  @IsString({ message: 'CLOUDINARY_CLOUDNAME must be a string' })
  @IsNotEmpty({ message: 'CLOUDINARY_CLOUDNAME is required' })
  CLOUDINARY_CLOUDNAME: string;
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
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  CSRF_SECRET: process.env.CSRF_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUDNAME: process.env.CLOUDINARY_CLOUDNAME,
});

export default configuration;
