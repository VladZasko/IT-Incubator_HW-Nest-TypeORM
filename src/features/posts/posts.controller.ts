import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  getPosts(@Query() query: QueryPostsModel) {
    return this.postsQueryRepository.getAllPosts(query);
  }
  @Get()
  getCommentByPost(
    @Query() query: QueryCommentModule,
    @Param('id') blogId: string,
  ) {
    return this.postsQueryRepository.getCommentByPostId(query, blogId);
  }
  @Get(':id')
  getPost(@Param('id') postId: string) {
    return this.postsQueryRepository.getPostById(postId);
  }
  @Post()
  createPost(@Body() inputModel: CreatePostServiceModel) {
    const newPost = this.postsService.createPost(inputModel);

    return newPost;
  }
  //@Post()
  /*  createCommentByPost(@Body() inputModel: CreateCommentModel) {
    const newPost = this.postsService.createCommentByPost(inputModel);

    return newPost;
  }*/
  @Put(':id')
  updatePost(@Body() inputModel: UpdatePostModel, @Param('id') postId: string) {
    const updatePost = this.postsService.updatePost(postId, inputModel);

    return updatePost;
  }
  @Delete(':id')
  deletePost(@Param('id') postId: string) {
    const deletePost = this.postsService.deletePostById(postId);
    return deletePost;
  }
}
