import { BadRequestException, Injectable } from '@nestjs/common';
import {
  User,
  VerificationToken,
  VerificationTokenTypes,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { TokensService } from 'src/tokens/tokens.service';

@Injectable()
export class VerificationsService {
  constructor(
    private prisma: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  saveToken(
    userId: number,
    token: string,
    type: VerificationTokenTypes,
  ): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.create({
      data: { userId, token, type },
    });
  }

  getToken(
    token: string,
    type: VerificationTokenTypes,
  ): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.findFirst({
      where: {
        AND: {
          token,
          type,
        },
      },
    });
  }

  updateToken(
    tokenId: number,
    dto: Partial<Omit<VerificationToken, 'userId' | 'id'>>,
    updateUserDto: Partial<User>,
  ): Promise<VerificationToken> {
    return this.prisma.verificationToken.update({
      where: {
        id: tokenId,
      },
      data: {
        ...dto,
        user: { update: { data: updateUserDto } },
      },
    });
  }

  async validateToken<T extends object>(
    token: string,
    type: VerificationTokenTypes,
  ): Promise<{ verificationToken: VerificationToken } & T> {
    const verificationToken = await this.getToken(token, type);

    if (!verificationToken) {
      throw new BadRequestException('Link is invalid');
    }

    if (verificationToken.isUsed) {
      throw new BadRequestException('Link is already used');
    }

    try {
      return {
        verificationToken,
        ...(await this.tokensService.verifyToken(token, type)),
      };
    } catch {
      throw new BadRequestException('Link has expired');
    }
  }
}
