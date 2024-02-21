export enum LikesStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

type NewestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};

export type PostsViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikesStatus;
    newestLikes: Array<NewestLikesType>;
  };
};
