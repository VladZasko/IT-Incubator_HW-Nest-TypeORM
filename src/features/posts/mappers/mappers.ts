import { LikesStatus, PostsViewModel } from '../models/output/PostsViewModel';
import { PostDBType } from '../../../db/schemes/posts.schemes';
import { WithId } from 'mongodb';

export const postQueryMapper = (
  postDb: WithId<PostDBType>,
  Id?: string,
): PostsViewModel => {
  const isLiked = postDb!.likesInfo.likes.some((obj) => obj.userId === Id);
  const isDisliked = postDb!.likesInfo.dislikes.some(
    (obj) => obj.userId === Id,
  );

  let likeStatus = LikesStatus.None;

  if (isLiked) {
    likeStatus = LikesStatus.Like;
  }
  if (isDisliked) {
    likeStatus = LikesStatus.Dislike;
  }

  postDb.likesInfo.likes.reverse();

  const threeNewestUsers = postDb.likesInfo.likes.slice(0, 3);

  return {
    id: postDb._id.toString(),
    title: postDb.title,
    shortDescription: postDb.shortDescription,
    content: postDb.content,
    blogId: postDb.blogId,
    blogName: postDb.blogName,
    createdAt: postDb.createdAt,
    extendedLikesInfo: {
      likesCount: postDb.likesInfo?.likes?.length ?? 0,
      dislikesCount: postDb.likesInfo?.dislikes?.length ?? 0,
      myStatus: likeStatus,
      newestLikes: threeNewestUsers,
    },
  };
};
export const postMapper = (postDb: WithId<PostDBType>) => {
  return {
    id: postDb._id.toString(),
    title: postDb.title,
    shortDescription: postDb.shortDescription,
    content: postDb.content,
    blogId: postDb.blogId,
    blogName: postDb.blogName,
    createdAt: postDb.createdAt,
  };
};
