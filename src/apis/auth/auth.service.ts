import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { Resend } from 'resend';
import { UsersService } from 'src/apis/users/users.service';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { Otp, OtpDocument } from 'src/schemas/otp.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { tryCatch } from 'src/utils/tryCatch';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly csrfService: CsrfService,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async login(loginDto: LoginDto): Promise<UserDocument> {
    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.findByField('email', loginDto.email),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to verify Email Address: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new UnauthorizedException('Email Address or Password is incorrect');
    }

    const { data: verifyPwd, error: errorVerifyPwd } = await tryCatch(
      bcrypt.compare(loginDto.password, user.password),
    );

    if (errorVerifyPwd) {
      throw new InternalServerErrorException(
        `Failed to verify Password: ${errorVerifyPwd.message}`,
      );
    }

    if (!verifyPwd) {
      throw new UnauthorizedException('Email Address or Password is incorrect');
    }

    user.password = '';

    return user;
  }

  async thirdPartyLogin(email: string): Promise<UserDocument> {
    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.findByField('email', email),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async refresh(
    req: Request,
    res: Response,
  ): Promise<{
    success: boolean;
  }> {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    const refreshToken = cookies.refreshToken;

    const ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const NODE_ENV = this.configService.get<string>('NODE_ENV');

    const { data: decoded, error: errorDecoded } = await tryCatch(
      this.jwtService.verifyAsync(refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      }),
    );

    if (errorDecoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.findOne(decoded.sub),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // accessToken
    const { data: accessToken, error: errorAccessToken } = await tryCatch(
      this.jwtService.signAsync(
        { sub: user._id },
        { secret: ACCESS_TOKEN_SECRET, expiresIn: '1d' },
      ),
    );

    if (errorAccessToken) {
      throw new InternalServerErrorException(
        `Failed to generate Access Token: ${errorAccessToken.message}`,
      );
    }

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // CSRF token in cookie
    const csrfToken = this.csrfService.generateToken(req, res);

    if (!csrfToken) {
      throw new InternalServerErrorException('Failed to generate CSRF Token');
    }

    return {
      success: true,
    };
  }

  async logout(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
      return;
    }

    const NODE_ENV = this.configService.get<string>('NODE_ENV');

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie(this.csrfService.getCookieName(), {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return;
  }

  async forgotPasswordVerifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.findByField('email', verifyEmailDto.email),
    );

    if (errorUser) {
      throw new InternalServerErrorException(
        `Failed to get User: ${errorUser.message}`,
      );
    }

    if (!user) {
      throw new NotFoundException(
        'If the Email Address exists, an OTP has been sent',
      );
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { data: hashedOtp, error: errorHashOtp } = await tryCatch(
      bcrypt.hash(otp, 10),
    );

    if (errorHashOtp) {
      throw new InternalServerErrorException('Failed to generate OTP');
    }

    const { error: errorDeleteExistingOtps } = await tryCatch(
      this.otpModel.deleteMany({ email: user.email }).exec(),
    );

    if (errorDeleteExistingOtps) {
      throw new InternalServerErrorException('Failed to delete existing OTPs');
    }

    const newOtp = new this.otpModel({
      email: user.email,
      otp: hashedOtp,
      expiresAt,
    });

    const { error: errorSavedOtp } = await tryCatch(newOtp.save());

    if (errorSavedOtp) {
      throw new InternalServerErrorException('Failed to create OTP');
    }

    const RESEND_API_KEY = this.configService.get<string>('RESEND_API_KEY');

    const resend = new Resend(RESEND_API_KEY);

    const { error: errorSend } = await tryCatch(
      resend.emails.send({
        from: 'JGF Portfolio <onboarding@resend.dev>',
        to: 'facioljordan5@gmail.com',
        subject: 'JGF Portfolio OTP Forgot Password',
        html: `
              <div>
                <p>Your OTP is <b>${otp}</b></p>
              </div>
            `,
      }),
    );

    if (errorSend) {
      throw new InternalServerErrorException(
        `Failed to OTP send to Email Address: ${errorSend.message}`,
      );
    }

    return { message: 'If the Email Address exists, an OTP has been sent' };
  }

  async forgotPasswordVerifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string; isVerified: boolean }> {
    const { data: otps, error: errorOtps } = await tryCatch(
      this.otpModel.find({ email: verifyOtpDto.email }).exec(),
    );

    if (errorOtps) {
      throw new InternalServerErrorException(
        `Failed to verify OTP: ${errorOtps.message}`,
      );
    }

    if (otps.length === 0) {
      throw new NotFoundException('OTP not found');
    }

    let validOtp: OtpDocument | null = null;
    for (const otpDoc of otps) {
      if (new Date() > otpDoc.expiresAt) {
        continue;
      }

      const { data: isMatch, error: errorCompare } = await tryCatch(
        bcrypt.compare(verifyOtpDto.otp, otpDoc.otp),
      );

      if (errorCompare) {
        continue;
      }

      if (isMatch) {
        validOtp = otpDoc;
        break;
      }
    }

    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const { error: errorDeleteExistingOtps } = await tryCatch(
      this.otpModel.deleteMany({ email: verifyOtpDto.email }).exec(),
    );

    if (errorDeleteExistingOtps) {
      throw new InternalServerErrorException('Failed to delete existing OTPs');
    }

    return { message: 'OTP verified', isVerified: true };
  }

  async forgotPasswordChangePassword(
    changePassword: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { data: hashedPwd, error: errorHashedPwd } = await tryCatch(
      bcrypt.hash(changePassword.password, 10),
    );

    if (errorHashedPwd) {
      throw new InternalServerErrorException(
        `Failed to encrypt Password: ${errorHashedPwd.message}`,
      );
    }

    const { data: updateUser, error: errorUpdateUser } = await tryCatch(
      this.userModel.updateOne(
        { email: changePassword.email },
        {
          password: hashedPwd,
        },
      ),
    );

    if (errorUpdateUser) {
      throw new InternalServerErrorException(
        `Failed to update User: ${errorUpdateUser.message}`,
      );
    }

    return { message: 'Change User password successfully' };
  }
}
