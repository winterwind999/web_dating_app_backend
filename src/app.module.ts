import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { AuthModule } from './apis/auth/auth.module';
import { BlocksModule } from './apis/blocks/blocks.module';
import { ChatsModule } from './apis/chats/chats.module';
import { CustomLoggerModule } from './apis/custom-logger/custom-logger.module';
import { DislikesModule } from './apis/dislikes/dislikes.module';
import { FeedsModule } from './apis/feeds/feeds.module';
import { LikesModule } from './apis/likes/likes.module';
import { MatchesModule } from './apis/matches/matches.module';
import { NotificationsModule } from './apis/notifications/notifications.module';
import { ReportsModule } from './apis/reports/reports.module';
import { UsersModule } from './apis/users/users.module';
import { WebsocketsModule } from './apis/websockets/websockets.module';
import configuration, { validate } from './configs/env.config';
import { CsrfGuard } from './core/guards/csrf.guard';
import { JwtAuthGuard } from './core/guards/jwt.guard';
import { CloudinaryModule } from './helpers/cloudinary/cloudinary.module';
import { TokensModule } from './helpers/tokens/tokens.module';
import { TokensService } from './helpers/tokens/tokens.service';
import { CsrfModule } from './middlewares/csrf/csrf.module';

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
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    AuthModule,
    CsrfModule,
    TokensModule,
    CustomLoggerModule,
    UsersModule,
    LikesModule,
    DislikesModule,
    MatchesModule,
    ReportsModule,
    BlocksModule,
    CloudinaryModule,
    FeedsModule,
    NotificationsModule,
    ChatsModule,
    WebsocketsModule,
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
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    TokensService,
  ],
})
export class AppModule {}
