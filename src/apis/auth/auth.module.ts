import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';
import { LocalStrategy } from 'src/core/strategies/local.strategy';
import { TokensModule } from 'src/helpers/tokens/tokens.module';
import { CsrfService } from 'src/middlewares/csrf/csrf.service';
import { Otp, OtpSchema } from 'src/schemas/otp.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { GoogleStrategy } from '../../core/strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
    TokensModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CsrfService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
