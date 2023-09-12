import { Module } from '@nestjs/common';

import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import { MailerModule } from 'src/mailer/mailer.module';
import { UsersModule } from 'src/users/users.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [MailerModule, UsersModule, TokensModule, SessionsModule],
  controllers: [VerificationsController],
  providers: [VerificationsService],
})
export class VerificationsModule {}
