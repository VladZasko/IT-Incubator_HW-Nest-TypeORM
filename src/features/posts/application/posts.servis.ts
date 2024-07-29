import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../repository/posts.repository';
import { LikesStatus } from '../models/output/PostsViewModel';
import { CreateCommentServiceModel } from '../../comments/models/input/CreateCommentModel';
import { v4 as uuidv4 } from 'uuid';
import { Like } from '../../../db/entitys/like.entity';
import { Comment } from '../../../db/entitys/comments.entity';

@Injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}
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
}
