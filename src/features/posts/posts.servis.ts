import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { LikesStatus } from './models/output/PostsViewModel';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreateCommentServiceModel } from '../comments/models/input/CreateCommentModel';
import { v4 as uuidv4 } from 'uuid';
import { Like } from '../../db/entitys/like.entity';
import { Comment } from '../../db/entitys/comments.entity';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}
  // async createPost(
  //   createData: CreatePostServiceModel,
  // ): Promise<PostsViewModel | null> {
  //   const blog = await this.blogsRepository.getBlog(createData.blogId);
  //   if (!blog) return null;
  //
  //   const newPost = {
  //     title: createData.title,
  //     shortDescription: createData.shortDescription,
  //     content: createData.content,
  //     blogId: createData.blogId,
  //     blogName: blog.name,
  //     createdAt: new Date().toISOString(),
  //     likesInfo: {
  //       likes: [],
  //       dislikes: [],
  //     },
  //   };
  //
  //   return await this.postsRepository.createPost(newPost);
  // }
  async createCommentByPost(
    createData: CreateCommentServiceModel,
    postId: string,
  ): Promise<any> {
    const newComment = new Comment();

    newComment.id = uuidv4();
    newComment.content = createData.content;
    newComment.userId = createData.userId;
    newComment.createdAt = new Date().toISOString();
    newComment.postId = postId;

    return await this.postsRepository.createCommentByPost(newComment);
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    newLikeStatus: LikesStatus,
  ): Promise<boolean> {
    // const updateLikesData = {
    //   userId: userId,
    //   postId: postId,
    //   newLikeStatus,
    // };

    const findLikeOrDislike = await this.postsRepository.getLikeOrDislike(
      postId,
      userId,
    );

    if (!findLikeOrDislike) {
      if (newLikeStatus !== LikesStatus.None) {
        const newLike = new Like();

        newLike.id = uuidv4();
        newLike.createdAt = new Date().toISOString();
        newLike.postId = postId;
        newLike.userId = userId;
        newLike.status = newLikeStatus;

        // const createLikesData = {
        //   id: uuidv4(),
        //   createdAt: new Date().toISOString(),
        //   ...updateLikesData,
        // };
        return await this.postsRepository.addLikeOrDislike(newLike);
      } else {
        return true;
      }
    }

    if (findLikeOrDislike.status === newLikeStatus) {
      return true;
    }

    findLikeOrDislike.status = newLikeStatus;

    await this.postsRepository.addLikeOrDislike(findLikeOrDislike);

    return true;
  }
  // async deletePostById(id: string): Promise<boolean> {
  //   return await this.postsRepository.deletePost(id);
  // }
}
