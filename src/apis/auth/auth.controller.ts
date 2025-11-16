import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from 'src/core/guards/google.guard';
import { LocalGuard } from 'src/core/guards/local.guard';
import { TokensService } from 'src/helpers/tokens/tokens.service';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { UserDocument } from 'src/schemas/user.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { Public } from '../../core/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly csrfService: CsrfService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { data: tokens, error: errorTokens } = await tryCatch(
      this.tokensService.loginTokens(req, res, req.user),
    );

    if (errorTokens) {
      throw errorTokens;
    }

    return tokens;
  }

  @Public()
  @Get('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Public()
  @Get('health-check')
  healthCheck() {
    return { message: 'OK' };
  }

  @Public()
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return { message: 'Google Authentication' };
  }

  @Public()
  @Get('google/sign-up')
  @UseGuards(GoogleAuthGuard)
  googleSignUp() {}

  @Public()
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication failed');
    }

    const ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    // Generate access token
    const { data: accessToken, error: errorAccessToken } = await tryCatch(
      this.tokensService['jwtService'].signAsync(
        { sub: req.user._id },
        { secret: ACCESS_TOKEN_SECRET, expiresIn: '1d' },
      ),
    );

    if (errorAccessToken) {
      throw errorAccessToken;
    }

    // Generate refresh token
    const { data: refreshToken, error: errorRefreshToken } = await tryCatch(
      this.tokensService['jwtService'].signAsync(
        { sub: req.user._id },
        { secret: REFRESH_TOKEN_SECRET, expiresIn: '7d' },
      ),
    );

    if (errorRefreshToken) {
      throw errorRefreshToken;
    }

    // Generate CSRF token
    const csrfToken = this.csrfService.generateToken(req, res);

    if (!csrfToken) {
      throw new InternalServerErrorException('Failed to generate CSRF Token');
    }

    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL');

    // Pass all tokens in URL
    return res.redirect(
      `${FRONTEND_URL}/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&csrfToken=${csrfToken}`,
    );
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Public()
  @Post('forgot-password/verify-email')
  verifyEmail(@Body(ValidationPipe) verifyEmailDto: VerifyEmailDto) {
    return this.authService.forgotPasswordVerifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('forgot-password/verify-otp')
  verifyOTP(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    return this.authService.forgotPasswordVerifyOtp(verifyOtpDto);
  }

  @Public()
  @Patch('forgot-password/change-password')
  changePassword(@Body(ValidationPipe) changePasswordDto: ChangePasswordDto) {
    return this.authService.forgotPasswordChangePassword(changePasswordDto);
  }
}
