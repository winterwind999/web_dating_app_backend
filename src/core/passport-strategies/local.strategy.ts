import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/apis/auth/auth.service';
import { tryCatch } from 'src/utils/tryCatch';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const { data: user, error: errorUser } = await tryCatch(
      this.authService.login({ email, password }),
    );

    if (errorUser) {
      throw errorUser;
    }

    return user;
  }
}
