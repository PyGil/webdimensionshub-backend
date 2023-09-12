import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { BearerStrategy } from './strategies/bearer.strategy';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersModule } from 'src/users/users.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [JwtModule.register({}), TokensModule, UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [BearerStrategy],
})
export class AuthModule {}
