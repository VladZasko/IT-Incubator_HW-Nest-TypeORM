import { Length, Matches } from 'class-validator';
/*export type CreateBlogModel = {
  name: string;
  description: string;
  websiteUrl: string;
};*/

export class CreateBlogModel {
  @Length(1, 15)
  name: string;

  @Length(1, 500)
  description: string;

  @Length(1, 100)
  @Matches(`^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$`)
  websiteUrl: string;
}

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
