import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CsrfModule } from 'src/middlewares/csrf/csrf.module';
import { TokensService } from './tokens.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule, CsrfModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
