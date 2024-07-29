import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { CommentsRepository } from '../../repository/comments.repository';

export class DeleteCommentCommand {
  constructor(public readonly commentId: string) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  private readonly commentsRepository: CommentsRepository;
  constructor(commentsRepository: CommentsRepository) {
    this.commentsRepository = commentsRepository;
    console.log('DELETE COMMENT USE CASE created');
  }
  async execute(command: DeleteCommentCommand): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(command.commentId);
  }
}
