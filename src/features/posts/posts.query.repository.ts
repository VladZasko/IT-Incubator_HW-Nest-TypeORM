import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsViewModel } from './models/output/PostsViewModel';
import { ObjectId } from 'mongodb';
import { QueryPostsModel } from './models/input/QueryPostsModule';
import { PostDBType, PostDocument } from '../../db/schemes/posts.schemes';
import { postQueryMapper } from './mappers/mappers';
import { QueryCommentModule } from '../comments/models/input/QueryCommentModule';
import { CommentViewModelGetAllComments } from '../comments/models/output/CommentViewModel';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentQueryMapper } from '../comments/mappers/mappers';
@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostDBType.name) private postModel: Model<PostDocument>,
    @InjectModel(CommentDBType.name)
    private commentModel: Model<CommentDocument>,
  ) {}
  async getAllPosts(sortData: QueryPostsModel, likeStatusData: string) {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';

    const filter = {};

    const posts = await this.postModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip((pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount = await this.postModel.countDocuments(filter);

    const pagesCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: posts.map((posts) => postQueryMapper(posts, likeStatusData)),
    };
  }
  async getCommentByPostId(
    sortData: QueryCommentModule,
    id: string,
    likeStatusData?: string,
  ): Promise<CommentViewModelGetAllComments> {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';

    const comments = await this.commentModel
      .find({ postId: id })
      .sort([[sortBy, sortDirection]])
      .skip((pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount = await this.commentModel.countDocuments({ postId: id });

    const pagesCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: comments.map((comment) =>
        commentQueryMapper(comment, likeStatusData),
      ),
    };
  }
  async getPostById(
    id: string,
    likeStatusData?: string,
  ): Promise<PostsViewModel | null> {
    const post = await this.postModel.findOne({ _id: new ObjectId(id) });
    if (!post) {
      return null;
    }
    return postQueryMapper(post, likeStatusData);
  }
}
