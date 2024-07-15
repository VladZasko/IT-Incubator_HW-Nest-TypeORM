import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { UsersAuthViewModel } from './models/output/UsersViewModel';
import { userAuthMapper } from './mapper/mappers';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
@Injectable()
export class AuthQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async getUserById(id: string): Promise<UsersAuthViewModel | null> {
    const query = `
        SELECT "login", "email", "createdAt", "passwordHash", "passwordSalt", "id"
            FROM public."Users"
            WHERE "id" = $1
        `

    const result = await this.dataSource.query(
        query,[
          id
        ]);

    if(!result[0]) return null

    return userAuthMapper(result[0]);
  }
  async findByLoginOrEmail(loginOrEmail: string) {
      const query = `
            SELECT u.*, ec.*, pc.*
            FROM "Users" as u
            LEFT JOIN "EmailConfirmation" as ec
            ON u."id" = ec."userId"
            LEFT JOIN "PasswordRecovery" as pc
            ON u."id" = pc."userId"
            WHERE "login" like $1 OR "email" like $1;
            `

      const findByLoginOrEmail = await this.dataSource.query(
          query,[
              loginOrEmail,
          ]);

      console.log(findByLoginOrEmail[0])

      return findByLoginOrEmail[0];

  }
}
