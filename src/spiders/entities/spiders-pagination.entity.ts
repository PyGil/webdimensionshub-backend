import { SpiderEntity } from 'src/spiders/entities/spider.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPagination } from 'src/common/utils/get-pagination';

export class SpidersPaginationEntity {
  pagination: { nextOffset: number; nextPage: number; totalCount: number };
  data: SpiderEntity[];

  constructor(data: SpiderEntity[], query: PaginationDto, count: number) {
    this.data = data;
    this.pagination = getPagination(query, count);
  }
}
