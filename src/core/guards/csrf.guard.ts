import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { doubleCsrf } from 'csrf-csrf';
import { Request, Response } from 'express';
import { createCsrfConfig } from 'src/middlewares/csrf/csrf.config';
import { IS_PUBLIC_KEY } from '../../core/decorators/public.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  private doubleCsrfProtection: any;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    const { doubleCsrfOptions } = createCsrfConfig(this.configService);
    const { doubleCsrfProtection } = doubleCsrf(doubleCsrfOptions);
    this.doubleCsrfProtection = doubleCsrfProtection;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    return new Promise((resolve, reject) => {
      this.doubleCsrfProtection(req, res, (err?: any) => {
        if (err) {
          reject(new UnauthorizedException('Invalid CSRF token'));
        } else {
          resolve(true);
        }
      });
    });
  }
}
