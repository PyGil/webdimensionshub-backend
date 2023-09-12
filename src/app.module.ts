import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/config.schema';
import { RedisModule } from './redis/redis.module';
import { TokensModule } from './tokens/tokens.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { MailerModule } from './mailer/mailer.module';
import { VerificationsModule } from './verifications/verifications.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema,
    }),
    AuthModule,
    PrismaModule,
    RedisModule,
    UsersModule,
    TokensModule,
    SessionsModule,
    MailerModule,
    VerificationsModule,
    S3Module,
  ],
})
export class AppModule {}
