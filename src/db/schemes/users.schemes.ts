import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UserDocument = HydratedDocument<UserDBType>;

@Schema()
export class AccountData {
  @Prop({
    required: true,
  })
  login: string;

  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
  })
  passwordHash: string;

  @Prop({
    required: true,
  })
  passwordSalt: string;
}

@Schema()
export class EmailConfirmation {
  @Prop({
    required: true,
  })
  confirmationCode: string;

  @Prop({
    required: true,
  })
  expirationDate: Date;

  @Prop({
    required: true,
  })
  isConfirmed: boolean;
}

@Schema()
export class PasswordRecovery {
  @Prop({
    required: true,
  })
  recoveryCode: string;

  @Prop({
    required: true,
  })
  expirationDate: Date;
}
@Schema()
export class UserDBType {
  _id: ObjectId;

  @Prop({
    required: true,
  })
  accountData: AccountData;

  @Prop({
    required: false,
  })
  emailConfirmation: EmailConfirmation;

  @Prop({
    required: false,
  })
  passwordRecovery: PasswordRecovery;
}

export const UserSchema = SchemaFactory.createForClass(UserDBType);
