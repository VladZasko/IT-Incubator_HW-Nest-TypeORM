import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentMapper } from './mappers/mappers';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { LikesStatus } from '../posts/models/output/PostsViewModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../../db/entitys/comments.entity';
import { Like } from '../../db/entitys/like.entity';
@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async getCommentById(id: string): Promise<Comment | null> {
    const comment = await this.commentRepository.findOneBy({ id: id });

    if (!comment) {
      return null;
    }
    return comment;
  }

  async updateComment(updateComment: Comment): Promise<boolean> {
    return !!(await this.commentRepository.save(updateComment));
  }
  async getLikeOrDislike(
    commentId: string,
    userId: string,
  ): Promise<Like | null> {
    // const query = `
    //         SELECT *
    //         FROM public."Likes"
    //         WHERE "commentId" = $1 AND "userId" = $2
    //         `;
    //
    // const result = await this.dataSource.query(query, [commentId, userId]);
    //
    // if (!result[0]) return null;
    //
    // return result[0];
    const queryBuilder = await this.likeRepository
      .createQueryBuilder('l')
      .where('l.commentId = :commentId', { commentId: commentId })
      .andWhere('l.userId = :userId', { userId: userId })
      .getOne();

    return queryBuilder;
  }

  async updateLikeOrDislike(likesData: any): Promise<any> {
    const query = `
            UPDATE public."Likes" as l
            SET status=$3
            WHERE l."userId" = $1 AND l."commentId" = $2;
            `;

    await this.dataSource.query(query, [
      likesData.userId,
      likesData.commentId,
      likesData.newLikeStatus,
    ]);

    return true;
  }

  async addLikeOrDislike(likesData: any): Promise<any> {
    // const query = `
    //         INSERT INTO public."Likes"(
    //         id, "userId", "commentId", status, "createdAt")
    //         VALUES ($1, $2, $3, $4, $5);
    //         `;
    // await this.dataSource.query(query, [
    //   likesData.id,
    //   likesData.userId,
    //   likesData.commentId,
    //   likesData.newLikeStatus,
    //   likesData.createdAt,
    // ]);
    //
    // return true;
    const addLike = await this.likeRepository.save(likesData);
    return !!addLike;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const deleteBlog = await this.commentRepository.delete({
      id: id,
    });

    return !!deleteBlog.affected;
  }
}
