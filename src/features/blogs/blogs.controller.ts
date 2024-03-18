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
import { BlogsService } from './blogs.servis';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { BlogsQueryRepository } from './blogs.query.repository';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { ObjectId } from 'mongodb';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';

@Controller({ path: 'blogs', scope: Scope.REQUEST })
export class BlogsController {
  private readonly blogsService;
  private readonly blogsQueryRepository;
  constructor(
    blogsService: BlogsService,
    blogsQueryRepository: BlogsQueryRepository,
  ) {
    this.blogsService = blogsService;
    this.blogsQueryRepository = blogsQueryRepository;
    console.log('CONTROLLER created');
  }
  @Get()
  async getBlogs(@Query() query: QueryBlogsModel) {
    const blog = await this.blogsQueryRepository.findBlogs(query);
    if (!blog) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return blog;
  }

  @UseGuards(AccessRolesGuard)
  @Get(':id/posts')
  async getPostsByBlog(
    @Query() query: QueryBlogsModel,
    @Param('id') blogId: string,
    @Request() req,
  ) {
    const likeStatusData = req.userId;

    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!foundBlog) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return await this.blogsQueryRepository.getPostsByBlogId(
      query,
      blogId,
      likeStatusData,
    );
  }
  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }
    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() inputModel: CreateBlogModel) {
    const newBlog = await this.blogsService.createBlog(inputModel);

    return newBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlog(
    @Body() createDTO: CreatePostBlogModel,
    @Param('id') blogId: string,
  ) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const newPostId = await this.blogsService.createPostBlog(blogId, createDTO);

    if (newPostId === null) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return newPostId;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() inputModel: CreateBlogModel,
    @Param('id') blogId: string,
  ) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);

    if (updateBlog === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return updateBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    if (!ObjectId.isValid(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const deleteBlog = await this.blogsService.deleteBlogById(blogId);

    if (deleteBlog === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return deleteBlog;
  }
}
