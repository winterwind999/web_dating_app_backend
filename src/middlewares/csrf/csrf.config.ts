import { ConfigService } from '@nestjs/config';
import { CsrfRequestMethod } from 'csrf-csrf';
import { Request } from 'express';

export const createCsrfConfig = (configService: ConfigService) => {
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const CSRF_SECRET = configService.get<string>('CSRF_SECRET');
  const isProduction = NODE_ENV === 'production';

  const CSRF_COOKIE_NAME = isProduction
    ? '__Host-psifi.x-csrf-token'
    : 'psifi.x-csrf-token';

  const doubleCsrfOptions = {
    getSecret: () => CSRF_SECRET as string,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'] as CsrfRequestMethod[],
    getTokenFromRequest: (req: Request) =>
      req.headers['x-csrf-token'] as string,
    getSessionIdentifier: (req: Request) =>
      req.cookies?.jwt || req.headers['x-session-id'] || 'anonymous',
  };

  return {
    CSRF_COOKIE_NAME,
    doubleCsrfOptions,
  };
};
