export type CreateCommentModel = {
  /**
   * Post title, shortDescription, content, blogId
   */
  content: string;
};
export type CreateCommentServiceModel = {
  /**
   * Post title, shortDescription, content, blogId
   */
  content: string;
  userId: string;
  userLogin: string;
};

export type CreateCommentModelRepo = {
  content: string;
  commentatorInfo: commentatorInfoModel;
  createdAt: string;
  likesInfo: likesInfoModel;
  postId: string;
};
export class commentatorInfoModel {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}
export class likesInfoModel {
  constructor(
    public likes: Array<string>,
    public dislikes: Array<string>,
  ) {}
}
