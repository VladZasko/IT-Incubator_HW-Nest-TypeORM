import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { Like } from '../../../../db/entitys/like.entity';
import { CommentsRepository } from '../../repository/comments.repository';
import { LikesStatus } from '../../../posts/models/output/PostsViewModel';

export class UpdateLikeByCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly newLikeStatus: LikesStatus,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(UpdateLikeByCommentCommand)
export class UpdateLikeByCommentUseCase
  implements ICommandHandler<UpdateLikeByCommentCommand>
{
  private readonly commentsRepository: CommentsRepository;
  constructor(commentsRepository: CommentsRepository) {
    this.commentsRepository = commentsRepository;
    console.log('UPDATE LIKE BY POST USE CASE created');
  }
  async execute(command: UpdateLikeByCommentCommand): Promise<boolean> {
    const findLikeOrDislike = await this.commentsRepository.getLikeOrDislike(
      command.commentId,
      command.userId,
    );

    if (!findLikeOrDislike) {
      if (command.newLikeStatus !== LikesStatus.None) {
        const newLike = new Like();

        newLike.id = uuidv4();
        newLike.createdAt = new Date().toISOString();
        newLike.commentId = command.commentId;
        newLike.userId = command.userId;
        newLike.status = command.newLikeStatus;

        return await this.commentsRepository.addLikeOrDislike(newLike);
      } else {
        return true;
      }
    }

    if (findLikeOrDislike.status === command.newLikeStatus) {
      return true;
    }

    findLikeOrDislike.status = command.newLikeStatus;

    await this.commentsRepository.addLikeOrDislike(findLikeOrDislike);

    return true;
  }
}
