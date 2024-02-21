import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikesStatus, PostsViewModel } from './models/output/PostsViewModel';
import { ObjectId } from 'mongodb';
import { PostDBType, PostDocument } from '../../db/schemes/posts.schemes';
import { UpdatePostModel } from './models/input/UpdatePostModule';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostDBType.name) private postModel: Model<PostDocument>,
    @InjectModel(CommentDBType.name)
    private commentModel: Model<CommentDocument>,
  ) {}

  async createPost(createPostDto: any): Promise<PostsViewModel> {
    const createdPost = new this.postModel(createPostDto);
    await createdPost.save();
    return {
      id: createdPost.id,
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: createPostDto.blogName,
      createdAt: createPostDto.createdAt,
      extendedLikesInfo: {
        likesCount: createPostDto.likesInfo.likes.length,
        dislikesCount: createPostDto.likesInfo.likes.length,
        myStatus: LikesStatus.None,
        newestLikes: [],
      },
    };
  }
  async updatePost(
    id: string,
    updatePostDto: UpdatePostModel,
  ): Promise<boolean> {
    const foundPost = await this.postModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: updatePostDto.title,
          shortDescription: updatePostDto.shortDescription,
          content: updatePostDto.content,
          blogId: updatePostDto.blogId,
        },
      },
    );
    return !!foundPost.matchedCount;
  }
  /*  async createCommentByPost(
    createData: CreateCommentModelRepo,
  ): Promise<CommentViewModel> {
    const comment = await this.commentModel.create({ ...createData });

    return {
      id: comment.id,
      content: createData.content,
      commentatorInfo: {
        userId: createData.commentatorInfo.userId,
        userLogin: createData.commentatorInfo.userLogin,
      },
      createdAt: createData.createdAt,
      likesInfo: {
        likesCount: createData.likesInfo.likes.length,
        dislikesCount: createData.likesInfo.dislikes.length,
        myStatus: LikesStatus.None,
      },
    };
  }*/
  async deletePost(id: string): Promise<boolean> {
    const foundPost = await this.postModel.deleteOne({ _id: new ObjectId(id) });

    return !!foundPost.deletedCount;
  }
}
