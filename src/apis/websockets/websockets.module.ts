import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketsGateway } from './websockets.gateway';

@Module({
  imports: [ChatsModule,  NotificationsModule],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
})
export class WebsocketsModule {}
