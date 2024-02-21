import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

@Schema()
export class commentatorInfo {
  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  userLogin: string;
}
@Schema()
export class LikesInfo {
  @Prop({
    required: true,
    type: [String],
  })
  likes: string[];

  @Prop({
    required: true,
    type: [String],
  })
  dislikes: string[];
}

@Schema()
export class CommentDBType {
  _id: ObjectId;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
    type: Object,
  })
  commentatorInfo: commentatorInfo;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
    type: Object,
  })
  likesInfo: LikesInfo;

  @Prop({
    required: true,
  })
  postId: string;
}

export type CommentDocument = HydratedDocument<CommentDBType>;

export const CommentSchema = SchemaFactory.createForClass(CommentDBType);
