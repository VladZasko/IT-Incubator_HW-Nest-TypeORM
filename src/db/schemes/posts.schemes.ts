import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

/*@Schema()
export class Like {
  _id: false;
  @Prop()
  addedAt: string;

  @Prop()
  userId: string;

  @Prop()
  login: string;
}*/

export type Like = {
  addedAt: string;
  userId: string;
  login: string;
};
@Schema()
export class LikesInfo {
  @Prop({
    required: true,
    type: [],
    default: () => [],
  })
  likes: Like[];

  @Prop({
    required: true,
    type: [],
    default: () => [],
  })
  dislikes: Like[];
}
@Schema()
export class PostDBType {
  _id: ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  shortDescription: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  blogId: string;

  @Prop({
    required: true,
  })
  blogName: string;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
    type: Object,
  })
  likesInfo: LikesInfo;
}

export type PostDocument = HydratedDocument<PostDBType>;

export const PostSchema = SchemaFactory.createForClass(PostDBType);
