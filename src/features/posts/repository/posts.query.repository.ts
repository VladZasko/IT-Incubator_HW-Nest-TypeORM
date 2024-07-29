import { Injectable } from '@nestjs/common';
import { PostsViewModel } from '../models/output/PostsViewModel';
import { QueryPostsModel } from '../models/input/QueryPostsModule';
import { postQueryMapper } from '../mappers/mappers';
import { QueryCommentModule } from '../../comments/models/input/QueryCommentModule';
import { CommentViewModelGetAllComments } from '../../comments/models/output/CommentViewModel';
import { commentQueryMapper } from '../../comments/mappers/mappers';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../../db/entitys/post.entity';
import { Like } from '../../../db/entitys/like.entity';
import { Comment } from '../../../db/entitys/comments.entity';
@Injectable()
export class PostsQueryRepository {
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
  async getAllPosts(sortData: QueryPostsModel, userId: string) {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.postRepository
      .createQueryBuilder('p')
      .select(['p', 'b.name'])
      .leftJoin('p.blog', 'b')
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'p_likeCount')
          .from('Like', 'l')
          .where('l.postId = p.id')
          .andWhere("l.status = 'Like'");
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'p_dislikeCount')
          .from('Like', 'l')
          .where('l.postId = p.id')
          .andWhere("l.status = 'Dislike'");
      })
      .addSelect((qb) => {
        return qb
          .select('l.status', 'p_userStatus')
          .from('Like', 'l')
          .where('l.userId = :userId', { userId: userId })
          .andWhere('l.postId = p.id');
      })
      .orderBy(sortBy === 'blogName' ? `b.name` : `p.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    const posts = await queryBuilder.getRawMany();

    console.log(posts);

    const queryBuilder2 = await this.likeRepository
      .createQueryBuilder('l')
      .select(['l', 'u.login as userLogin'])
      .leftJoin('User', 'u', 'l.userId = u.id')
      .where('l.status = :status', { status: 'Like' })
      .getRawMany();

    const totalCount: number = await this.postRepository
      .createQueryBuilder('p')
      .getCount();

    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: posts.map((posts) => postQueryMapper(posts, queryBuilder2)),
    };
  }
  async getCommentByPostId(
    sortData: QueryCommentModule,
    id: string,
    userId?: string,
  ): Promise<CommentViewModelGetAllComments> {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection === 'asc' ? 'ASC' : 'DESC';

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
      .where('c.postId = :postId', { postId: id })
      .orderBy(`c.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    const comments = await queryBuilder.getRawMany();

    const totalCount: number = await this.commentRepository
      .createQueryBuilder('c')
      .where('c.postId = :id', { id })
      .getCount();

    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: comments.map((comment) => commentQueryMapper(comment)),
    };
  }
  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostsViewModel | null> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('p')
      .select(['p', 'b.name'])
      .leftJoin('p.blog', 'b')
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'p_likeCount')
          .from('Like', 'l')
          .where('l.postId = p.id')
          .andWhere("l.status = 'Like'");
      })
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)', 'p_dislikeCount')
          .from('Like', 'l')
          .where('l.postId = p.id')
          .andWhere("l.status = 'Dislike'");
      })
      .addSelect((qb) => {
        return qb
          .select('l.status', 'p_userStatus')
          .from('Like', 'l')
          .where('l.userId = :userId', { userId: userId })
          .andWhere('l.postId = p.id');
      })
      .where('p.id = :postId', { postId: postId });

    const post = await queryBuilder.getRawOne();

    const queryBuilder2 = await this.likeRepository
      .createQueryBuilder('l')
      .select(['l', 'u.login as userLogin'])
      .leftJoin('User', 'u', 'l.userId = u.id')
      .where('l.status = :status', { status: 'Like' })
      .andWhere('l.postId = :postId', { postId })
      .getRawMany();

    if (!post) return null;
    return postQueryMapper(post, queryBuilder2);
  }

  async getPostId(id: string): Promise<Post | null> {
    return this.postRepository
      .createQueryBuilder('p')
      .where('p.id = :postId', { postId: id })
      .getOne();
  }
}
