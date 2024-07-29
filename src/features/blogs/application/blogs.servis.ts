import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { UpdateBlogModel } from '../models/input/UpdateBlogModule';
import { CreatePostBlogModel } from '../models/input/CreatePostByBlogModel';
import { PostsViewModel } from '../../posts/models/output/PostsViewModel';
import { v4 as uuidv4 } from 'uuid';
import { BlogsSaRepository } from '../repository/blogs.sa.repository';
import { BlogIdModel } from '../models/input/BlogIdModel';
import { UpdatePostByBlogModel } from '../models/input/UpdatePostByBlogModel';
import { Post } from '../../../db/entitys/post.entity';

@Injectable({ scope: Scope.DEFAULT })
export class BlogsService {
  private readonly blogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('SERVICE created');
  }

  async createPostBlog(
    blogId: string,
    createData: CreatePostBlogModel,
  ): Promise<PostsViewModel | null> {
    const blog = await this.blogsSaRepository.getBlog(blogId);

    if (!blog) return null;

    const newPostByBlog = new Post();

    newPostByBlog.id = uuidv4();
    newPostByBlog.blogId = blogId;
    newPostByBlog.title = createData.title;
    newPostByBlog.content = createData.content;
    newPostByBlog.shortDescription = createData.shortDescription;
    newPostByBlog.createdAt = new Date().toISOString();

    return await this.blogsSaRepository.createPostBlog(newPostByBlog);
  }
  async updateBlog(id: string, updateData: UpdateBlogModel): Promise<boolean> {
    const updateBlog = await this.blogsSaRepository.getBlog(id);

    if (!updateBlog) throw new NotFoundException('Blog is not found');

    updateBlog.name = updateData.name;
    updateBlog.websiteUrl = updateData.websiteUrl;
    updateBlog.description = updateData.description;

    return await this.blogsSaRepository.updateBlog(updateBlog);
  }

  async updatePostByBlog(
    id: BlogIdModel,
    updateData: UpdatePostByBlogModel,
  ): Promise<boolean> {
    const updatePost = await this.blogsSaRepository.getPostByBlog(id);

    if (!updatePost) throw new NotFoundException('Post is not found');

    updatePost.title = updateData.title;
    updatePost.shortDescription = updateData.shortDescription;
    updatePost.content = updateData.content;

    return await this.blogsSaRepository.updatePostByBlog(updatePost);
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
