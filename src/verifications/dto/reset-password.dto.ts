import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PASSWORD_REGEX } from 'src/common/constants/regular-expressions';
import {
  PASSWORD_ERROR,
  PASSWORD_EXAMPLE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from 'src/common/constants/validations';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_ERROR,
  })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @ApiProperty({ example: PASSWORD_EXAMPLE })
  password: string;
}
