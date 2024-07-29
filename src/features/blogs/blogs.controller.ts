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
import { BlogsService } from './application/blogs.servis';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { BlogsQueryRepository } from './repository/blogs.query.repository';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { ObjectId } from 'mongodb';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
import { validate as uuidValidate } from 'uuid';

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

    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const foundBlog = await this.blogsQueryRepository.getPostsByBlogId(
      query,
      blogId,
    );

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
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }
    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('Post not found');
    }
    return blog;
  }
}
