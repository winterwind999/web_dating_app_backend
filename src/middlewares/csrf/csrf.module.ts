import { Module } from '@nestjs/common';
import { CsrfService } from './csrf.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CsrfModule {}
