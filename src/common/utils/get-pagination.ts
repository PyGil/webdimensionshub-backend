import { PaginationDto } from '../dto/pagination.dto';

export const getPagination = (query: PaginationDto, count: number) => {
  const nextOffset = query.offset + query.limit;
  const nextPage = Math.round((query.offset + query.limit) / query.limit) + 1;

  return {
    nextOffset: nextOffset < count ? nextOffset : null,
    nextPage: nextOffset < count ? nextPage : null,
    totalCount: count,
  };
};
