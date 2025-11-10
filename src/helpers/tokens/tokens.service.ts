import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { UserDocument } from 'src/schemas/user.schema';
import { tryCatch } from 'src/utils/tryCatch';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly csrfService: CsrfService,
  ) {}

  async loginTokens(
    req: Request,
    res: Response,
    user: UserDocument,
  ): Promise<{ success: boolean }> {
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
        { sub: user._id },
        { secret: ACCESS_TOKEN_SECRET, expiresIn: '1d' },
      ),
    );

    if (errorAccessToken) {
      throw new InternalServerErrorException('Failed to generate Access Token');
    }

    // refreshToken
    const { data: refreshToken, error: errorRefreshToken } = await tryCatch(
      this.jwtService.signAsync(
        { sub: user._id },
        { secret: REFRESH_TOKEN_SECRET, expiresIn: '7d' },
      ),
    );

    if (errorRefreshToken) {
      throw new InternalServerErrorException(
        'Failed to generate Refresh Token',
      );
    }

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Store refreshToken in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    (req as any).cookies = {
      ...(req as any).cookies,
      refreshToken,
    };

    const csrfToken = this.csrfService.generateToken(req, res);

    if (!csrfToken) {
      throw new InternalServerErrorException('Failed to generate CSRF Token');
    }

    return {
      success: true,
    };
  }
}
