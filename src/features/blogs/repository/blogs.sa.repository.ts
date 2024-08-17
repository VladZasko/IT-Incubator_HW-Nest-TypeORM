import { Injectable, Scope } from '@nestjs/common';
import { UpdateBlogModel } from '../models/input/UpdateBlogModule';
import {
  LikesStatus,
  PostsViewModel,
} from '../../posts/models/output/PostsViewModel';
import { BlogsViewModel } from '../models/output/BlogsViewModel';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogIdModel } from '../models/input/BlogIdModel';
import { Blog } from '../../../db/entitys/blog.entity';
import { Post } from '../../../db/entitys/post.entity';

@Injectable({ scope: Scope.DEFAULT })
export class BlogsSaRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async createPostBlog(createData: Post): Promise<PostsViewModel> {
    await this.postRepository.save(createData);

    const post = await this.postRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('p.id = :postId', { postId: createData.id })
      .getOne();

    return {
      id: post!.id,
      title: post!.title,
      shortDescription: post!.shortDescription,
      content: post!.content,
      blogId: post!.blogId,
      blogName: post!.blog.name,
      createdAt: post!.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikesStatus.None,
        newestLikes: [],
      },
    };
  }
  async getPostByBlog(id: BlogIdModel): Promise<Post | null> {
    const a = await this.postRepository.findOne({
      where: [{ id: id.postId, blogId: id.blogId }],
    });
    console.log(a);
    return a;
  }

  async getBlog(id: string): Promise<Blog | null> {
    return this.blogRepository.findOneBy({
      id: id,
    });
  }

  async createBlog(createBlogDto: Blog): Promise<BlogsViewModel> {
    const createBlog = await this.blogRepository.save(createBlogDto);

    return createBlog;
  }
  async updateBlog(updateBlogDto: UpdateBlogModel): Promise<boolean> {
    const updateBlog = await this.blogRepository.save(updateBlogDto);

    return !!updateBlog;
  }

  async updatePostByBlog(updateBlogDto: Post): Promise<boolean> {
    const updateBlog = await this.postRepository.save(updateBlogDto);

    return !!updateBlog;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const deleteBlog = await this.blogRepository.delete({
      id: id,
    });

    return !!deleteBlog.affected;
  }

  async deleteBlogByPost(id: BlogIdModel): Promise<boolean> {
    const deleteBlog = await this.postRepository.delete({
      id: id.postId,
      blogId: id.blogId,
    });

    return !!deleteBlog.affected;
  }
}
