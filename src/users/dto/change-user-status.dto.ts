import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeUserStatusDto {
  @IsEnum(UserStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;
}
