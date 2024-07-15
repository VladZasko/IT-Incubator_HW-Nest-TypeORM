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
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
@Injectable()
export class PostsQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
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
            `


    const posts = await this.dataSource.query(
        query, [likeStatusData]);

    const query2 = `
            SELECT l.*, u."login" 
            FROM public."Likes" as l
            LEFT JOIN "Users" as u
            ON l."userId" = u."id"
            WHERE l."status" = 'Like'
            `

    const likes = await this.dataSource.query(
        query2,);


    const totalCount: number = await this.dataSource.query(
        `
            SELECT COUNT(*) FROM "Posts"
            `);

    const pagesCount = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      //items: posts.map(postQueryMapper),
      items: posts.map((posts) =>
              postQueryMapper(posts, likes),
          ),
    }
  }
  // async getCommentByPostId(
  //   sortData: QueryCommentModule,
  //   id: string,
  //   likeStatusData?: string,
  // ): Promise<CommentViewModelGetAllComments> {
  //   const pageNumber = sortData.pageNumber ?? 1;
  //   const pageSize = sortData.pageSize ?? 10;
  //   const sortBy = sortData.sortBy ?? 'createdAt';
  //   const sortDirection = sortData.sortDirection ?? 'desc';
  //
  //   const comments = await this.commentModel
  //     .find({ postId: id })
  //     .sort([[sortBy, sortDirection]])
  //     .skip((pageNumber - 1) * +pageSize)
  //     .limit(+pageSize)
  //     .lean();
  //
  //   const totalCount = await this.commentModel.countDocuments({ postId: id });
  //
  //   const pagesCount = Math.ceil(totalCount / +pageSize);
  //
  //   return {
  //     pagesCount,
  //     page: +pageNumber,
  //     pageSize: +pageSize,
  //     totalCount,
  //     items: comments.map((comment) =>
  //       commentQueryMapper(comment, likeStatusData),
  //     ),
  //   };
  // }
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
            `

    const query2 = `
            SELECT 
                l."userId" AS likeUserId,
                l."postId" AS likePostId,
                d."userId" AS dislikeUserId,
                d."postId" AS dislikePostId
            FROM "LikesForPosts" l
            FULL OUTER JOIN "DislikesForPosts" d
            ON l."userId" = d."userId" AND l."postId" = d."postId"
            WHERE (l."userId" IS NULL OR d."userId" IS NULL)
                AND (l."userId" = $2 OR d."userId" = $2)
                AND (l."postId" = $1 OR d."postId" = $1);
            `

    const result = await this.dataSource.query(
        query,[
          id,
          likeStatusData,
        ]);

    const result2 = await this.dataSource.query(
        query2,[
          id,
          likeStatusData,
        ]);
    console.log(result2)
    if(!result[0]) return null

    return postQueryMapper(result[0]);
  }

  async getPostId(
      id: string,
  ): Promise<PostsViewModel | null> {
    const query = `
            SELECT p.*
            FROM public."Posts" as p
            WHERE p."id" = $1
            `


    const result = await this.dataSource.query(
        query,[
          id,
        ]);

    if(!result[0]) return null

    return result[0];
  }
}
