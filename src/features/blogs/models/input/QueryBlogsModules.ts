export type QueryBlogsModel = {
  /**
   * This title should be included in Title of found Blogs
   */
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
};
