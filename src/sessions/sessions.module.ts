import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [TokensModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
