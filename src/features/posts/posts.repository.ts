import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LikesStatus,
  NewestLikesType,
  PostsViewModel,
} from './models/output/PostsViewModel';
import { ObjectId } from 'mongodb';
import { PostDBType, PostDocument } from '../../db/schemes/posts.schemes';
import { UpdatePostModel } from './models/input/UpdatePostModule';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { CreateCommentModelRepo } from '../comments/models/input/CreateCommentModel';
import { CommentViewModel } from '../comments/models/output/CommentViewModel';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {BlogDBType} from "../../db/schemes/blogs.schemes";
import {CreateBlogReposModel} from "../blogs/models/input/CreateBlogModel";
import {BlogsViewModel} from "../blogs/models/output/BlogsViewModel";
@Injectable()
export class PostsRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {
  }
    async getLikeOrDislike(postId: string, userId: string): Promise<any> {
        const query = `
            SELECT *
            FROM public."Likes"
            WHERE "postId" = $1 AND "userId" = $2
            `

        const result = await this.dataSource.query(
            query,[
                postId,
                userId
            ]);

        if(!result[0]) return null

        return result[0];
    }

    async updateLikeOrDislike(likesData: any): Promise<any> {
        const query = `
            UPDATE public."Likes" as l
            SET status=$3
            WHERE l."userId" = $1 AND l."postId" = $2;
            `

        await this.dataSource.query(
            query,[
                likesData.userId,
                likesData.postId,
                likesData.newLikeStatus,
            ]);

        return true;
    }

    async addLikeOrDislike(likesData: any): Promise<any> {
        const query = `
            INSERT INTO public."Likes"(
            id, "userId", "postId", status, "createdAt")
            VALUES ($1, $2, $3, $4, $5);
            `

        await this.dataSource.query(
            query,[
                likesData.id,
                likesData.userId,
                likesData.postId,
                likesData.newLikeStatus,
                likesData.createdAt,
            ]);

        return true;
    }

    async getLike(postId: string, userId: string): Promise<any> {
        const query = `
            SELECT *
            FROM public."LikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2
            `

        const result = await this.dataSource.query(
            query,[
                postId,
                userId
            ]);

        return result[0];
    }

    async getDislike(postId: string, userId: string): Promise<any> {
        const query = `
            SELECT *
            FROM public."DislikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2
            `

        const result = await this.dataSource.query(
            query,[
                postId,
                userId
            ]);

        return result[0];
    }

    async deleteLike(userId: string, postId: string): Promise<boolean> {
        const query = `
            DELETE FROM public."LikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2 RETURNING id;
            `
        const result =await this.dataSource.query(
            query,[
                postId,
                userId
            ]);

        if(result[1] === 0){
            return false
        }

        return true;
    }

    async deleteDislike(userId: string, postId: string): Promise<boolean> {
        const query = `
            DELETE FROM public."DislikesForPosts"
            WHERE "postId" = $1 AND "userId" = $2 RETURNING id;
            `
        const result =await this.dataSource.query(
            query,[
                postId,
                userId
            ]);

        if(result[1] === 0){
            return false
        }

        return true;
    }

    async addLike(likesData: any): Promise<any> {
        const query = `
            INSERT INTO public."LikesForPosts"(
            id, "postId", "userId", "createdAt")
            VALUES ($1, $2, $3, $4);
            `

        await this.dataSource.query(
            query,[
                likesData.id,
                likesData.postId,
                likesData.userId,
                likesData.addedAt,
            ]);

        return true;
    }

    async addDislike(likesData: any): Promise<any> {
        const query = `
            INSERT INTO public."DislikesForPosts"(
            id, "postId", "userId", "createdAt")
            VALUES ($1, $2, $3, $4);
            `

        await this.dataSource.query(
            query,[
                likesData.id,
                likesData.postId,
                likesData.userId,
                likesData.addedAt,
            ]);

        return true;
    }
  // async createPost(createPostDto: any): Promise<PostsViewModel> {
  //   const createdPost = new this.postModel(createPostDto);
  //   await createdPost.save();
  //   return {
  //     id: createdPost.id,
  //     title: createPostDto.title,
  //     shortDescription: createPostDto.shortDescription,
  //     content: createPostDto.content,
  //     blogId: createPostDto.blogId,
  //     blogName: createPostDto.blogName,
  //     createdAt: createPostDto.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: createPostDto.likesInfo.likes.length,
  //       dislikesCount: createPostDto.likesInfo.likes.length,
  //       myStatus: LikesStatus.None,
  //       newestLikes: [],
  //     },
  //   };
  // }
  // async updatePost(
  //   id: string,
  //   updatePostDto: UpdatePostModel,
  // ): Promise<boolean> {
  //   const foundPost = await this.postModel.updateOne(
  //     { _id: new ObjectId(id) },
  //     {
  //       $set: {
  //         title: updatePostDto.title,
  //         shortDescription: updatePostDto.shortDescription,
  //         content: updatePostDto.content,
  //         blogId: updatePostDto.blogId,
  //       },
  //     },
  //   );
  //   return !!foundPost.matchedCount;
  //
  // }
  async createCommentByPost(
      createData: CreateCommentModelRepo,
  ): Promise<any> {
    const query = `
            INSERT INTO public."Comments"(
            id, content, "createdAt", "postId", "userId")
            VALUES ($1, $2, $3, $4, $5);
            `

    await this.dataSource.query(
        query, [
          createData.id,
          createData.content,
          createData.createdAt,
          createData.postId,
          createData.userId,
        ]);

    const query2 = `
        SELECT c.*, u."login" as "userLogin"
            FROM public."Comments" as c
            LEFT JOIN "Users" as u
            ON c."userId" = u."id"
            WHERE c."id" = $1
            `

    const result = await this.dataSource.query(
        query2, [
          createData.id,
        ]);

    return {
      id: result[0].id,
      content: result[0].content,
      commentatorInfo: {
        userId: result[0].userId,
        userLogin: result[0].userLogin,
      },
      createdAt: result[0].createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
      },
    };

    // async deletePost(id: string): Promise<boolean> {
    //   const foundPost = await this.postModel.deleteOne({ _id: new ObjectId(id) });
    //
    //   return !!foundPost.deletedCount;
    // }
  }
}
