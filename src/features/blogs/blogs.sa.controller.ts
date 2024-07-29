import {
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
  Scope,
  UseGuards,
} from '@nestjs/common';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { validate as uuidValidate } from 'uuid';
import { BlogsSaQueryRepository } from './repository/blogs.sa.query.repository';
import { BlogIdModel } from './models/input/BlogIdModel';
import { UpdatePostByBlogModel } from './models/input/UpdatePostByBlogModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './application/use-cases/create.blog.use.case';
import { CreatePostByBlogCommand } from './application/use-cases/create.post.by.blog.use.case';
import { UpdateBlogCommand } from './application/use-cases/update.blog.use.case';
import { UpdatePostByBlogCommand } from './application/use-cases/update.post.by.blog.use.case';
import { DeleteBlogCommand } from './application/use-cases/delete.blog.use.case';
import { DeletePostByBlogCommand } from './application/use-cases/delete.post.by.blog.use.case';

@Controller({ path: 'sa/blogs', scope: Scope.REQUEST })
export class BlogsSAController {
  private readonly blogsService;
  private readonly blogsSaQueryRepository;
  constructor(
    blogsSaQueryRepository: BlogsSaQueryRepository,
    private commandBus: CommandBus,
  ) {
    this.blogsSaQueryRepository = blogsSaQueryRepository;
    console.log('CONTROLLER created');
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getBlogs(@Query() query: QueryBlogsModel) {
    const blog = await this.blogsSaQueryRepository.findBlogs(query);
    if (!blog) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Get(':blogId/posts')
  async getPostsByBlog(
    @Query() query: QueryBlogsModel,
    @Param('blogId') blogId: string,
    @Request() req,
  ) {
    const likeStatusData = req.userId;

    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const foundBlog = await this.blogsSaQueryRepository.getPostsByBlogId(
      query,
      blogId,
    );

    if (!foundBlog) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return await this.blogsSaQueryRepository.getPostsByBlogId(
      query,
      blogId,
      likeStatusData,
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() inputModel: CreateBlogModel) {
    return this.commandBus.execute(new CreateBlogCommand(inputModel));
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlog(
    @Body() createDTO: CreatePostBlogModel,
    @Param('id') blogId: string,
  ) {
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const newPost = await this.commandBus.execute(
      new CreatePostByBlogCommand(blogId, createDTO),
    );
    //const newPostId = await this.blogsService.createPostBlog(blogId, createDTO);

    if (newPost === null) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return newPost;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() inputModel: CreateBlogModel,
    @Param('id') blogId: string,
  ) {
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    //const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);
    const updateBlog = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, inputModel),
    );
    if (updateBlog === false) {
      throw new NotFoundException('Blog not found');
    }

    return updateBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @Body() inputModel: UpdatePostByBlogModel,
    @Param() id: BlogIdModel,
  ) {
    // if (!ObjectId.isValid(blogId)) {
    //     throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    // }

    //const updateBlog = await this.blogsService.updatePostByBlog(id, inputModel);
    const updatePost = await this.commandBus.execute(
      new UpdatePostByBlogCommand(id, inputModel),
    );
    if (updatePost === false) {
      throw new NotFoundException('Post not found');
    }

    return updatePost;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }
    //const deleteBlog = await this.blogsService.deleteBlogById(blogId);
    const deleteBlog = await this.commandBus.execute(
      new DeleteBlogCommand(blogId),
    );
    if (deleteBlog === false) {
      throw new NotFoundException('Post not found');
    }

    return deleteBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog(@Param() id: BlogIdModel) {
    // if (!ObjectId.isValid(blogId)) {
    //     throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    // }

    //const deleteBlog = await this.blogsService.deletePostByBlog(id);
    const deletePost = await this.commandBus.execute(
      new DeletePostByBlogCommand(id),
    );
    if (deletePost === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return deletePost;
  }
}
