import { WithId } from 'mongodb';
import { CommentDBType } from '../../../db/schemes/comments.schemes';
import { CommentViewModel } from '../models/output/CommentViewModel';
import { LikesStatus } from '../../posts/models/output/PostsViewModel';

export const commentQueryMapper = (
  feedbackDb: any,
  userId?: string,
): CommentViewModel => {
  return {
    id: feedbackDb.c_id,
    content: feedbackDb.c_content,
    commentatorInfo: {
      userId: feedbackDb.c_userId,
      userLogin: feedbackDb.c_userLogin,
    },
    createdAt: feedbackDb.c_createdAt,
    likesInfo: {
      likesCount: +feedbackDb.c_likeCount,
      dislikesCount: +feedbackDb.c_dislikeCount,
      myStatus: feedbackDb.c_userStatus ?? 'None',
    },
  };
};

export const commentMapper = (feedbackDb: WithId<CommentDBType>) => {
  return {
    id: feedbackDb._id.toString(),
    content: feedbackDb.content,
    commentatorInfo: {
      userId: feedbackDb.commentatorInfo.userId,
      userLogin: feedbackDb.commentatorInfo.userLogin,
    },
    createdAt: feedbackDb.createdAt,
    likesInfo: {
      likes: feedbackDb.likesInfo.likes,
      dislikes: feedbackDb.likesInfo.dislikes,
    },
    postId: feedbackDb.postId,
  };
};
