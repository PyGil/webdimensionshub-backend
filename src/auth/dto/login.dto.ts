import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

import {
  EMAIL_EXAMPLE,
  PASSWORD_EXAMPLE,
} from 'src/common/constants/validations';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: EMAIL_EXAMPLE })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: PASSWORD_EXAMPLE })
  password: string;
}
