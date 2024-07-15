import {Injectable, NotFoundException, Scope} from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { BlogsViewModel } from './models/output/BlogsViewModel';
import { UpdateBlogModel } from './models/input/UpdateBlogModule';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { PostsViewModel } from '../posts/models/output/PostsViewModel';
import { v4 as uuidv4 } from 'uuid';
import {BlogsSaRepository} from "./blogs.sa.repository";
import {BlogIdModel} from "./models/input/BlogIdModel";
import {UpdatePostByBlogModel} from "./models/input/UpdatePostByBlogModel";


@Injectable({ scope: Scope.DEFAULT })
export class BlogsService {
  private readonly blogsRepository;
  private readonly blogsSaRepository;
  constructor(blogsRepository: BlogsRepository, blogsSaRepository:BlogsSaRepository) {
    this.blogsRepository = blogsRepository;
    this.blogsSaRepository = blogsSaRepository;
    console.log('SERVICE created');
  }

  async createPostBlog(
    blogId: string,
    createData: CreatePostBlogModel,
  ): Promise<PostsViewModel | null> {
    const blog = await this.blogsSaRepository.getBlog(blogId);

    if (!blog) return null;
    const newPostBlog = {
      ...createData,
      id: uuidv4(),
      blogId: blogId,
      createdAt: new Date().toISOString(),
    };

    return await this.blogsSaRepository.createPostBlog(newPostBlog);
  }
  async createBlog(
    createBlogDto: CreateBlogModel,
  ): Promise<null | BlogsViewModel> {
    const newBlog = {
      id: uuidv4(),
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createBlog = await this.blogsSaRepository.createBlog(newBlog);

    return createBlog;
  }
  async updateBlog(id: string, updateData: UpdateBlogModel): Promise<boolean> {
    const blog = await this.blogsSaRepository.getBlog(id);

    if (!blog) throw new NotFoundException('Blog is not found');

    return await this.blogsSaRepository.updateBlog(id, updateData);
  }

  async updatePostByBlog(id: BlogIdModel, updateData: UpdatePostByBlogModel): Promise<boolean> {
    const post = await this.blogsSaRepository.getPostByBlog(id);

    if (!post) throw new NotFoundException('Post is not found');

    return await this.blogsSaRepository.updatePostByBlog(id, updateData);
  }
  async deleteBlogById(id: string): Promise<boolean> {
    const blog = await this.blogsSaRepository.getBlog(id);

    if (!blog) throw new NotFoundException('Blog is not found');

    return await this.blogsSaRepository.deleteBlog(id);
  }

  async deletePostByBlog(id: BlogIdModel): Promise<boolean> {
    const post = await this.blogsSaRepository.getPostByBlog(id);

    if (!post) throw new NotFoundException('Post is not found');

    return await this.blogsSaRepository.deleteBlogByPost(id);
  }
}
