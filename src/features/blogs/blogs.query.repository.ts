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

@Injectable({ scope: Scope.REQUEST })
export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogDBType.name) private blogModel: Model<BlogDocument>,
    @InjectModel(PostDBType.name) private postModel: Model<PostDocument>,
  ) {}
  async findBlogs(term: QueryBlogsModel) {
    const searchNameTerm = term.searchNameTerm ?? null;
    const sortBy = term.sortBy ?? 'createdAt';
    const sortDirection = term.sortDirection ?? 'desc';
    const pageNumber = term.pageNumber ?? 1;
    const pageSize = term.pageSize ?? 10;

    let filter = {};

    if (searchNameTerm) {
      filter = {
        name: { $regex: searchNameTerm, $options: 'i' },
      };
    }
    const blogs = await this.blogModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip((pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: blogs.map(blogMapper),
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

    const posts = await this.postModel
      .find({ blogId: blogId })
      .sort([[sortBy, sortDirection]])
      .skip((pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount = await this.postModel.countDocuments({ blogId: blogId });

    const pagesCount = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: posts.map((posts) => postQueryMapper(posts, likeStatusData)),
    };
  }
  async getBlogById(id: string): Promise<BlogsViewModel | null> {
    const blog = await this.blogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return null;
    }

    return blogMapper(blog);
  }
}
