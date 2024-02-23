import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { UsersViewModel } from './models/output/UsersViewModel';
import { userMapper } from './mappers/mappers';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserDBType.name) private userModel: Model<UserDocument>,
  ) {}
  async createUser(createData: any): Promise<UsersViewModel> {
    const user = new this.userModel(createData);
    await user.save();

    return userMapper(user);
    /*    return {
      ...createData,
      id: user.id,
    };*/
  }
  async deleteUserById(id: string): Promise<boolean> {
    const foundUser = await this.userModel.deleteOne({ _id: new ObjectId(id) });

    return !!foundUser.deletedCount;
  }
}
