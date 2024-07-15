import { Length, Matches, NotContains } from 'class-validator';
import { ObjectId } from 'mongodb';
/*export type CreateBlogModel = {
  name: string;
  description: string;
  websiteUrl: string;
};*/

export class CreateBlogModel {
  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 15)
  name: string;

  @Matches(`^(?! ).*(?<! )$`)
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
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export class ParamIdModel {
  id: ObjectId;
}
