import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from 'src/common/constants/validations';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  username?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: Express.Multer.File;
}
