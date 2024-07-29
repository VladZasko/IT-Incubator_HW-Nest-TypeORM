import { Injectable, Scope } from '@nestjs/common';
import { QueryBlogsModel } from '../models/input/QueryBlogsModules';
import { BlogsViewModel } from '../models/output/BlogsViewModel';
import { postQueryMapper } from '../../posts/mappers/mappers';
import { QueryPostsModel } from '../../posts/models/input/QueryPostsModule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../../../db/entitys/blog.entity';
import { Post } from '../../../db/entitys/post.entity';
import { Like } from '../../../db/entitys/like.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}
  async findBlogs(term: QueryBlogsModel) {
    const searchNameTerm = term.searchNameTerm ?? null;
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

    const queryBuilder = this.blogRepository.createQueryBuilder('b');

    if (searchNameTerm) {
      queryBuilder.where('LOWER(b.name) LIKE :nameTerm', {
        nameTerm: `%${searchNameTerm.toLowerCase()}%`,
      });
    }

    const blogs = await queryBuilder
      .orderBy(`b.${sortBy}`, sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    const totalCount: number = await queryBuilder.getCount();

    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: blogs,
    };
  }
  async getPostsByBlogId(
    term: QueryPostsModel,
    blogId: string,
    userId?: string,
  ) {
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

    const queryBuilder = this.postRepository
      .createQueryBuilder('p')
      .select(['p', 'b.name'])
      .leftJoin('p.blog', 'b')
      .addSelect((qb) => {
        return qb
          .select('b.name', 'p_blogName')
          .from('Blog', 'b')
          .where('b.id = p.blogId');
      })
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
      .where('p.blogId = :blogId', { blogId })
      .orderBy(`p.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    const posts = await queryBuilder.getRawMany();

    // const queryBuilder3 = this.postRepository
    //   .createQueryBuilder('p')
    //   .select([
    //     'p',
    //     'b.name as blogName',
    //     'COALESCE(lc.like_count, 0) as likeCount',
    //     'COALESCE(lc.dislike_count, 0) as dislikeCount',
    //     'l.status as userStatus',
    //   ])
    //   .leftJoin('p.blog', 'b')
    //   .leftJoin(
    //     (qb) =>
    //       qb
    //         .select([
    //           'l.postId as postId',
    //           "COUNT(CASE WHEN l.status = 'Like' THEN 1 END) as like_count",
    //           "COUNT(CASE WHEN l.status = 'Dislike' THEN 1 END) as dislike_count",
    //         ])
    //         .from(Like, 'l')
    //         .groupBy('l.postId'),
    //     'lc',
    //     'p.id = lc.postId',
    //   )
    //   .leftJoin('Like', 'l', 'p.id = l.postId AND l.userId = :userId', {
    //     userId,
    //   })
    //   .where('b.id = :blogId', { blogId });
    // .orderBy(`p.${sortBy}`, sortDirection)
    // .limit(pageSize)
    // .offset((pageNumber - 1) * pageSize);
    //
    // const posts2 = await queryBuilder3.getRawMany();
    //
    // console.log(posts2);

    const queryBuilder2 = await this.likeRepository
      .createQueryBuilder('l')
      // .addSelect((qb) => {
      //   return qb
      //     .select('u.login', 'l_login')
      //     .from('User', 'u')
      //     .where('u.id = l.userId');
      // })
      .select(['l', 'u.login as userLogin'])
      .leftJoin('User', 'u', 'l.userId = u.id')
      .where('l.status = :status', { status: 'Like' })
      .getRawMany();

    const totalCount: number = await this.postRepository
      .createQueryBuilder('p')
      .where('p.blogId = :blogId', { blogId: blogId })
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
  async getBlogById(id: string): Promise<BlogsViewModel | null> {
    return this.blogRepository.findOneBy({ id: id });
  }
}
