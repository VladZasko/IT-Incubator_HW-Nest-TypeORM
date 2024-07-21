import { IsIn, IsOptional, IsUppercase } from 'class-validator';

export class QueryBlogsModel {
  /**
   * This title should be included in Title of found Blogs
   */
  searchNameTerm?: string;
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortDirection?: 'asc' | 'desc' | 'ASC' | 'DESC';
  // sortDirection?: 'ASC' | 'DESC';

  pageNumber?: number;
  pageSize?: number;
}
