import { Injectable } from '@nestjs/common';
import { QueryUserModel } from '../models/input/QueryUserModule';
import { UsersViewModelGetAllUsers } from '../models/output/UsersViewModel';
import { userMapper } from '../mappers/mappers';
import { LoginOrEmailModel } from '../../auth/models/input/LoginAuthUserModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../db/entitys/user.entity';
@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async getAllUsers(
    sortData: QueryUserModel,
  ): Promise<UsersViewModelGetAllUsers> {
    const searchLoginTerm = sortData.searchLoginTerm ?? '';
    const searchEmailTerm = sortData.searchEmailTerm ?? '';
    const sortBy = sortData.sortBy ?? 'createdAt';
    const sortDirection = sortData.sortDirection;
    const pageNumber = sortData.pageNumber ?? 1;
    const pageSize = sortData.pageSize ?? 10;

    const queryBuilder = this.usersRepository.createQueryBuilder('u');

    if (searchLoginTerm && searchEmailTerm) {
      queryBuilder.where(
        'LOWER(u.login) LIKE :loginTerm OR LOWER(u.email) LIKE :emailTerm',
        {
          loginTerm: `%${searchLoginTerm.toLowerCase()}%`,
          emailTerm: `%${searchEmailTerm.toLowerCase()}%`,
        },
      );
    } else if (searchLoginTerm) {
      queryBuilder.where('LOWER(u.login) LIKE :loginTerm', {
        loginTerm: `%${searchLoginTerm.toLowerCase()}%`,
      });
    } else if (searchEmailTerm) {
      queryBuilder.where('LOWER(u.email) LIKE :emailTerm', {
        emailTerm: `%${searchEmailTerm.toLowerCase()}%`,
      });
    }

    const users = await queryBuilder
      .orderBy(`u.${sortBy}`, sortDirection)
      .offset((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    const totalCount: number = await queryBuilder.getCount();

    const pagesCount: number = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: users.map((u) => userMapper(u)),
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

  async findByLoginOrEmail(
    loginOrEmailDto: LoginOrEmailModel,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [
        { email: loginOrEmailDto.email },
        { login: loginOrEmailDto.login },
      ],
    });
  }
  // async findByLoginOrEmail(createData: any) {
  //   const query = `
  //           SELECT *
  //           FROM "Users" as u
  //           WHERE "login" like $1 OR "email" like $2;
  //           `;
  //
  //   const findByLoginOrEmail = await this.dataSource.query(query, [
  //     createData.login,
  //     createData.email,
  //   ]);
  //
  //   console.log(findByLoginOrEmail[0]);
  //
  //   return findByLoginOrEmail[0];
  // }
}
