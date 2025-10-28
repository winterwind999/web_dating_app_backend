import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { AuthModule } from './apis/auth/auth.module';
import { CustomLoggerModule } from './apis/custom-logger/custom-logger.module';
import { UsersModule } from './apis/users/users.module';
import configuration, { validate } from './configs/env.config';
import { CsrfGuard } from './core/guards/csrf.guard';
import { JwtAuthGuard } from './core/guards/jwt.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { CsrfModule } from './middlewares/csrf/csrf.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    AuthModule,
    CsrfModule,
    CustomLoggerModule,
    UsersModule,
    AdminsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
