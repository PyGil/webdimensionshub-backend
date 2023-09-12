import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { BEARER } from '../constants/strategy';
import { TokenPayload } from 'src/tokens/interfaces/token-payload.interface';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, BEARER) {
  constructor(private readonly sessionsService: SessionsService) {
    super();
  }

  async validate(
    accessToken: string,
  ): Promise<{ accessToken: string } & TokenPayload> {
    try {
      const user = await this.sessionsService.getSession(accessToken);

      return { accessToken, ...user };
    } catch {
      throw new ForbiddenException('Token is invalid');
    }
  }
}
