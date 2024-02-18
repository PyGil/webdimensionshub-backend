import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsOptional()
  offset?: number;

  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
