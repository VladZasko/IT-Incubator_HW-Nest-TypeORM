import { v4 as uuidv4 } from 'uuid';
import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { Post } from '../../../../db/entitys/post.entity';
import { CreatePostBlogModel } from '../../models/input/CreatePostByBlogModel';
import { PostsViewModel } from '../../../posts/models/output/PostsViewModel';

export class CreatePostByBlogCommand {
  constructor(
    public blogId: string,
    public createData: CreatePostBlogModel,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogUseCase
  implements ICommandHandler<CreatePostByBlogCommand>
{
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('CRATE POST BY BLOG USE CASE created');
  }
  async execute(
    command: CreatePostByBlogCommand,
  ): Promise<PostsViewModel | null> {
    const blog = await this.blogsSaRepository.getBlog(command.blogId);

    if (!blog) return null;

    const newPostByBlog = new Post();

    newPostByBlog.id = uuidv4();
    newPostByBlog.blogId = command.blogId;
    newPostByBlog.title = command.createData.title;
    newPostByBlog.content = command.createData.content;
    newPostByBlog.shortDescription = command.createData.shortDescription;
    newPostByBlog.createdAt = new Date().toISOString();

    return await this.blogsSaRepository.createPostBlog(newPostByBlog);
  }
}
