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
} from '@nestjs/common';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.servis';
import { QueryPostsModel } from './models/input/QueryPostsModule';
import { CreatePostServiceModel } from './models/input/CreatePostModel';
import { UpdatePostModel } from './models/input/UpdatePostModule';
import { QueryCommentModule } from '../comments/models/input/QueryCommentModule';
import { BlogsRepository } from '../blogs/blogs.repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}
  @Get()
  async getPosts(@Query() query: QueryPostsModel) {
    const posts = await this.postsQueryRepository.getAllPosts(query);
    if (!posts) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return posts;
  }
  @Get()
  async getCommentByPost(
    @Query() query: QueryCommentModule,
    @Param('id') blogId: string,
  ) {
    const commentByPost = await this.postsQueryRepository.getCommentByPostId(
      query,
      blogId,
    );
    if (!commentByPost) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return commentByPost;
  }
  @Get(':id')
  async getPost(@Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPostById(postId);
    if (!post) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return post;
  }
  @Post()
  async createPost(@Body() inputModel: CreatePostServiceModel) {
    const newPost = await this.postsService.createPost(inputModel);
    const blog = await this.blogsRepository.getBlog(inputModel.blogId);
    if (!blog) {
      throw new BadRequestException([
        { message: 'Blog is not found', field: 'blogId' },
      ]);
    }

    if (newPost === null) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return newPost;
  }
  //@Post()
  /*  createCommentByPost(@Body() inputModel: CreateCommentModel) {
    const newPost = this.postsService.createCommentByPost(inputModel);

    return newPost;
  }*/
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputModel: UpdatePostModel,
    @Param('id') postId: string,
  ) {
    const updatePost = await this.postsService.updatePost(postId, inputModel);
    if (updatePost === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return updatePost;
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const deletePost = await this.postsService.deletePostById(postId);
    if (deletePost === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return deletePost;
  }
}
