import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from './repository/posts.query.repository';
import { QueryPostsModel } from './models/input/QueryPostsModule';
import { QueryCommentModule } from '../comments/models/input/QueryCommentModule';
import { CreateCommentModel } from '../comments/models/input/CreateCommentModel';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthQueryRepository } from '../auth/repository/auth.query.repository';
import { UpdateLikesModule } from '../comments/models/input/UpdateLikesModule';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
import { IdParamModel } from './models/input/IdParamModel';
import { validate as uuidValidate } from 'uuid';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentByPostCommand } from './application/use-cases/create.comment.by.post.use.case';
import { UpdateLikeByPostCommand } from './application/use-cases/update.like.by.post.use.case';

@Controller({ path: 'posts', scope: Scope.REQUEST })
export class PostsController {
  private readonly postsQueryRepository;
  private readonly authQueryRepository;
  private commandBus;
  constructor(
    postsQueryRepository: PostsQueryRepository,
    authQueryRepository: AuthQueryRepository,
    commandBus: CommandBus,
  ) {
    this.postsQueryRepository = postsQueryRepository;
    this.authQueryRepository = authQueryRepository;
    this.commandBus = commandBus;
    console.log('CONTROLLER created');
  }

  @UseGuards(AccessRolesGuard)
  @Get()
  async getPosts(@Query() query: QueryPostsModel, @Request() req) {
    const likeStatusData = req.userId;

    const posts = await this.postsQueryRepository.getAllPosts(
      query,
      likeStatusData,
    );
    if (!posts) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return posts;
  }

  @UseGuards(AccessRolesGuard)
  @Get(':id/comments')
  async getCommentByPost(
    @Request() req,
    @Query() query: QueryCommentModule,
    @Param() postId: IdParamModel,
  ) {
    const likeStatusData = req.userId;

    const post = await this.postsQueryRepository.getPostById(
      postId.id,
      likeStatusData,
    );
    if (!post) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    const commentByPost = await this.postsQueryRepository.getCommentByPostId(
      query,
      postId.id,
      likeStatusData,
    );
    if (!commentByPost) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return commentByPost;
  }

  @UseGuards(AccessRolesGuard)
  @Get(':id')
  async getPost(@Param('id') postId: string, @Request() req) {
    const likeStatusData = req.userId;

    if (!uuidValidate(postId)) {
      throw new BadRequestException([{ message: 'id incorrect', field: 'id' }]);
    }
    const post = await this.postsQueryRepository.getPostById(
      postId,
      likeStatusData,
    );
    if (!post) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createCommentByPost(
    @Request() req,
    @Body() inputModel: CreateCommentModel,
    @Param('id') postId: string,
  ) {
    if (!uuidValidate(postId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const post = await this.postsQueryRepository.getPostId(postId);

    if (!post) {
      throw new NotFoundException([
        { message: 'post is not found', field: 'postId' },
      ]);
    }
    const user = await this.authQueryRepository.getUserById(req.user.userId);

    const createData = {
      userId: user!.id,
      content: inputModel.content,
      userLogin: user!.login,
    };

    // const newComment = await this.postsService.createCommentByPost(
    //   createData,
    //   post.id,
    // );
    const newComment = await this.commandBus.execute(
      new CreateCommentByPostCommand(createData, post.id),
    );

    return newComment;
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikes(
    @Request() req,
    @Body() inputModel: UpdateLikesModule,
    @Param('id') postId: string,
  ) {
    const likeStatus = inputModel.likeStatus;

    if (!uuidValidate(postId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const post = await this.postsQueryRepository.getPostId(postId);

    if (!post) {
      throw new NotFoundException([
        { message: 'post not found', field: 'post' },
      ]);
    }

    // const updateLikeStatus = await this.postsService.updateLikeStatus(
    //   postId,
    //   req.user.userId,
    //   likeStatus,
    // );

    const updateLikeStatus = await this.commandBus.execute(
      new UpdateLikeByPostCommand(postId, req.user.userId, likeStatus),
    );

    if (!updateLikeStatus) {
      throw new NotFoundException([
        { message: 'updateLikeStatus not found', field: 'updateLikeStatus' },
      ]);
    }

    return;
  }
}
