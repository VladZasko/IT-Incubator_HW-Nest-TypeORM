export type CreatePostBlogModel = {
  /**
   * blog name, description, websiteUrl
   */
  title: string;
  shortDescription: string;
  content: string;
};

export type CreatePostBlogRepoModel = {
  /**
   * blog name, description, websiteUrl
   */
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likesInfo: {
    likes: any[];
    dislikes: any[];
  };
};
