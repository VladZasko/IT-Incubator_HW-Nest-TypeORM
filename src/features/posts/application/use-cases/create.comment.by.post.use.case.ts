import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { PostsRepository } from '../../repository/posts.repository';
import { CreateCommentServiceModel } from '../../../comments/models/input/CreateCommentModel';
import { Comment } from '../../../../db/entitys/comments.entity';
import { CommentViewModel } from '../../../comments/models/output/CommentViewModel';

export class CreateCommentByPostCommand {
  constructor(
    public readonly createData: CreateCommentServiceModel,
    public readonly postId: string,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostUseCase
  implements ICommandHandler<CreateCommentByPostCommand>
{
  private readonly postsRepository: PostsRepository;
  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
    console.log('CREATE COMMENT BY POST USE CASE created');
  }
  async execute(
    command: CreateCommentByPostCommand,
  ): Promise<CommentViewModel> {
    const newComment = new Comment();

    newComment.id = uuidv4();
    newComment.content = command.createData.content;
    newComment.userId = command.createData.userId;
    newComment.createdAt = new Date().toISOString();
    newComment.postId = command.postId;

    return await this.postsRepository.createCommentByPost(newComment);
  }
}
