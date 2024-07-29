import { BlogsSaRepository } from '../../repository/blogs.sa.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { BlogIdModel } from '../../models/input/BlogIdModel';
import { UpdatePostByBlogModel } from '../../models/input/UpdatePostByBlogModel';

export class UpdatePostByBlogCommand {
  constructor(
    public id: BlogIdModel,
    public updateData: UpdatePostByBlogModel,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogUseCase
  implements ICommandHandler<UpdatePostByBlogCommand>
{
  private readonly blogsSaRepository: BlogsSaRepository;
  constructor(blogsSaRepository: BlogsSaRepository) {
    this.blogsSaRepository = blogsSaRepository;
    console.log('UPDATE POST BY BLOG USE CASE created');
  }
  async execute(command: UpdatePostByBlogCommand): Promise<boolean> {
    const updatePost = await this.blogsSaRepository.getPostByBlog(command.id);

    if (!updatePost) throw new NotFoundException('Post is not found');

    updatePost.title = command.updateData.title;
    updatePost.shortDescription = command.updateData.shortDescription;
    updatePost.content = command.updateData.content;

    return await this.blogsSaRepository.updatePostByBlog(updatePost);
  }
}
