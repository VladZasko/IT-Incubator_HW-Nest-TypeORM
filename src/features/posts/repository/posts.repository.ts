import { Injectable } from '@nestjs/common';
import { LikesStatus } from '../models/output/PostsViewModel';
import { CreateCommentModelRepo } from '../../comments/models/input/CreateCommentModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../../../db/entitys/like.entity';
import { Comment } from '../../../db/entitys/comments.entity';
import { Post } from '../../../db/entitys/post.entity';
import { CommentViewModel } from '../../comments/models/output/CommentViewModel';
@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}
  async getLikeOrDislike(postId: string, userId: string): Promise<Like | null> {
    const queryBuilder = await this.likeRepository
      .createQueryBuilder('l')
      .where('l.postId = :postId', { postId: postId })
      .andWhere('l.userId = :userId', { userId: userId })
      .getOne();

    return queryBuilder;
  }

  async updateLikeOrDislike(likesData: any): Promise<any> {
    const query = `
            UPDATE public."Likes" as l
            SET status=$3
            WHERE l."userId" = $1 AND l."postId" = $2;
            `;

    await this.dataSource.query(query, [
      likesData.userId,
      likesData.postId,
      likesData.newLikeStatus,
    ]);

    return true;
  }

  async addLikeOrDislike(likesData: any): Promise<any> {
    // const query = `
    //         INSERT INTO public."Likes"(
    //         id, "userId", "postId", status, "createdAt")
    //         VALUES ($1, $2, $3, $4, $5);
    //         `;
    //
    // await this.dataSource.query(query, [
    //   likesData.id,
    //   likesData.userId,
    //   likesData.postId,
    //   likesData.newLikeStatus,
    //   likesData.createdAt,
    // ]);

    const addLike = await this.likeRepository.save(likesData);
    return !!addLike;
  }

  async getLike(postId: string, userId: string): Promise<any> {
    const query = `
            SELECT *
            FROM public."LikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2
            `;

    const result = await this.dataSource.query(query, [postId, userId]);

    return result[0];
  }

  async getDislike(postId: string, userId: string): Promise<any> {
    const query = `
            SELECT *
            FROM public."DislikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2
            `;

    const result = await this.dataSource.query(query, [postId, userId]);

    return result[0];
  }

  async deleteLike(userId: string, postId: string): Promise<boolean> {
    const query = `
            DELETE FROM public."LikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2 RETURNING id;
            `;
    const result = await this.dataSource.query(query, [postId, userId]);

    if (result[1] === 0) {
      return false;
    }

    return true;
  }

  async deleteDislike(userId: string, postId: string): Promise<boolean> {
    const query = `
            DELETE FROM public."DislikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2 RETURNING id;
            `;
    const result = await this.dataSource.query(query, [postId, userId]);

    if (result[1] === 0) {
      return false;
    }

    return true;
  }

  async addLike(likesData: any): Promise<any> {
    const query = `
            INSERT INTO public."LikesForPosts"(
            id, "postId", "userId", "createdAt")
            VALUES ($1, $2, $3, $4);
            `;

    await this.dataSource.query(query, [
      likesData.id,
      likesData.postId,
      likesData.userId,
      likesData.addedAt,
    ]);

    return true;
  }

  async addDislike(likesData: any): Promise<any> {
    const query = `
            INSERT INTO public."DislikesForPosts"(
            id, "postId", "userId", "createdAt")
            VALUES ($1, $2, $3, $4);
            `;

    await this.dataSource.query(query, [
      likesData.id,
      likesData.postId,
      likesData.userId,
      likesData.addedAt,
    ]);

    return true;
  }
  // async createPost(createPostDto: any): Promise<PostsViewModel> {
  //   const createdPost = new this.postModel(createPostDto);
  //   await createdPost.save();
  //   return {
  //     id: createdPost.id,
  //     title: createPostDto.title,
  //     shortDescription: createPostDto.shortDescription,
  //     content: createPostDto.content,
  //     blogId: createPostDto.blogId,
  //     blogName: createPostDto.blogName,
  //     createdAt: createPostDto.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: createPostDto.likesInfo.likes.length,
  //       dislikesCount: createPostDto.likesInfo.likes.length,
  //       myStatus: LikesStatus.None,
  //       newestLikes: [],
  //     },
  //   };
  // }
  // async updatePost(
  //   id: string,
  //   updatePostDto: UpdatePostModel,
  // ): Promise<boolean> {
  //   const foundPost = await this.postModel.updateOne(
  //     { _id: new ObjectId(id) },
  //     {
  //       $set: {
  //         title: updatePostDto.title,
  //         shortDescription: updatePostDto.shortDescription,
  //         content: updatePostDto.content,
  //         blogId: updatePostDto.blogId,
  //       },
  //     },
  //   );
  //   return !!foundPost.matchedCount;
  //
  // }
  async createCommentByPost(
    createData: CreateCommentModelRepo,
  ): Promise<CommentViewModel> {
    await this.commentRepository.save(createData);

    const comment = await this.commentRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.id = :commentId', { commentId: createData.id })
      .getOne();

    return {
      id: comment!.id,
      content: comment!.content,
      commentatorInfo: {
        userId: comment!.user.id,
        userLogin: comment!.user.login,
      },
      createdAt: comment!.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
      },
    };

    // async deletePost(id: string): Promise<boolean> {
    //   const foundPost = await this.postModel.deleteOne({ _id: new ObjectId(id) });
    //
    //   return !!foundPost.deletedCount;
    // }
  }
}
