import { Length, Matches } from 'class-validator';

export class CreatePostBlogModel {
  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 30)
  title: string;

  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 100)
  shortDescription: string;

  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 1000)
  content: string;
}

export type CreatePostBlogRepoModel = {
  /**
   * blog name, description, websiteUrl
   */
  id: string;
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
