import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshSessionDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
