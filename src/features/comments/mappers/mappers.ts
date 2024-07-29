import { CommentViewModel } from '../models/output/CommentViewModel';

export const commentQueryMapper = (feedbackDb: any): CommentViewModel => {
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
