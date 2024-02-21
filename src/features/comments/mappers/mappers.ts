import { WithId } from 'mongodb';
import { CommentDBType } from '../../../db/schemes/comments.schemes';
import { CommentViewModel } from '../models/output/CommentViewModel';
import { LikesStatus } from '../../posts/models/output/PostsViewModel';

export const commentQueryMapper = (
  feedbackDb: WithId<CommentDBType>,
  userId?: string,
): CommentViewModel => {
  const isLiked = feedbackDb!.likesInfo.likes.includes(userId!);
  const isDisliked = feedbackDb!.likesInfo.dislikes.includes(userId!);

  let likeStatus = LikesStatus.None;

  if (isLiked) {
    likeStatus = LikesStatus.Like;
  }
  if (isDisliked) {
    likeStatus = LikesStatus.Dislike;
  }

  return {
    id: feedbackDb._id.toString(),
    content: feedbackDb.content,
    commentatorInfo: {
      userId: feedbackDb.commentatorInfo.userId,
      userLogin: feedbackDb.commentatorInfo.userLogin,
    },
    createdAt: feedbackDb.createdAt,
    likesInfo: {
      likesCount: feedbackDb.likesInfo?.likes?.length ?? 0,
      dislikesCount: feedbackDb.likesInfo?.dislikes?.length ?? 0,
      myStatus: likeStatus,
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
