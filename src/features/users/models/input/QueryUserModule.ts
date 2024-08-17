import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserModel {
  /**
   * This title should be included in Title of found Blogs
   */
  searchLoginTerm?: string;
  searchEmailTerm?: string;
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

  pageNumber?: number;
  pageSize?: number;
}
