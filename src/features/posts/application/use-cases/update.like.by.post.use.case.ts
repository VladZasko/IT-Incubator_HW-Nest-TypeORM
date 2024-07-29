import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { LikesStatus } from '../../models/output/PostsViewModel';
import { PostsRepository } from '../../repository/posts.repository';
import { Like } from '../../../../db/entitys/like.entity';

export class UpdateLikeByPostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly newLikeStatus: LikesStatus,
  ) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(UpdateLikeByPostCommand)
export class UpdateLikeByPostUseCase
  implements ICommandHandler<UpdateLikeByPostCommand>
{
  private readonly postsRepository: PostsRepository;
  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
    console.log('UPDATE LIKE BY POST USE CASE created');
  }
  async execute(command: UpdateLikeByPostCommand): Promise<boolean> {
    const findLikeOrDislike = await this.postsRepository.getLikeOrDislike(
      command.postId,
      command.userId,
    );

    if (!findLikeOrDislike) {
      if (command.newLikeStatus !== LikesStatus.None) {
        const newLike = new Like();

        newLike.id = uuidv4();
        newLike.createdAt = new Date().toISOString();
        newLike.postId = command.postId;
        newLike.userId = command.userId;
        newLike.status = command.newLikeStatus;

        return await this.postsRepository.addLikeOrDislike(newLike);
      } else {
        return true;
      }
    }

    if (findLikeOrDislike.status === command.newLikeStatus) {
      return true;
    }

    findLikeOrDislike.status = command.newLikeStatus;

    await this.postsRepository.addLikeOrDislike(findLikeOrDislike);

    return true;
  }
}
