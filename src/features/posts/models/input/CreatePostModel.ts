import { IsString, Length, Matches } from 'class-validator';

export class CreatePostServiceModel {
  /**
   * Post title, shortDescription, content, blogId
   */
  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 30)
  title: string;

  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 100)
  shortDescription: string;

  @Matches(`^(?! ).*(?<! )$`)
  @Length(1, 1000)
  content: string;

  @IsString()
  blogId: string;
}
