import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { UpdateBlogModel } from '../../models/input/UpdateBlogModule';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly updateData: UpdateBlogModel,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('UPDATE BLOG USE CASE created');
  }
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const updateBlog = await this.blogsSaRepository.getBlog(command.id);

    if (!updateBlog) throw new NotFoundException('Blog is not found');

    updateBlog.name = command.updateData.name;
    updateBlog.websiteUrl = command.updateData.websiteUrl;
    updateBlog.description = command.updateData.description;

    return await this.blogsSaRepository.updateBlog(updateBlog);
  }
}
