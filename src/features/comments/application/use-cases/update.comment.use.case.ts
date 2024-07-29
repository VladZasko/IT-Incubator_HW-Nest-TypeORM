import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { UpdateFeedbackModuleModel } from '../../models/input/UpdateFeedbackModule';
import { CommentsRepository } from '../../repository/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly id: string,
    public readonly updateData: UpdateFeedbackModuleModel,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  private readonly commentsRepository: CommentsRepository;
  constructor(commentsRepository: CommentsRepository) {
    this.commentsRepository = commentsRepository;
    console.log('UPDATE COMMENT USE CASE created');
  }
  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const updateComment = await this.commentsRepository.getCommentById(
      command.id,
    );

    updateComment!.content = command.updateData.content;

    return await this.commentsRepository.updateComment(updateComment!);
  }
}
