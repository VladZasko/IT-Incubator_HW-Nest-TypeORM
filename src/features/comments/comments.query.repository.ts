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
export class CommentsQueryRepository {
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
}
