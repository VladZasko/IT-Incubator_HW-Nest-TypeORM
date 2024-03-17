import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
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
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(AccessRolesGuard)
  @Get(':id')
  async getComment(@Request() req, @Param('id') commentId: string) {
    const likeStatusData = req.userId;

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
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @HttpCode(HttpStatus.NO_CONTENT)
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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Request() req) {
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

    const deletePost = this.commentsService.deleteCommentById(commentId);
    return deletePost;
  }
}
