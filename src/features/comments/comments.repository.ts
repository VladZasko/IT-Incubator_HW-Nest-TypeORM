import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentMapper } from './mappers/mappers';
import { UpdateFeedbackModuleModel } from './models/input/UpdateFeedbackModule';
import { LikesStatus } from '../posts/models/output/PostsViewModel';
@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentDBType.name)
    private commentModel: Model<CommentDocument>,
  ) {}

  async getCommentById(id: string): Promise<any | null> {
    const comment = await this.commentModel.findById({ _id: new ObjectId(id) });

    if (!comment) {
      return null;
    }
    return commentMapper(comment);
  }
  async updateComment(
    id: string,
    upData: UpdateFeedbackModuleModel,
  ): Promise<boolean> {
    const foundComment = await this.commentModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: upData.content,
        },
      },
    );
    return !!foundComment.matchedCount;
  }
  async updateLike(id: string, upData: any): Promise<boolean> {
    const comment = await this.commentModel.findById({ _id: new ObjectId(id) });

    const isLiked = comment!.likesInfo.likes.includes(upData.userId);
    const isDisliked = comment!.likesInfo.dislikes.includes(upData.userId);

    switch (upData.likeStatus) {
      case LikesStatus.Like:
        if (isLiked) {
          return true;
        } else {
          await this.commentModel.updateOne(
            { _id: new ObjectId(id) },
            {
              $push: {
                'likesInfo.likes': upData.userId,
              },
            },
          );
          if (isDisliked) {
            await this.commentModel.updateOne(
              { _id: new ObjectId(id) },
              {
                $pull: {
                  'likesInfo.dislikes': upData.userId,
                },
              },
            );
          }
        }
        break;

      case LikesStatus.Dislike:
        if (isDisliked) {
          return true;
        } else {
          await this.commentModel.updateOne(
            { _id: new ObjectId(id) },
            {
              $push: {
                'likesInfo.dislikes': upData.userId,
              },
            },
          );
          if (isLiked) {
            await this.commentModel.updateOne(
              { _id: new ObjectId(id) },
              {
                $pull: {
                  'likesInfo.likes': upData.userId,
                },
              },
            );
          }
        }
        break;

      case LikesStatus.None:
        if (isDisliked) {
          await this.commentModel.updateOne(
            { _id: new ObjectId(id) },
            {
              $pull: {
                'likesInfo.dislikes': upData.userId,
              },
            },
          );
        } else if (isLiked) {
          await this.commentModel.updateOne(
            { _id: new ObjectId(id) },
            {
              $pull: {
                'likesInfo.likes': upData.userId,
              },
            },
          );
        } else {
          return true;
        }
        break;

      default:
        return false;
    }

    return true;
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const foundComment = await this.commentModel.deleteOne({
      _id: new ObjectId(id),
    });

    return !!foundComment.deletedCount;
  }
}
