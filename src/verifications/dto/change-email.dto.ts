import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
