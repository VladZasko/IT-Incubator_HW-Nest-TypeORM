import { Injectable, Scope } from '@nestjs/common';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { blogMapper } from './mappers/mapper';
import { BlogsViewModel } from './models/output/BlogsViewModel';
import { ObjectId } from 'mongodb';
import { postQueryMapper } from '../posts/mappers/mappers';
import { QueryPostsModel } from '../posts/models/input/QueryPostsModule';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class BlogsQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async findBlogs(term: QueryBlogsModel) {
    const searchNameTerm = term.searchNameTerm ?? null;
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection ?? 'desc';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

    let filter = ``;

    if (searchNameTerm) {
      filter = `WHERE "name" ILIKE '%${searchNameTerm}%'`;
    }

    const query = `
            SELECT *
            FROM public."Blogs"
            ${filter}
            ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `

    const blogs = await this.dataSource.query(
        query);

    const totalCount: number = await this.dataSource.query(
        `
            SELECT COUNT(*) FROM "Blogs"
            ${filter}
            `);

    const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: blogs,
    };
  }
  async getPostsByBlogId(
    term: QueryPostsModel,
    blogId: string,
    likeStatusData?: string,
  ) {
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection ?? 'desc';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

      const query = `
            SELECT p.*, 
                    b."name" as "blogName",
                    COALESCE(lc.like_count, 0) as likeCount,
                    COALESCE(lc.dislike_count, 0) as dislikeCount,
            l."status" as userStatus
            FROM public."Posts" as p
            LEFT JOIN "Blogs" as b
            ON p."blogId" = b."id"
            LEFT JOIN (
            SELECT "postId", 
                 COUNT(CASE WHEN "status" = 'Like' THEN 1 END) as like_count,
           COUNT(CASE WHEN "status" = 'Dislike' THEN 1 END) as dislike_count
                FROM "Likes"
                GROUP BY "postId"
            ) as lc ON p."id" = lc."postId"
            LEFT JOIN "Likes" as l ON p."id" = l."postId" AND l."userId" = $2
            WHERE b."id" = $1 
            ORDER BY "${sortBy}"  ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `


      const posts = await this.dataSource.query(
          query, [blogId,likeStatusData]);

      const query2 = `
            SELECT l.*, u."login" 
            FROM public."Likes" as l
            LEFT JOIN "Users" as u
            ON l."userId" = u."id"
            WHERE l."status" = 'Like'
            `

      const likes = await this.dataSource.query(
          query2);


      const totalCount: number = await this.dataSource.query(
          `
            SELECT COUNT(*) FROM "Posts"
            WHERE "blogId" = '${blogId}'
            `);

      const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

      return {
          pagesCount,
          page: +pageNumber,
          pageSize: +pageSize,
          totalCount: +totalCount[0].count,
          items: posts.map((posts) =>
              postQueryMapper(posts, likes),
          ),
      }
  }
  async getBlogById(id: string): Promise<BlogsViewModel | null> {
    const query = `
            SELECT *
            FROM public."Blogs"
            WHERE "id" = $1
            `

    const result = await this.dataSource.query(
        query, [
          id,
        ]);

    return result[0];
  }
}
