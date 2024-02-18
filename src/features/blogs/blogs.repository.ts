import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDBType, BlogDocument } from '../../db/schemes/blogs.schemes';
import { Model } from 'mongoose';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { blogMapper } from './mappers/mapper';
import { CreateBlogReposModel } from './models/input/CreateBlogModel';
import { BlogsViewModel } from './models/output/BlogsViewModel';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(BlogDBType.name) private blogModel: Model<BlogDocument>,
  ) {}

  async createBlog(
    createBlogDto: CreateBlogReposModel,
  ): Promise<BlogsViewModel> {
    const createdBlog = new this.blogModel(createBlogDto);
    return createdBlog.save();
  }
}
