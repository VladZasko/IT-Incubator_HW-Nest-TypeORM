import {Injectable} from '@nestjs/common';
import {PostsRepository} from './posts.repository';
import {LikesStatus} from './models/output/PostsViewModel';
import {BlogsRepository} from '../blogs/blogs.repository';
import {CreateCommentServiceModel} from '../comments/models/input/CreateCommentModel';
import {v4 as uuidv4} from 'uuid';

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
    const newComment = {
      id: uuidv4(),
      content: createData.content,
      userId: createData.userId,
      createdAt: new Date().toISOString(),
      postId: postId,
    };

    return await this.postsRepository.createCommentByPost(newComment);
  }
  // async updatePost(id: string, upData: UpdatePostModel): Promise<boolean> {
  //   return await this.postsRepository.updatePost(id, upData);
  // }
  // async updateLikeStatus(
  //   postId: string,
  //   userId: string,
  //   newLikeStatus: LikesStatus,
  // ): Promise<boolean> {
  //   const likesData = {
  //     id: uuidv4(),
  //     addedAt: new Date().toISOString(),
  //     userId: userId,
  //     postId: postId,
  //   };
  //
  //   const findLike = await this.postsRepository.getLike(postId, userId)
  //   const findDislike = await this.postsRepository.getDislike(postId, userId)
  //
  //   let likeStatus = 'None';
  //   if(findLike){
  //     likeStatus = 'Like'
  //   } else if (findDislike){
  //     likeStatus = 'Dislike'
  //   }
  //
  //   if(newLikeStatus === LikesStatus.Like){
  //     switch (likeStatus) {
  //       case 'Like':
  //         //await this.postsRepository.deleteLike(userId, postId);
  //         break;
  //       case 'Dislike':
  //         await this.postsRepository.deleteDislike(userId, postId);
  //         await this.postsRepository.addLike(likesData);
  //         break;
  //       case 'None':
  //         await this.postsRepository.addLike(likesData);
  //         break;
  //     }
  //   }
  //
  //   if(newLikeStatus === LikesStatus.Dislike){
  //     switch (likeStatus) {
  //       case 'Dislike':
  //         break;
  //       case 'Like':
  //         await this.postsRepository.deleteLike(userId, postId);
  //         await this.postsRepository.addDislike(likesData);
  //         break;
  //       case 'None':
  //         await this.postsRepository.addDislike(likesData);
  //         break;
  //     }
  //   }
  //
  //   if(newLikeStatus === LikesStatus.None){
  //     switch (likeStatus) {
  //       case 'Dislike':
  //         await this.postsRepository.deleteDislike(userId, postId);
  //         break;
  //       case 'Like':
  //         await this.postsRepository.deleteLike(userId, postId);
  //         break;
  //     }
  //   }
  //
  //   return true
  // }

  async updateLikeStatus(
      postId: string,
      userId: string,
      newLikeStatus: LikesStatus,
  ): Promise<boolean> {

    const updateLikesData = {
      userId: userId,
      postId: postId,
      newLikeStatus
    };

    const findLikeOrDislike = await this.postsRepository.getLikeOrDislike(postId, userId)

    if(!findLikeOrDislike){
      if (newLikeStatus !== LikesStatus.None){
        const createLikesData = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          ...updateLikesData,
        };
        return await this.postsRepository.addLikeOrDislike(createLikesData);
      } else {
        return true
      }
    }

    if (findLikeOrDislike.status === newLikeStatus) {
      return true;
    }

    await this.postsRepository.updateLikeOrDislike(updateLikesData);

    return true;
  }
  // async deletePostById(id: string): Promise<boolean> {
  //   return await this.postsRepository.deletePost(id);
  // }
}
