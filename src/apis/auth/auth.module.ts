import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/core/passport-strategies/jwt.strategy';
import { LocalStrategy } from 'src/core/passport-strategies/local.strategy';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { Otp, OtpSchema } from 'src/schemas/otp.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { GoogleStrategy } from '../../core/passport-strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      session: false,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Otp.name,
        schema: OtpSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    CsrfService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
