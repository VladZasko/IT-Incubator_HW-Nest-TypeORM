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
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { validate as uuidValidate } from 'uuid';
import { BlogsSaQueryRepository } from './repository/blogs.sa.query.repository';
import { BlogIdModel } from './models/input/BlogIdModel';
import { UpdatePostByBlogModel } from './models/input/UpdatePostByBlogModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './application/use-cases/create.blog.use.case';

@Controller({ path: 'sa/blogs', scope: Scope.REQUEST })
export class BlogsSAController {
  private readonly blogsService;
  private readonly blogsSaQueryRepository;
  constructor(
    blogsService: BlogsService,
    blogsSaQueryRepository: BlogsSaQueryRepository,
    private commandBus: CommandBus,
  ) {
    this.blogsService = blogsService;
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
    //const newBlog = await this.blogsService.createBlog(inputModel);

    return this.commandBus.execute(new CreateBlogCommand(inputModel));

    //return newBlog;
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
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }

    const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);

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

    const updateBlog = await this.blogsService.updatePostByBlog(id, inputModel);

    if (updateBlog === false) {
      throw new NotFoundException('Post not found');
    }

    return updateBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    if (!uuidValidate(blogId)) {
      throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    }
    const deleteBlog = await this.blogsService.deleteBlogById(blogId);

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

    const deleteBlog = await this.blogsService.deletePostByBlog(id);

    if (deleteBlog === false) {
      // Возвращаем HTTP статус 404 и сообщение
      throw new NotFoundException('Post not found');
    }

    return deleteBlog;
  }
}
