import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { UsersAuthViewModel } from './models/output/UsersViewModel';
import { userAuthMapper } from './mapper/mappers';
@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectModel(UserDBType.name) private userModel: Model<UserDocument>,
  ) {}
  async getUserById(id: string): Promise<UsersAuthViewModel | null> {
    const user = await this.userModel.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return null;
    }

    return userAuthMapper(user);
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    });
  }
}
