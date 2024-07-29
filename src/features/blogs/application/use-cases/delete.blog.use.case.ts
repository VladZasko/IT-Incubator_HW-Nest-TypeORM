import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Scope } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('DELETE BLOG USE CASE created');
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blog = await this.blogsSaRepository.getBlog(command.id);

    if (!blog) throw new NotFoundException('Blog is not found');

    return await this.blogsSaRepository.deleteBlog(command.id);
  }
}
