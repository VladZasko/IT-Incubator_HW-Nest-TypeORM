import { LikesStatus } from '../../../posts/models/output/PostsViewModel';

export class commentatorInfoModel {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}
export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: commentatorInfoModel;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikesStatus;
  };
};

export type CommentViewModelGetAllComments = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewModel[];
};
