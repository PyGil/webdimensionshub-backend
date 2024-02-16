import { Injectable } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { RegistrationDto } from 'src/auth/dto/index';
import { omitKeysFromObject } from 'src/common/utils/omit-key-from-object';
import { S3Service } from 'src/s3/s3.service';
import { getFileNameFromS3Url } from 'src/common/utils/get-file-name-from-s3-url';

@Injectable()
export class UsersService {
  private readonly scope = {
    id: true,
    createdAt: true,
    updatedAt: true,
    email: true,
    username: true,
    role: true,
    status: true,
    avatarUrl: true,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  createUser(dto: RegistrationDto): Promise<UserEntity> {
    return this.prisma.user.create({
      data: dto,
      select: this.scope,
    });
  }

  findUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  updateUser(userId: number, dto: Partial<User>): Promise<UserEntity> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: dto,
      select: this.scope,
    });
  }

  async removeUser(userId: number): Promise<void> {
    const user = await this.findUserById(userId);

    if (user.avatarUrl) {
      await this.s3Service.deleteFile(getFileNameFromS3Url(user.avatarUrl));
    }

    await this.prisma.user.delete({ where: { id: userId } });
  }

  omitUserPrivateFields(user: User): UserEntity {
    return omitKeysFromObject(user, 'password');
  }

  blockUser(userId: number): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id: userId },
      select: this.scope,
      data: {
        status: UserStatus.blocked,
        verificationTokens: { deleteMany: {} },
      },
    });
  }

  unblockUser(userId: number): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id: userId },
      select: this.scope,
      data: {
        status: UserStatus.active,
      },
    });
  }
}
