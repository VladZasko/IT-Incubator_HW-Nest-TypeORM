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
<<<<<<< HEAD
=======
import { BlogsQueryRepository } from './blogs.query.repository';
>>>>>>> origin/main
import { CreateBlogModel } from './models/input/CreateBlogModel';
import { CreatePostBlogModel } from './models/input/CreatePostByBlogModel';
import { ObjectId } from 'mongodb';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { AccessRolesGuard } from '../auth/guards/access.roles.guard';
<<<<<<< HEAD
import { validate as uuidValidate } from 'uuid';
import {BlogsSaQueryRepository} from "./blogs.sa.query.repository";
import {BlogIdModel} from "./models/input/BlogIdModel";
import {UpdatePostByBlogModel} from "./models/input/UpdatePostByBlogModel";
=======
>>>>>>> origin/main

@Controller({ path: 'sa/blogs', scope: Scope.REQUEST })
export class BlogsSAController {
    private readonly blogsService;
<<<<<<< HEAD
    private readonly blogsSaQueryRepository;
    constructor(
        blogsService: BlogsService,
        blogsSaQueryRepository: BlogsSaQueryRepository,
    ) {
        this.blogsService = blogsService;
        this.blogsSaQueryRepository = blogsSaQueryRepository;
        console.log('CONTROLLER created');
    }

    @UseGuards(BasicAuthGuard)
    @Get()
    async getBlogs(@Query() query: QueryBlogsModel) {
        const blog = await this.blogsSaQueryRepository.findBlogs(query);
=======
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
>>>>>>> origin/main
        if (!blog) {
            // Возвращаем HTTP статус 404 и сообщение
            throw new NotFoundException('Post not found');
        }
        return blog;
    }

<<<<<<< HEAD
    @UseGuards(BasicAuthGuard)
    @Get(':blogId/posts')
    async getPostsByBlog(
        @Query() query: QueryBlogsModel,
        @Param('blogId') blogId: string,
=======
    @UseGuards(AccessRolesGuard)
    @Get(':id/posts')
    async getPostsByBlog(
        @Query() query: QueryBlogsModel,
        @Param('id') blogId: string,
>>>>>>> origin/main
        @Request() req,
    ) {
        const likeStatusData = req.userId;

<<<<<<< HEAD
        if (!uuidValidate(blogId)) {
            throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
        }

        const foundBlog = await this.blogsSaQueryRepository.getPostsByBlogId(query, blogId);
=======
        if (!ObjectId.isValid(blogId)) {
            throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
        }

        const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
>>>>>>> origin/main

        if (!foundBlog) {
            // Возвращаем HTTP статус 404 и сообщение
            throw new NotFoundException('Post not found');
        }

<<<<<<< HEAD
        return await this.blogsSaQueryRepository.getPostsByBlogId(
=======
        return await this.blogsQueryRepository.getPostsByBlogId(
>>>>>>> origin/main
            query,
            blogId,
            likeStatusData,
        );
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
<<<<<<< HEAD
        if (!uuidValidate(blogId)) {
=======
        if (!ObjectId.isValid(blogId)) {
>>>>>>> origin/main
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
<<<<<<< HEAD
        if (!uuidValidate(blogId)) {
=======
        if (!ObjectId.isValid(blogId)) {
>>>>>>> origin/main
            throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
        }

        const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);

        if (updateBlog === false) {
<<<<<<< HEAD
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
=======
            // Возвращаем HTTP статус 404 и сообщение
>>>>>>> origin/main
            throw new NotFoundException('Post not found');
        }

        return updateBlog;
    }

<<<<<<< HEAD
=======
    // @UseGuards(BasicAuthGuard)
    // @Put(':id')
    // @HttpCode(HttpStatus.NO_CONTENT)
    // async updateBlog(
    //     @Body() inputModel: CreateBlogModel,
    //     @Param('id') blogId: string,
    // ) {
    //     if (!ObjectId.isValid(blogId)) {
    //         throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    //     }
    //
    //     const updateBlog = await this.blogsService.updateBlog(blogId, inputModel);
    //
    //     if (updateBlog === false) {
    //         // Возвращаем HTTP статус 404 и сообщение
    //         throw new NotFoundException('Post not found');
    //     }
    //
    //     return updateBlog;
    // }

>>>>>>> origin/main
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') blogId: string) {
<<<<<<< HEAD
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
    async deletePostByBlog(@Param() id: BlogIdModel,) {
        // if (!ObjectId.isValid(blogId)) {
        //     throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
        // }

        const deleteBlog = await this.blogsService.deletePostByBlog(id);

        if (deleteBlog === false) {
=======
        if (!ObjectId.isValid(blogId)) {
            throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
        }

        const deleteBlog = await this.blogsService.deleteBlogById(blogId);

        if (deleteBlog === false) {
>>>>>>> origin/main
            // Возвращаем HTTP статус 404 и сообщение
            throw new NotFoundException('Post not found');
        }

        return deleteBlog;
    }
<<<<<<< HEAD
=======

    // @UseGuards(BasicAuthGuard)
    // @Delete(':id')
    // @HttpCode(HttpStatus.NO_CONTENT)
    // async deleteBlog(@Param('id') blogId: string) {
    //     if (!ObjectId.isValid(blogId)) {
    //         throw new NotFoundException([{ message: 'id not found', field: 'id' }]);
    //     }
    //
    //     const deleteBlog = await this.blogsService.deleteBlogById(blogId);
    //
    //     if (deleteBlog === false) {
    //         // Возвращаем HTTP статус 404 и сообщение
    //         throw new NotFoundException('Post not found');
    //     }
    //
    //     return deleteBlog;
    // }
>>>>>>> origin/main
}
