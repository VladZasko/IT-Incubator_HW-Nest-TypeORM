import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { QueryUserModel } from './models/input/QueryUserModule';
import {
  UsersViewModel,
  UsersViewModelGetAllUsers,
} from './models/output/UsersViewModel';
import { userMapper } from './mappers/mappers';
@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserDBType.name) private userModel: Model<UserDocument>,
  ) {}
  async getAllUsers(
    sortData: QueryUserModel,
  ): Promise<UsersViewModelGetAllUsers> {
    const searchLoginTerm = sortData.searchLoginTerm ?? null;
    const searchEmailTerm = sortData.searchEmailTerm ?? null;
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'desc';
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;

    let filter = {};

    if (searchLoginTerm) {
      filter = {
        'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
      };
    }
    if (searchEmailTerm) {
      filter = {
        'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
      };
    }
    if (searchLoginTerm && searchEmailTerm) {
      filter = {
        $or: [
          { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
          { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
        ],
      };
    }

    const users = await this.userModel
      .find(filter)
      .sort([[`accountData.` + sortBy, sortDirection]])
      .skip((pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount: number = await this.userModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: users.map(userMapper),
    };
  }
  async getUserById(id: string): Promise<UsersViewModel | null> {
    const user = await this.userModel.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return null;
    }

    return userMapper(user);
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
