import { IsIn, IsOptional, IsUppercase } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBlogsModel {
  searchNameTerm?: string;
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @Transform(({ value }) => {
    let sortD = 'DESC';
    if (value) {
      sortD = sortD === ('asc' || 'ASC') ? 'ASC' : 'DESC';
    }
    return sortD;
  })
  sortDirection: 'ASC' | 'DESC';
  // sortDirection?: 'ASC' | 'DESC';

  pageNumber?: number;
  pageSize?: number;
}
