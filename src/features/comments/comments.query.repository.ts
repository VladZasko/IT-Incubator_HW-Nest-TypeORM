import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentQueryMapper } from './mappers/mappers';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../db/entitys/post.entity';
import { Comment } from '../../db/entitys/comments.entity';
import { Like } from '../../db/entitys/like.entity';
import { postQueryMapper } from '../posts/mappers/mappers';
@Injectable()
export class CommentsQueryRepository {
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

  async getCommentById(id: string, userId?: string): Promise<any | null> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('c')
      .addSelect((qb) => {
        return qb
          .select('u.login', 'c_userLogin')
          .from('User', 'u')
          .where('u.id = c.userId');
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'c_likeCount')
          .from('Like', 'l')
          .where('l.commentId = c.id')
          .andWhere("l.status = 'Like'");
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'c_dislikeCount')
          .from('Like', 'l')
          .where('l.commentId = c.id')
          .andWhere("l.status = 'Dislike'");
      })
      .addSelect((qb) => {
        return qb
          .select('l.status', 'c_userStatus')
          .from('Like', 'l')
          .where('l.userId = :userId', { userId: userId })
          .andWhere('l.commentId = c.id');
      })
      .where('c.id = :commentId', { commentId: id });

    const comments = await queryBuilder.getRawOne();

    if (!comments) return null;

    //const comment = await this.dataSource.query(query, [id, likeStatusData]);

    //if (!comment[0]) return null;

    return commentQueryMapper(comments);
  }
}
