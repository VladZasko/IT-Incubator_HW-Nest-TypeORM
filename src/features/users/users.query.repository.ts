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
import {LoginOrEmailModel} from "../auth/models/input/LoginAuthUserModel";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
@Injectable()
export class UsersQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async getAllUsers(
    sortData: QueryUserModel,
  ): Promise<UsersViewModelGetAllUsers> {
    const searchLoginTerm = sortData.searchLoginTerm ?? '';
    const searchEmailTerm = sortData.searchEmailTerm ?? '';
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection ?? 'DESC';
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;

    let filter = `WHERE "login" LIKE '%%' AND "email" LIKE '%%'`;

    if (searchLoginTerm) {
      filter = `WHERE LOWER("login") LIKE '%${searchLoginTerm.toLowerCase()}%'`;
    }
    if (searchEmailTerm) {
      filter = `WHERE LOWER("email") LIKE '%${searchEmailTerm.toLowerCase()}%'`;
    }
    if (searchLoginTerm && searchEmailTerm) {
      filter = `WHERE LOWER("login") LIKE '%${searchLoginTerm.toLowerCase()}%' OR LOWER("email") LIKE '%${searchEmailTerm.toLowerCase()}%'`;
    }

    const query = `
            SELECT "login", "email", "createdAt", "passwordHash", "passwordSalt", "id"
            FROM public."Users"
            ${filter}
            ORDER BY "${sortBy}"  ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${(pageNumber - 1) * +pageSize}
            `

    const result = await this.dataSource.query(
        query);


    // const users = await this.userModel
    //   .find(filter)
    //   .sort([[`accountData.` + sortBy, sortDirection]])
    //   .skip((pageNumber - 1) * +pageSize)
    //   .limit(+pageSize)
    //   .lean();

    const totalCount: number = await this.dataSource.query(
        `
            SELECT COUNT(*) FROM "Users"
            ${filter}
            `);

    const pagesCount: number = Math.ceil(+totalCount[0].count / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: result.map(userMapper),
    };
  }
  // async getUserById(id: string): Promise<UsersViewModel | null> {
  //   const user = await this.userModel.findOne({ _id: new ObjectId(id) });
  //
  //   if (!user) {
  //     return null;
  //   }
  //
  //   return userMapper(user);
  // }
  // async findByLoginOrEmail(loginOrEmail: string) {
  //   return this.userModel.findOne({
  //     $or: [
  //       { 'accountData.email': loginOrEmail },
  //       { 'accountData.login': loginOrEmail },
  //     ],
  //   });
  // }

  async findByLoginOrEmail(createData: any) {
    const query = `
            SELECT *
            FROM "Users" as u
            WHERE "login" like $1 OR "email" like $2;
            `

    const findByLoginOrEmail = await this.dataSource.query(
        query,[
          createData.login,
          createData.email,
        ]);

    console.log(findByLoginOrEmail[0])

    return findByLoginOrEmail[0];

  }
}
