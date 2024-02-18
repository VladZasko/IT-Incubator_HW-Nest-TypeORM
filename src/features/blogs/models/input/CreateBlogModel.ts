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

export type CreatePostBlogModel = {
  /**
   * blog name, description, websiteUrl
   */
  title: string;
  shortDescription: string;
  content: string;
};
