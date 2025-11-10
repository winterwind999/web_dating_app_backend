import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'https://matchy-1uri.onrender.com',
];

export const createCorsOptions = (): CorsOptions => ({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin || '')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});
