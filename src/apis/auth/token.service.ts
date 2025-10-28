import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { UserDocument } from 'src/schemas/user.schema';
import { tryCatch } from 'src/utils/tryCatch';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly csrfService: CsrfService,
  ) {}

  async loginTokens(
    req: Request,
    res: Response,
    user: UserDocument,
  ): Promise<{
    accessToken: string;
    csrfToken: string;
  }> {
    const ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const NODE_ENV = this.configService.get<string>('NODE_ENV');

    // accessToken
    const { data: accessToken, error: errorAccessToken } = await tryCatch(
      this.jwtService.signAsync(
        {
          sub: user._id,
        },
        {
          secret: ACCESS_TOKEN_SECRET,
          expiresIn: '1d',
        },
      ),
    );

    if (errorAccessToken) {
      throw new InternalServerErrorException(
        'Failed to generate Access Token:',
        errorAccessToken.message,
      );
    }

    // refreshToken
    const { data: refreshToken, error: errorRefreshToken } = await tryCatch(
      this.jwtService.signAsync(
        {
          sub: user._id,
        },
        {
          secret: REFRESH_TOKEN_SECRET,
          expiresIn: '1d',
        },
      ),
    );

    if (errorRefreshToken) {
      throw new InternalServerErrorException(
        'Failed to generate Refresh Token:',
        errorRefreshToken.message,
      );
    }

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const csrfToken = this.csrfService.generateToken(req, res);

    if (!csrfToken) {
      throw new InternalServerErrorException('Failed to generate CSRF Token');
    }

    return {
      accessToken,
      csrfToken,
    };
  }
}
