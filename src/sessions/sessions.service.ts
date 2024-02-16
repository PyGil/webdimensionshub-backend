import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { RedisService } from 'src/redis/redis.service';
import { TokenTypes } from 'src/tokens/constants/token-types';
import { TokenPayload } from 'src/tokens/interfaces/token-payload.interface';
import { TokensService } from 'src/tokens/tokens.service';
import { SessionEntity } from './entities';
import { RefreshTokenPayload } from 'src/tokens/interfaces/refresh-token-payload.interface';

@Injectable()
export class SessionsService {
  private readonly sessionsListPrefix = 'sessions';

  constructor(
    private readonly redisService: RedisService,
    private readonly tokensService: TokensService,
  ) {}

  private getSessionsListKey(userId: number): string {
    return `${this.sessionsListPrefix}:${userId}`;
  }

  getSessionsList(userId: number): Promise<string[]> {
    return this.redisService.lRangeAll(this.getSessionsListKey(userId));
  }

  addSessionToList(userId: number, accessToken: string): Promise<number> {
    const sessionsListKey = this.getSessionsListKey(userId);

    return this.redisService.lPush(sessionsListKey, accessToken);
  }

  removeSessionFromList(userId: number, accessToken: string): Promise<number> {
    const sessionsListKey = this.getSessionsListKey(userId);

    return this.redisService.lRemAll(sessionsListKey, accessToken);
  }

  async removeAllSessions(userId: number): Promise<void> {
    const sessionsListKey = this.getSessionsListKey(userId);
    const accessTokens = await this.redisService.lRangeAll(sessionsListKey);

    accessTokens.forEach(
      async (token) => await this.redisService.delete(token),
    );

    await this.redisService.delete(sessionsListKey);
  }

  async refreshSession(payload: RefreshTokenPayload): Promise<SessionEntity> {
    const { sub, accessToken, role } = payload;
    const accessTokens = await this.getSessionsList(sub);
    const existAccessToken = accessTokens.includes(accessToken);

    if (!existAccessToken) {
      throw new UnprocessableEntityException('Token has expired');
    }

    await this.removeSession(sub, accessToken);

    return this.createSession({ sub, role });
  }

  async createSession(payload: TokenPayload): Promise<SessionEntity> {
    const tokens = await this.tokensService.createSessionTokens(payload);

    await this.redisService.setObject(
      tokens.accessToken,
      payload,
      tokens.expiresIn,
    );

    await this.addSessionToList(payload.sub, tokens.accessToken);

    return tokens;
  }

  async getSession(accessToken: string): Promise<TokenPayload> {
    await this.tokensService.verifyToken(accessToken, TokenTypes.access);

    return this.redisService.getObject<TokenPayload>(accessToken);
  }

  async removeSession(userId: number, accessToken: string): Promise<void> {
    await this.redisService.delete(accessToken);
    await this.removeSessionFromList(userId, accessToken);
  }
}
