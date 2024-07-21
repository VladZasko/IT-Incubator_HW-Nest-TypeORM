import { IsIn, IsOptional, IsUppercase } from 'class-validator';

export class QueryCommentModule {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortDirection?: 'asc' | 'desc' | 'ASC' | 'DESC';
  //sortDirection?: 'ASC' | 'DESC';
}
