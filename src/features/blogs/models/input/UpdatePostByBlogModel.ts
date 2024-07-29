import { Length, Matches } from 'class-validator';

export class UpdatePostByBlogModel {
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
