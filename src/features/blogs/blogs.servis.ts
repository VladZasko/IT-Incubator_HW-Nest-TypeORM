import { Injectable, Scope } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { BlogsViewModel } from './models/output/BlogsViewModel';
import { UpdateBlogModel } from './models/input/UpdateBlogModule';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { PostsViewModel } from '../posts/models/output/PostsViewModel';

@Injectable({ scope: Scope.DEFAULT })
export class BlogsService {
  private readonly blogsRepository;
  constructor(blogsRepository: BlogsRepository) {
    this.blogsRepository = blogsRepository;
    console.log('SERVICE created');
  }

  async createPostBlog(
    blogId: string,
    createData: CreatePostBlogModel,
  ): Promise<PostsViewModel | null> {
    const blog = await this.blogsRepository.getBlog(blogId);

    if (!blog) return null;
    const newPostBlog = {
      ...createData,
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likes: [],
        dislikes: [],
      },
    };

    return await this.blogsRepository.createPostBlog(newPostBlog);
  }
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
  async updateBlog(id: string, updateData: UpdateBlogModel): Promise<boolean> {
    return await this.blogsRepository.updateBlog(id, updateData);
  }
  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id);
  }
}
