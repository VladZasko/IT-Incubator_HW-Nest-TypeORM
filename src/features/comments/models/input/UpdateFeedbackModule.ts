import { Length } from 'class-validator';

export class UpdateFeedbackModuleModel {
  /**
   *  Post content
   */
  @Length(20, 300)
  content: string;
}
