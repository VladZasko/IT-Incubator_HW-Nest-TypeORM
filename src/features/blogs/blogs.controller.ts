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
import { BlogsService } from './blogs.servis';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { BlogsQueryRepository } from './blogs.query.repository';
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}
  @Get()
  async getBlogs(@Query() query: QueryBlogsModel) {
    return await this.blogsQueryRepository.findBlogs(query);
  }
  @Get(':id/posts')
  async getPostsByBlog(
    @Query() query: QueryBlogsModel,
    @Param('id') blogId: string,
  ) {
    return await this.blogsQueryRepository.getPostsByBlogId(query, blogId);
  }
  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return await this.blogsQueryRepository.getBlogById(blogId);
  }
  @Post()
  async createBlog(@Body() inputModel: CreateBlogModel) {
    const newBlog = await this.blogsService.createBlog(inputModel);

    return newBlog;
  }
  @Post(':id/posts')
  async createPostByBlog(
    @Body() createDTO: CreatePostBlogModel,
    @Param('id') blogId: string,
  ) {
    const newPostId = await this.blogsService.createPostBlog(blogId, createDTO);
    return newPostId;
  }
  @Put(':id')
  async updateBlog(
    @Body() inputModel: CreateBlogModel,
    @Param('id') blogId: string,
  ) {
    const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);

    return updateBlog;
  }
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    const deleteBlog = await this.blogsService.deleteBlogById(blogId);
    return deleteBlog;
  }
}
