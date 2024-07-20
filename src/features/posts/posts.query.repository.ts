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
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../../db/entitys/post.entity';
@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async getAllPosts(sortData: QueryPostsModel, likeStatusData: string) {
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';

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
            LEFT JOIN "Likes" as l ON p."id" = l."postId" AND l."userId" = $1
            ORDER BY "${sortBy}"  ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `;

    const posts = await this.dataSource.query(query, [likeStatusData]);

    const query2 = `
            SELECT l.*, u."login" 
            FROM public."Likes" as l
            LEFT JOIN "Users" as u
            ON l."userId" = u."id"
            WHERE l."status" = 'Like'
            `;

    const likes = await this.dataSource.query(query2);

    const totalCount: number = await this.dataSource.query(
      `
            SELECT COUNT(*) FROM "Posts"
            `,
    );

    const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      //items: posts.map(postQueryMapper),
      items: posts.map((posts) => postQueryMapper(posts, likes)),
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

    const query = `
            SELECT c.*, 
                    u."login" as "userLogin",
                    COALESCE(lc.like_count, 0) as likeCount,
                    COALESCE(lc.dislike_count, 0) as dislikeCount,
            l."status" as userStatus
            FROM public."Comments" as c
            LEFT JOIN "Users" as u
            ON c."userId" = u."id"
            LEFT JOIN (
            SELECT "commentId", 
                 COUNT(CASE WHEN "status" = 'Like' THEN 1 END) as like_count,
                 COUNT(CASE WHEN "status" = 'Dislike' THEN 1 END) as dislike_count
                FROM "Likes"
                GROUP BY "commentId"
            ) as lc ON c."id" = lc."commentId"
            LEFT JOIN "Likes" as l ON c."id" = l."commentId" AND l."userId" = $2
            WHERE c."postId" = $1
            ORDER BY "${sortBy}"  ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `;

    const comments = await this.dataSource.query(query, [id, likeStatusData]);

    const totalCount: number = await this.dataSource.query(
      `
            SELECT COUNT(*) FROM "Comments"
            WHERE "postId" = '${id}'
            `,
    );

    const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: comments.map((comment) => commentQueryMapper(comment)),
    };
  }
  async getPostById(
    id: string,
    likeStatusData?: string,
  ): Promise<PostsViewModel | null> {
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
            WHERE p."id" = $1
            `;

    const query2 = `
            SELECT l.*, u."login" 
            FROM public."Likes" as l
            LEFT JOIN "Users" as u
            ON l."userId" = u."id"
            WHERE l."status" = 'Like' AND l."postId" = $1
            `;

    const result = await this.dataSource.query(query, [id, likeStatusData]);

    const result2 = await this.dataSource.query(query2, [id]);

    if (!result[0]) return null;

    return postQueryMapper(result[0], result2);
  }

  async getPostId(id: string): Promise<Post | null> {
    const queryBuilder = await this.postRepository
      .createQueryBuilder('p')
      .where('p.id = :postId', { postId: id })
      .getOne();
    // const query = `
    //         SELECT p.*
    //         FROM public."Posts" as p
    //         WHERE p."id" = $1
    //         `
    //
    //
    // const result = await this.dataSource.query(
    //     query,[
    //       id,
    //     ]);
    //
    // if(!result[0]) return null

    return queryBuilder;
  }
}
