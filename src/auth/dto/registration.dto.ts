import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

import { PASSWORD_REGEX } from 'src/common/constants/regular-expressions';
import {
  EMAIL_EXAMPLE,
  PASSWORD_ERROR,
  PASSWORD_EXAMPLE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from 'src/common/constants/validations';

export class RegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: EMAIL_EXAMPLE })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

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
