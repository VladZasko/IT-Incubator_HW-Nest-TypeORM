export type QueryUserModel = {
  /**
   * This title should be included in Title of found Blogs
   */
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
};
