import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { CommentViewModel } from './models/output/CommentViewModel';
import {LikesStatus} from "../posts/models/output/PostsViewModel";
import {v4 as uuidv4} from "uuid";

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
    return await this.commentsRepository.updateComment(id, upData);
  }
  async updateLikeStatus(
      commentId: string,
      userId: string,
      newLikeStatus: LikesStatus
  ): Promise<boolean> {
    const updateLikesData = {
      userId: userId,
      commentId: commentId,
      newLikeStatus
    };
    const findLikeOrDislike = await this.commentsRepository.getLikeOrDislike(commentId, userId)

    if(!findLikeOrDislike){
      if (newLikeStatus !== LikesStatus.None){
        const createLikesData = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          ...updateLikesData,
        };
        return await this.commentsRepository.addLikeOrDislike(createLikesData);
      } else {
        return true
      }
    }

    if (findLikeOrDislike.status === newLikeStatus) {
      return true;
    }

    await this.commentsRepository.updateLikeOrDislike(updateLikesData);

    return true;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
