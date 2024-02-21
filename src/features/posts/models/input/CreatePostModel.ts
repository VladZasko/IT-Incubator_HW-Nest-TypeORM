export type CreatePostServiceModel = {
  /**
   * Post title, shortDescription, content, blogId
   */
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type CreatePostReposModel = {
  /**
   * Post title, shortDescription, content, blogId
   */
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};
