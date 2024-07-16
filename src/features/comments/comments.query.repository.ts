import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentQueryMapper } from './mappers/mappers';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
@Injectable()
export class CommentsQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}

  async getCommentById(
    id: string,
    likeStatusData?: string,
  ): Promise<any | null> {
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
            WHERE c."id" = $1
            `


    const comment = await this.dataSource.query(
        query, [id, likeStatusData]);


    if(!comment[0]) return null

    return commentQueryMapper(comment[0], likeStatusData);
  }
}
