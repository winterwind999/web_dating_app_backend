import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { doubleCsrf } from 'csrf-csrf';
import { Request, Response } from 'express';
import { createCsrfConfig } from './csrf.config';

@Injectable()
export class CsrfService {
  private generateCsrfTokenFn: any;
  public readonly CSRF_COOKIE_NAME: string;

  constructor(private readonly configService: ConfigService) {
    const { CSRF_COOKIE_NAME, doubleCsrfOptions } = createCsrfConfig(
      this.configService,
    );

    this.CSRF_COOKIE_NAME = CSRF_COOKIE_NAME;

    const { generateCsrfToken } = doubleCsrf(doubleCsrfOptions);
    this.generateCsrfTokenFn = generateCsrfToken;
  }

  generateToken(req: Request, res: Response): string {
    return this.generateCsrfTokenFn(req, res);
  }

  getCookieName(): string {
    return this.CSRF_COOKIE_NAME;
  }
}
