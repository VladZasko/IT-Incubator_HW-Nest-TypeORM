export type CreateBlogModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type CreateBlogReposModel = {
  /**
   * blog name, description, websiteUrl
   */
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
