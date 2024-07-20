import { Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDBType, BlogDocument } from '../../db/schemes/blogs.schemes';
import { Model } from 'mongoose';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { blogMapper } from './mappers/mapper';
import { BlogsViewModel } from './models/output/BlogsViewModel';
import { ObjectId } from 'mongodb';
import { PostDBType, PostDocument } from '../../db/schemes/posts.schemes';
import { postQueryMapper } from '../posts/mappers/mappers';
import { QueryPostsModel } from '../posts/models/input/QueryPostsModule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../../db/entitys/blog.entity';
import { Post } from '../../db/entitys/post.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogsSaQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async findBlogs(term: QueryBlogsModel) {
    const searchNameTerm = term.searchNameTerm ?? null;
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection ?? 'DESC';
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
  async getPostsByBlogId(term: QueryPostsModel, blogId: string) {
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection ?? 'desc';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

    const query = `
            SELECT p.*, b."name" as "blogName"
            FROM public."Posts" as p
            LEFT JOIN "Blogs" as b
            ON p."blogId" = b."id"
            WHERE b."id" = $1
            ORDER BY "${sortBy}"  ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `;

    const posts = await this.dataSource.query(query, [blogId]);

    const totalCount: number = await this.dataSource.query(
      `
            SELECT COUNT(*) FROM "Posts"
            WHERE "blogId" = '${blogId}'
            `,
    );

    const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: posts.map(postQueryMapper),
    };
  }
  // async getBlogById(id: string): Promise<BlogsViewModel | null> {
  //   const blog = await this.blogModel.findOne({ _id: new ObjectId(id) });
  //
  //   if (!blog) {
  //     return null;
  //   }
  //
  //   return blogMapper(blog);
  // }
}
