import { WithId } from 'mongodb';
import { CommentDBType } from '../../../db/schemes/comments.schemes';
import { CommentViewModel } from '../models/output/CommentViewModel';
import { LikesStatus } from '../../posts/models/output/PostsViewModel';

export const commentQueryMapper = (
  feedbackDb: any,
  userId?: string,
): CommentViewModel => {
  return {
    id: feedbackDb.id,
    content: feedbackDb.content,
    commentatorInfo: {
      userId: feedbackDb.userId,
      userLogin: feedbackDb.userLogin,
    },
    createdAt: feedbackDb.createdAt,
    likesInfo: {
      likesCount: feedbackDb.likecount,
      dislikesCount: feedbackDb.dislikecount,
      myStatus: feedbackDb.userstatus ?? 'None',
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
