import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type RefreshTokensMetaDocument =
  HydratedDocument<RefreshTokensMetaDBType>;

@Schema()
export class RefreshTokensMetaDBType {
  _id: ObjectId;

  @Prop({
    required: true,
  })
  issuedAt: string;

  @Prop({
    required: true,
  })
  deviceId: string;

  @Prop({
    required: true,
  })
  ip: string;

  @Prop({
    required: true,
  })
  deviseName: string;

  @Prop({
    required: true,
  })
  userId: string;
}

export const RefreshTokensMetaSchema = SchemaFactory.createForClass(
  RefreshTokensMetaDBType,
);
