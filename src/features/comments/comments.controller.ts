import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.servis';
import { CommentsQueryRepository } from './comments.query.repository';
import { UpdateLikesModule } from './models/input/UpdateLikesModule';
import { ObjectId } from 'mongodb';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getComment(@Request() req, @Param('id') commentId: string) {
    const likeStatusData = req.user.userId;

    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      likeStatusData,
    );

    if (!comment) {
      throw new NotFoundException([
        { message: 'comment not found', field: 'comment' },
      ]);
    }

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  async updateLikeStatus(
    @Request() req,
    @Body() inputModel: UpdateLikesModule,
    @Param('id') commentId: string,
  ) {
    const upData = {
      likeStatus: inputModel.likeStatus,
      userId: req.user.userId,
    };

    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment = await this.commentsService.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const updateLikeStatus = await this.commentsService.updateLikeStatus(
      commentId,
      upData,
    );

    if (!updateLikeStatus) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    return updateLikeStatus;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateComment(
    @Request() req,
    @Body() inputModel: UpdateFeedbackModuleModel,
    @Param('id') commentId: string,
  ) {
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment = await this.commentsService.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundException([
        { message: 'comment not found', field: 'comment' },
      ]);
    }

    if (comment!.commentatorInfo.userId !== req.user!.userId) {
      throw new ForbiddenException([
        { message: 'comment not found', field: 'comment' },
      ]);
    }

    const updateComment = await this.commentsService.updateComment(
      commentId,
      inputModel,
    );

    if (!updateComment) {
      throw new ForbiddenException([
        { message: 'comment not found', field: 'comment' },
      ]);
    }

    return updateComment;
  }
  @Delete(':id')
  deleteComment(@Param('id') commentId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }
    const deletePost = this.commentsService.deleteCommentById(commentId);
    return deletePost;
  }
}
