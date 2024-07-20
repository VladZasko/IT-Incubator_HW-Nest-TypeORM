export type QueryBlogsModel = {
  /**
   * This title should be included in Title of found Blogs
   */
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
};
