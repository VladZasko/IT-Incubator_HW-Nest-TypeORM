import { v4 as uuidv4 } from 'uuid';
import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CreateBlogModel } from '../../models/input/CreateBlogModel';
import { BlogsViewModel } from '../../models/output/BlogsViewModel';
import { Blog } from '../../../../db/entitys/blog.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(public createData: CreateBlogModel) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('CREATE BLOG USE CASE created');
  }
  async execute(command: CreateBlogCommand): Promise<BlogsViewModel | null> {
    const newBlog: Blog = new Blog();

    newBlog.id = uuidv4();
    newBlog.name = command.createData.name;
    newBlog.description = command.createData.description;
    newBlog.websiteUrl = command.createData.websiteUrl;
    newBlog.createdAt = new Date().toISOString();
    newBlog.isMembership = false;

    return this.blogsSaRepository.createBlog(newBlog);
  }
}
