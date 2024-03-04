import { Length } from 'class-validator';

export class CreatePostBlogModel {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;
}

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
