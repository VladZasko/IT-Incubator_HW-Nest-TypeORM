import { LikesStatus } from '../../../posts/models/output/PostsViewModel';

export type UpdateLikesModule = {
  /**
   *  Post content
   */
  likeStatus: LikesStatus;
};
