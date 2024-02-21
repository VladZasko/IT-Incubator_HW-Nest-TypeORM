import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  CommentDBType,
  CommentDocument,
} from '../../db/schemes/comments.schemes';
import { commentMapper } from './mappers/mappers';
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
  /*  async updateComment(
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
  }*/
  /*  async updateLike(id: string, upData: any): Promise<boolean> {
    const comment = await FeedbacksModel.findById({_id: new ObjectId(id)})

    const isLiked = comment!.likesInfo.likes.includes(upData.userId);
    const isDisliked = comment!.likesInfo.dislikes.includes(upData.userId);

    if (upData.likeStatus === LikesStatus.Like) {
      if (isLiked) {
        return true
      } else {
        comment!.likesInfo.likes.push(upData.userId);

        if (isDisliked) {
          comment!.likesInfo.dislikes = comment!.likesInfo.dislikes.filter((id: string) => id !== upData.userId);
        }
      }
    } else if (upData.likeStatus === LikesStatus.Dislike) {
      if (isDisliked) {
        return true
      } else {
        comment!.likesInfo.dislikes.push(upData.userId);

        if (isLiked) {
          comment!.likesInfo.likes = comment!.likesInfo.likes.filter((id: string) => id !== upData.userId);
        }
      }
    } else if (upData.likeStatus === LikesStatus.None) {
      if (isDisliked) {
        comment!.likesInfo.dislikes = comment!.likesInfo.dislikes.filter((id: string) => id !== upData.userId);
      } else if (isLiked) {
        comment!.likesInfo.likes = comment!.likesInfo.likes.filter((id: string) => id !== upData.userId);
      } else {
        return true
      }
    } else{
      return false
    }

    await comment!.save();

    return true;
  }*/
  /*  async deleteCommentById(id: string): Promise<boolean> {
    const foundComment = await this.commentModel.deleteOne({
      _id: new ObjectId(id),
    });

    return !!foundComment.deletedCount;
  }*/
}
