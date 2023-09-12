import { IsNotEmpty, IsString } from 'class-validator';

export class SendDeleteAccountEmailDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
