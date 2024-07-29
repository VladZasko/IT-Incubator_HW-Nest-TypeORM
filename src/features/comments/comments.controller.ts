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
  Scope,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './repository/comments.query.repository';
import { UpdateLikesModule } from './models/input/UpdateLikesModule';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
import { validate as uuidValidate } from 'uuid';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateLikeByCommentCommand } from './application/use-cases/update.like.by.comment.use.case';
import { UpdateCommentCommand } from './application/use-cases/update.comment.use.case';
import { DeleteCommentCommand } from './application/use-cases/delete.comment.use.case';

@Controller({ path: 'comments', scope: Scope.REQUEST })
export class CommentsController {
  private readonly commentsQueryRepository;
  constructor(
    commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {
    this.commentsQueryRepository = commentsQueryRepository;
    console.log('CONTROLLER created');
  }

  @UseGuards(AccessRolesGuard)
  @Get(':id')
  async getComment(@Request() req, @Param('id') commentId: string) {
    const likeStatusData = req.userId;

    if (!uuidValidate(commentId)) {
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
    if (!uuidValidate(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment =
      await this.commentsQueryRepository.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }
    const updateLikeStatus = await this.commandBus.execute(
      new UpdateLikeByCommentCommand(
        commentId,
        req.user.userId,
        inputModel.likeStatus,
      ),
    );
    // const updateLikeStatus = await this.commentsService.updateLikeStatus(
    //   commentId,
    //   req.user.userId,
    //   inputModel.likeStatus,
    // );

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
    if (!uuidValidate(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment =
      await this.commentsQueryRepository.getCommentById(commentId);

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

    // const updateComment = await this.commentsService.updateComment(
    //   commentId,
    //   inputModel,
    // );

    const updateComment = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, inputModel),
    );

    if (!updateComment) {
      throw new ForbiddenException([
        { message: 'comment not found', field: 'comment' },
      ]);
    }

    return updateComment;
  }
  //
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Request() req) {
    if (!uuidValidate(commentId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const comment =
      await this.commentsQueryRepository.getCommentById(commentId);

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
    const deleteComment = await this.commandBus.execute(
      new DeleteCommentCommand(commentId),
    );
    //const deletePost = this.commentsService.deleteCommentById(commentId);

    return deleteComment;
  }
}
