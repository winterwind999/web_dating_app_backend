import { ConfigService } from '@nestjs/config';
import { CsrfRequestMethod } from 'csrf-csrf';
import { Request } from 'express';
import { jwtDecode } from 'jwt-decode';

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
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'] as CsrfRequestMethod[],
    getTokenFromRequest: (req: Request) =>
      req.headers['x-csrf-token'] as string,
    // getSessionIdentifier: (req: Request) =>
    //   req.cookies?.refreshToken || 'anonymous',
    getSessionIdentifier: (req: Request) => {
      const token = req.cookies?.refreshToken;
      if (!token) return 'anonymous';
      try {
        const payload = jwtDecode(token) as any;
        return payload.sub; // user ID
      } catch {
        return 'anonymous';
      }
    },
  };

  return {
    CSRF_COOKIE_NAME,
    doubleCsrfOptions,
  };
};
