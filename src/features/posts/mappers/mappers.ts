import { LikesStatus, PostsViewModel } from '../models/output/PostsViewModel';
import { PostDBType } from '../../../db/schemes/posts.schemes';
import { WithId } from 'mongodb';

export const postQueryMapper = (
  postDb: any,
  likes?: any,
  // Id?: string,
): PostsViewModel => {
  // const isLiked = likesInfo.likes.some((obj) => obj.userId === Id);
  // const isDisliked = likesInfo.dislikes.some(
  //   (obj) => obj.userId === Id,
  // );
  //
  // let likeStatus = LikesStatus.None;
  //
  // if (isLiked) {
  //   likeStatus = LikesStatus.Like;
  // }
  // if (isDisliked) {
  //   likeStatus = LikesStatus.Dislike;
  // }
  //
  // postDb.likesInfo.likes.reverse();

  const threeNewestUsers = likes
    .filter((x) => x.postId === postDb.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3)
    .map((x) => ({ addedAt: x.createdAt, userId: x.userId, login: x.login }));

  console.log(threeNewestUsers);

  return {
    id: postDb.id,
    title: postDb.title,
    shortDescription: postDb.shortDescription,
    content: postDb.content,
    blogId: postDb.blogId,
    blogName: postDb.blogName,
    createdAt: postDb.createdAt,
    extendedLikesInfo: {
      likesCount: +postDb.likecount ?? 0,
      dislikesCount: +postDb.dislikecount ?? 0,
      myStatus: postDb.userstatus ?? 'None',
      newestLikes: threeNewestUsers,
    },
  };
};

// export const newPostMapper = (
//     postDb: any
// ): PostsViewModel => {
//
//   let likeStatus = LikesStatus.None;
//
//   if (isLiked) {
//     likeStatus = LikesStatus.Like;
//   }
//   if (isDisliked) {
//     likeStatus = LikesStatus.Dislike;
//   }
//   return {
//     id: postDb.id,
//     title: postDb.title,
//     shortDescription: postDb.shortDescription,
//     content: postDb.content,
//     blogId: postDb.blogId,
//     blogName: postDb.blogName,
//     createdAt: postDb.createdAt,
//     extendedLikesInfo: {
//       likesCount: postDb.likesInfo?.likes?.length ?? 0,
//       dislikesCount: postDb.likesInfo?.dislikes?.length ?? 0,
//       myStatus: likeStatus,
//       newestLikes: threeNewestUsers,
//     },
//   };
// };
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
