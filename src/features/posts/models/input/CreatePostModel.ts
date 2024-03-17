import { IsMongoId, Length, Matches } from 'class-validator';
import { IsRealBlogId } from '../../../../utils/customDecorators/BlogIdCustomDecorator';

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

  @IsRealBlogId()
  blogId: string;
}
