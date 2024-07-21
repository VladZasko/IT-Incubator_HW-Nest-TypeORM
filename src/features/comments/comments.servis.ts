import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { CommentViewModel } from './models/output/CommentViewModel';
import { LikesStatus } from '../posts/models/output/PostsViewModel';
import { v4 as uuidv4 } from 'uuid';
import { Like } from '../../db/entitys/like.entity';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  // async getCommentById(id: string): Promise<CommentViewModel | null> {
  //   return await this.commentsRepository.getCommentById(id);
  // }
  async updateComment(
    id: string,
    upData: UpdateFeedbackModuleModel,
  ): Promise<boolean> {
    const updateComment = await this.commentsRepository.getCommentById(id);

    updateComment!.content = upData.content;

    return await this.commentsRepository.updateComment(updateComment!);
  }
  async updateLikeStatus(
    commentId: string,
    userId: string,
    newLikeStatus: LikesStatus,
  ): Promise<boolean> {
    // const updateLikesData = {
    //   userId: userId,
    //   commentId: commentId,
    //   newLikeStatus,
    // };
    const findLikeOrDislike = await this.commentsRepository.getLikeOrDislike(
      commentId,
      userId,
    );

    if (!findLikeOrDislike) {
      if (newLikeStatus !== LikesStatus.None) {
        const newLike = new Like();

        newLike.id = uuidv4();
        newLike.createdAt = new Date().toISOString();
        newLike.commentId = commentId;
        newLike.userId = userId;
        newLike.status = newLikeStatus;

        return await this.commentsRepository.addLikeOrDislike(newLike);
      } else {
        return true;
      }
    }

    if (findLikeOrDislike.status === newLikeStatus) {
      return true;
    }

    findLikeOrDislike.status = newLikeStatus;

    await this.commentsRepository.addLikeOrDislike(findLikeOrDislike);

    return true;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
