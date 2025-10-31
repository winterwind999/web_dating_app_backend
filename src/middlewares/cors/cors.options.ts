import { ConfigService } from '@nestjs/config';
import { CorsOptions } from 'cors';

const allowedOrigins = ['http://localhost:5173'];

export const createCorsOptions = (
  configService: ConfigService,
): CorsOptions => ({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow: boolean) => void,
  ) => {
    const NODE_ENV = configService.get<string>('NODE_ENV');

    const isAllowed =
      NODE_ENV === 'production'
        ? allowedOrigins.includes(origin || '')
        : !origin || allowedOrigins.includes(origin || '');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});
