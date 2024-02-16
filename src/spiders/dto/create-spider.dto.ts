import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import {
  SPIDER_NAME_MAX_LENGTH,
  SPIDER_DESCRIPTION_MAX_LENGTH,
} from 'src/common/constants/validations';

export class CreateSpiderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(SPIDER_NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(SPIDER_DESCRIPTION_MAX_LENGTH)
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;
}
