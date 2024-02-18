import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { BlogsViewModel } from './models/output/BlogsViewModel';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async createBlog(
    createBlogDto: CreateBlogModel,
  ): Promise<null | BlogsViewModel> {
    const newBlog = {
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createBlog = await this.blogsRepository.createBlog(newBlog);

    return createBlog;
  }
}
