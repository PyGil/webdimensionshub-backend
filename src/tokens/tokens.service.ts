import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenOptions } from 'src/config/interfaces/token-options.interface';
import { TokenPayload } from './interfaces/token-payload.interface';
import { TokenTypes } from './constants/token-types';
import { TokensSessionEntity } from './entity/tokens-session.entity';
import { ValueOf } from 'src/common/types/value-of.type';

@Injectable()
export class TokensService {
  private readonly tokenOptions: TokenOptions;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.tokenOptions = this.configService.get<TokenOptions>('tokenOptions');
  }

  async createSessionTokens(
    payload: TokenPayload,
  ): Promise<TokensSessionEntity> {
    const { access, refresh } =
      this.configService.get<TokenOptions>('tokenOptions');

    const accessToken = await this.jwtService.signAsync(payload, access);

    const refreshToken = await this.jwtService.signAsync(
      { accessToken, ...payload },
      refresh,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: access.expiresIn,
    };
  }

  createToken<T extends object>(
    payload: T,
    tokenType: ValueOf<typeof TokenTypes>,
  ): Promise<string> {
    const options = this.tokenOptions[tokenType];

    return this.jwtService.signAsync(payload, options);
  }

  verifyToken<T extends object = any>(
    token: string,
    tokenType: ValueOf<typeof TokenTypes>,
  ): Promise<T> {
    const { secret } =
      this.configService.get<TokenOptions>('tokenOptions')[tokenType];

    return this.jwtService.verifyAsync(token, { secret });
  }
}
