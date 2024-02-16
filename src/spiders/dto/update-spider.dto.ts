import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import {
  SPIDER_NAME_MAX_LENGTH,
  SPIDER_DESCRIPTION_MAX_LENGTH,
} from 'src/common/constants/validations';

export class UpdateSpiderDto {
  @IsString()
  @IsOptional()
  @MaxLength(SPIDER_NAME_MAX_LENGTH)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(SPIDER_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;
}
