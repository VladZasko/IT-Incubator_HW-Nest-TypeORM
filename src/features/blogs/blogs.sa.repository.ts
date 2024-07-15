import {Injectable, Scope} from '@nestjs/common';
import {BlogDBType} from '../../db/schemes/blogs.schemes';
import {UpdateBlogModel} from './models/input/UpdateBlogModule';
import {CreateBlogReposModel} from './models/input/CreateBlogModel';
import {CreatePostBlogRepoModel} from './models/input/CreatePostByBlogModel';
import {LikesStatus, PostsViewModel} from '../posts/models/output/PostsViewModel';
import {BlogsViewModel} from './models/output/BlogsViewModel';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {BlogIdModel} from "./models/input/BlogIdModel";
import {UpdatePostByBlogModel} from "./models/input/UpdatePostByBlogModel";

@Injectable({ scope: Scope.DEFAULT })
export class BlogsSaRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async createPostBlog(
    createData: CreatePostBlogRepoModel,
  ): Promise<PostsViewModel> {
      const query = `
            INSERT INTO public."Posts"(
            id, title, "shortDescription", content, "blogId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6);
            `

      await this.dataSource.query(
          query,[
              createData.id,
              createData.title,
              createData.shortDescription,
              createData.content,
              createData.blogId,
              createData.createdAt,
          ]);

      const query2 = `
        SELECT p.*, b."name" as "blogName"
            FROM public."Posts" as p
            LEFT JOIN "Blogs" as b
            ON p."blogId" = b."id"
            WHERE p."id" = $1
            `

      const result = await this.dataSource.query(
          query2,[
              createData.id,
          ]);

    return {
        id: result[0].id,
        title: result[0].title,
        shortDescription: result[0].shortDescription,
        content: result[0].content,
        blogId: result[0].blogId,
        blogName: result[0].blogName,
        createdAt: result[0].createdAt,
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikesStatus.None,
            newestLikes: [],
        },
    };
  }
  async getPostByBlog(id: BlogIdModel): Promise<BlogDBType | null> {
      const query = `
            SELECT *
            FROM public."Posts"
            WHERE "id" = $1 and "blogId" = $2
            `

      const result = await this.dataSource.query(
          query,[
              id.postId,
              id.blogId,
          ]);

      return result[0];
  }

    async getBlog(id: string): Promise<BlogDBType | null> {
        const query = `
            SELECT *
            FROM public."Blogs"
            WHERE "id" = $1
            `

        const result = await this.dataSource.query(
            query,[
                id,
            ]);

        return result[0];
    }

    async getPost(id: string): Promise<BlogDBType | null> {
        const query = `
            SELECT *
            FROM public."Posts"
            WHERE "id" = $1
            `

        const result = await this.dataSource.query(
            query,[
                id,
            ]);

        return result[0];
    }
  async createBlog(
    createBlogDto: CreateBlogReposModel,
  ): Promise<BlogsViewModel> {
    const query = `
            INSERT INTO public."Blogs"(
            id, name, description, "websiteUrl", "isMembership", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6);
            `

    await this.dataSource.query(
        query,[
          createBlogDto.id,
          createBlogDto.name,
          createBlogDto.description,
          createBlogDto.websiteUrl,
          createBlogDto.isMembership,
          createBlogDto.createdAt,
        ]);

    return createBlogDto;
  }
  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogModel,
  ): Promise<boolean> {
    const query = `
            UPDATE public."Blogs"
            SET "name"=$1, "description"=$2, "websiteUrl"=$3
            WHERE "id" = $4;
            `

    const result = await this.dataSource.query(
        query,[
          updateBlogDto.name,
          updateBlogDto.description,
          updateBlogDto.websiteUrl,
          id,
        ]);

    return result.rowCount !== 0;

  }

    async updatePostByBlog(
        id: BlogIdModel,
        updateBlogDto: UpdatePostByBlogModel,
    ): Promise<boolean> {
        const query = `
            UPDATE public."Posts"
            SET "title"=$1, "shortDescription"=$2, "content"=$3
            WHERE "id" = $4;
            `

        const result = await this.dataSource.query(
            query,[
                updateBlogDto.title,
                updateBlogDto.shortDescription,
                updateBlogDto.content,
                id.postId,
            ]);

        return result.rowCount !== 0;

    }
  async deleteBlog(id: string): Promise<boolean> {
      const query = `
            DELETE FROM public."Blogs"
            WHERE "id" = $1 RETURNING id;
            `
      const result =await this.dataSource.query(
          query,[
              id,
          ]);

      if(result[1] === 0){
          return false
      }

      return true;
  }

    async deleteBlogByPost(id: BlogIdModel): Promise<boolean> {
        const query = `
            DELETE FROM public."Posts"
            WHERE "id" = $1 AND "blogId" = $2
            RETURNING id;
            `
        const result =await this.dataSource.query(
            query,[
                id.postId,
                id.blogId,
            ]);

        if(result[1] === 0){
            return false
        }

        return true;
    }
}
