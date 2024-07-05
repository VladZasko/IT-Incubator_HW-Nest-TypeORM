import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.servis';
import { QueryPostsModel } from './models/input/QueryPostsModule';
import { CreatePostServiceModel } from './models/input/CreatePostModel';
import { UpdatePostModel } from './models/input/UpdatePostModule';
import { QueryCommentModule } from '../comments/models/input/QueryCommentModule';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreateCommentModel } from '../comments/models/input/CreateCommentModel';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthQueryRepository } from '../auth/auth.query.repository';
import { UpdateLikesModule } from '../comments/models/input/UpdateLikesModule';
import { ObjectId } from 'mongodb';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import {IdParamModel} from "./models/input/IdParamModel";

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected authQueryRepository: AuthQueryRepository,
  ) {}

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
  async getPost(@Param() postId: IdParamModel, @Request() req) {
    const likeStatusData = req.userId;

    const post = await this.postsQueryRepository.getPostById(
      postId.id,
      likeStatusData,
    );
    if (!post) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() inputModel: CreatePostServiceModel) {
    const blog = await this.blogsRepository.getBlog(inputModel.blogId);
    if (!blog) {
      throw new BadRequestException([
        { message: 'Blog is not found', field: 'blogId' },
      ]);
    }
    const newPost = await this.postsService.createPost(inputModel);

    if (newPost === null) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return newPost;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createCommentByPost(
    @Request() req,
    @Body() inputModel: CreateCommentModel,
    @Param() postId: IdParamModel,
  ) {
    const post = await this.postsQueryRepository.getPostById(postId.id);

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

    const newComment = await this.postsService.createCommentByPost(
      createData,
      post.id,
    );

    return newComment;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(
    @Body() inputModel: UpdatePostModel,
    @Param() postId: IdParamModel,
  ) {
    const updatePost = await this.postsService.updatePost(postId.id, inputModel);
    if (updatePost === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return updatePost;
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

    const user = await this.authQueryRepository.getUserById(req.user.userId);

    const upData = {
      userId: user!.id,
      login: user!.login,
    };

    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException([
        { message: 'post not found', field: 'post' },
      ]);
    }

    const updateLikeStatus = await this.postsService.updateLikeStatus(
      postId,
      upData,
      likeStatus,
    );

    if (!updateLikeStatus) {
      throw new NotFoundException([
        { message: 'updateLikeStatus not found', field: 'updateLikeStatus' },
      ]);
    }

    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() postId: IdParamModel) {
    const deletePost = await this.postsService.deletePostById(postId.id);
    if (deletePost === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return deletePost;
  }
}
