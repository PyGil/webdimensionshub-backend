import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SessionsModule } from 'src/sessions/sessions.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [SessionsModule, MailerModule, S3Module],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
