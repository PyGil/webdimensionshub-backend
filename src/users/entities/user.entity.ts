import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole, UserStatus } from '@prisma/client';

export class UserEntity implements Omit<User, 'password'> {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  username: string;
  avatarUrl: string | null;

  @ApiProperty({ example: UserRole.user })
  role: UserRole;

  @ApiProperty({ example: UserStatus.active })
  status: UserStatus;
}
