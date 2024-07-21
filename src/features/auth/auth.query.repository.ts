import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import { UsersAuthViewModel } from './models/output/UsersViewModel';
import { userAuthMapper } from './mapper/mappers';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../db/entitys/user.entity';
@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async getUserById(id: string): Promise<UsersAuthViewModel | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .select(['u.login', 'u.id', 'u.email', 'u.createdAt'])
      .where('u.id = :id', { id })
      .getOne();
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    // const query = `
    //         SELECT u.*, ec.*, pc.*
    //         FROM "Users" as u
    //         LEFT JOIN "EmailConfirmation" as ec
    //         ON u."id" = ec."userId"
    //         LEFT JOIN "PasswordRecovery" as pc
    //         ON u."id" = pc."userId"
    //         WHERE "login" like $1 OR "email" like $1;
    //         `;
    //
    // const findByLoginOrEmail = await this.dataSource.query(query, [
    //   loginOrEmail,
    // ]);
    //
    // console.log(findByLoginOrEmail[0]);
    //
    // return findByLoginOrEmail[0];

    //const userRepository = getRepository(User);

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'ec')
      .leftJoinAndSelect('u.passwordRecovery', 'pc')
      .where('u.login LIKE :searchTerm', { searchTerm: `%${loginOrEmail}%` })
      .orWhere('u.email LIKE :searchTerm', { searchTerm: `%${loginOrEmail}%` })
      .getMany();

    return users;
  }
}
