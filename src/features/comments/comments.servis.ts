import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { CommentViewModel } from './models/output/CommentViewModel';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async getCommentById(id: string): Promise<CommentViewModel | null> {
    return await this.commentsRepository.getCommentById(id);
  }
  async updateComment(
    id: string,
    upData: UpdateFeedbackModuleModel,
  ): Promise<boolean> {
    return await this.commentsRepository.updateComment(id, upData);
  }
  async updateLikeStatus(id: string, upData: any): Promise<boolean> {
    return await this.commentsRepository.updateLike(id, upData);
  }

  async deleteCommentById(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(id);
  }
}
