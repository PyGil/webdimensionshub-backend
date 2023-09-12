import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { EMAIL_EXAMPLE } from 'src/common/constants/validations';

export class SendResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: EMAIL_EXAMPLE })
  email: string;
}
