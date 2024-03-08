import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { LikesStatus, PostsViewModel } from './models/output/PostsViewModel';
import { CreatePostServiceModel } from './models/input/CreatePostModel';
import { UpdatePostModel } from './models/input/UpdatePostModule';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreateCommentServiceModel } from '../comments/models/input/CreateCommentModel';
import { CommentViewModel } from '../comments/models/output/CommentViewModel';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}
  async createPost(
    createData: CreatePostServiceModel,
  ): Promise<PostsViewModel | null> {
    const blog = await this.blogsRepository.getBlog(createData.blogId);
    if (!blog) return null;

    const newPost = {
      title: createData.title,
      shortDescription: createData.shortDescription,
      content: createData.content,
      blogId: createData.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likes: [],
        dislikes: [],
      },
    };

    return await this.postsRepository.createPost(newPost);
  }
  async createCommentByPost(
    createData: CreateCommentServiceModel,
    postId: string,
  ): Promise<CommentViewModel> {
    const newComment = {
      content: createData.content,
      commentatorInfo: {
        userId: createData.userId,
        userLogin: createData.userLogin,
      },
      createdAt: new Date().toISOString(),
      likesInfo: {
        likes: [],
        dislikes: [],
      },
      postId: postId,
    };

    return await this.postsRepository.createCommentByPost(newComment);
  }
  async updatePost(id: string, upData: UpdatePostModel): Promise<boolean> {
    return await this.postsRepository.updatePost(id, upData);
  }
  async updateLikeStatus(
    id: string,
    upData: any,
    likeStatus: LikesStatus,
  ): Promise<boolean> {
    const likesData = {
      addedAt: new Date().toISOString(),
      userId: upData.userId,
      login: upData.login,
    };
    return await this.postsRepository.updateLike(id, likesData, likeStatus);
  }
  async deletePostById(id: string): Promise<boolean> {
    return await this.postsRepository.deletePost(id);
  }
}
