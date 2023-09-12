import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { EMAIL_EXAMPLE } from 'src/common/constants/validations';

export class sendEmailToChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: EMAIL_EXAMPLE })
  email: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: EMAIL_EXAMPLE })
  newEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
