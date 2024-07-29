import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { BlogIdModel } from '../../models/input/BlogIdModel';

export class DeletePostByBlogCommand {
  constructor(public id: BlogIdModel) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogUseCase
  implements ICommandHandler<DeletePostByBlogCommand>
{
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('DELETE POST BY BLOG USE CASE created');
  }
  async execute(command: DeletePostByBlogCommand): Promise<boolean> {
    const post = await this.blogsSaRepository.getPostByBlog(command.id);

    if (!post) throw new NotFoundException('Post is not found');

    return await this.blogsSaRepository.deleteBlogByPost(command.id);
  }
}
