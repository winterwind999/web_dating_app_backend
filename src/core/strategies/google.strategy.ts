import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from 'src/apis/auth/auth.service';
import { tryCatch } from 'src/utils/tryCatch';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const GOOGLE_CLIENT_ID =
      configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = configService.getOrThrow<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    const BACKEND_URL = configService.getOrThrow<string>('BACKEND_URL');

    console.log('BACKEND_URL', BACKEND_URL);

    const options: StrategyOptions = {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/redirect`,
      scope: ['email', 'profile'],
    };

    super(options);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value || profile._json.email;

    if (!email) {
      throw new BadRequestException('Email Address not provided from Google');
    }

    const { data: user, error: errorUser } = await tryCatch(
      this.authService.thirdPartyLogin(email),
    );

    if (errorUser) {
      throw errorUser;
    }

    return user;
  }
}
