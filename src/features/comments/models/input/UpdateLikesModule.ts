import { LikesStatus } from '../../../posts/models/output/PostsViewModel';
import { IsEnum } from 'class-validator';

export class UpdateLikesModule {
  /**
   *  Post content
   */
  @IsEnum(LikesStatus)
  likeStatus: LikesStatus;
}
