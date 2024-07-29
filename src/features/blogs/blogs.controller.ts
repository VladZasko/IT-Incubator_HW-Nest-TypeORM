import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Request,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { BlogsQueryRepository } from './repository/blogs.query.repository';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
import { validate as uuidValidate } from 'uuid';

@Controller({ path: 'blogs', scope: Scope.REQUEST })
export class BlogsController {
  private readonly blogsService;
  private readonly blogsQueryRepository;
  constructor(blogsQueryRepository: BlogsQueryRepository) {
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
