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
    .filter((x) => x.l_postId === postDb.p_id)
    .sort((a, b) => (a.l_createdAt < b.l_createdAt ? 1 : -1))
    .slice(0, 3)
    .map((x) => ({
      addedAt: x.l_createdAt,
      userId: x.l_userId,
      login: x.userlogin,
    }));

  console.log(likes);

  return {
    id: postDb.p_id,
    title: postDb.p_title,
    shortDescription: postDb.p_shortDescription,
    content: postDb.p_content,
    blogId: postDb.p_blogId,
    blogName: postDb.b_name,
    createdAt: postDb.p_createdAt,
    extendedLikesInfo: {
      likesCount: +postDb.p_likeCount ?? 0,
      dislikesCount: +postDb.p_dislikeCount ?? 0,
      myStatus: postDb.p_userStatus ?? 'None',
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
