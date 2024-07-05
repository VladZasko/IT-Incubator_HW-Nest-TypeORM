import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { UsersViewModel } from './models/output/UsersViewModel';
import { userMapper } from './mappers/mappers';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class UsersRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async createUser(createData: any): Promise<UsersViewModel> {
    // const user = new this.userModel(createData);
    // await user.save();
    //
    // return userMapper(user);
    const query = `
            INSERT INTO public."Users"(
            "login", "email", "createdAt", "passwordHash", "passwordSalt", "id")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "login", "email", "createdAt", "id";
            `

    const user = await this.dataSource.query(
        query,[
          createData.accountData.login,
          createData.accountData.email,
          createData.accountData.createdAt,
          createData.accountData.passwordHash,
          createData.accountData.passwordSalt,
          createData.accountData.id,
        ]);

    return userMapper(user[0]);
  }
  async deleteUserById(id: string): Promise<boolean> {
    const query = `
            DELETE FROM public."Users"
            WHERE "id" = $1 RETURNING id;
            `
    const result =await this.dataSource.query(
        query,[
          id,
        ]);

    if(result[1] === 0){
        return false
    }

    return true;
  }
}
