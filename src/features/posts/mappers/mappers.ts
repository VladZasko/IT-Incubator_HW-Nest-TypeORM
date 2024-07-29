import { PostsViewModel } from '../models/output/PostsViewModel';

export const postQueryMapper = (postDb: any, likes?: any): PostsViewModel => {
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
