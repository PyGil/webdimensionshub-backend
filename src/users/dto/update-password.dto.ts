import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

import { PASSWORD_REGEX } from 'src/common/constants/regular-expressions';
import {
  PASSWORD_ERROR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_EXAMPLE,
} from 'src/common/constants/validations';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_ERROR,
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @ApiProperty({ example: PASSWORD_EXAMPLE })
  newPassword: string;
}
