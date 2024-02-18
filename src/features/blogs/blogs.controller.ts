import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.servis';
import { QueryBlogsModel } from './models/input/QueryBlogsModules';
import { BlogsQueryRepository } from './blogs.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}
  @Get()
  getBlogs(@Query() query: QueryBlogsModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }
  /*  getPostsByBlog(@Query() query: QueryBlogsModel, @Param('id') blogId: string) {
    return this.blogsQueryRepository.findPostsByBlog(query, blogId);
  }*/
  @Get(':id')
  getBlog(@Param('id') blogId: string) {
    return this.blogsQueryRepository.getBlogById(blogId);
  }
  @Post()
  createBlogs(@Body() inputModel: CreateInputModelType) {
    const newBlog = this.blogsService.createBlog(inputModel);

    return newBlog;
  }
  @Delete(':id')
  deleteBlog(
    @Param('id') blogId: string,
    /*
    @Body() inputModel: CreateInputModelType,
*/
  ) {
    return [{ id: 1 }, { id: 2 }].filter((u) => u.id !== +blogId);
  }
}

type CreateInputModelType = {
  name: string;
  description: string;
  websiteUrl: string;
};
