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
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
@Injectable()
export class CommentsRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}

  // async getCommentById(id: string): Promise<any | null> {
  //   const comment = await this.commentModel.findById({ _id: new ObjectId(id) });
  //
  //   if (!comment) {
  //     return null;
  //   }
  //   return commentMapper(comment);
  // }

  async updateComment(
    id: string,
    upData: UpdateFeedbackModuleModel,
  ): Promise<boolean> {
    const query = `
            UPDATE public."Comments"
            SET "content"=$2
            WHERE "id" = $1;
            `

    const result = await this.dataSource.query(
        query,[
          id,
          upData.content,
        ]);

    return result.rowCount !== 0;
  }
  async getLikeOrDislike(commentId: string, userId: string): Promise<any> {
    const query = `
            SELECT *
            FROM public."Likes"
            WHERE "commentId" = $1 AND "userId" = $2
            `

    const result = await this.dataSource.query(
        query,[
          commentId,
          userId
        ]);

    if(!result[0]) return null

    return result[0];
  }

  async updateLikeOrDislike(likesData: any): Promise<any> {
    const query = `
            UPDATE public."Likes" as l
            SET status=$3
            WHERE l."userId" = $1 AND l."commentId" = $2;
            `

    await this.dataSource.query(
        query,[
          likesData.userId,
          likesData.commentId,
          likesData.newLikeStatus,
        ]);

    return true;
  }

  async addLikeOrDislike(likesData: any): Promise<any> {
    const query = `
            INSERT INTO public."Likes"(
            id, "userId", "commentId", status, "createdAt")
            VALUES ($1, $2, $3, $4, $5);
            `
    await this.dataSource.query(
        query,[
          likesData.id,
          likesData.userId,
          likesData.commentId,
          likesData.newLikeStatus,
          likesData.createdAt,
        ]);

    return true;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const query = `
            DELETE FROM public."Comments"
            WHERE "id" = $1
            RETURNING id;
            `
    const result =await this.dataSource.query(
        query,[
          id
        ]);

    if(result[1] === 0){
      return false
    }

    return true;
  }
}
