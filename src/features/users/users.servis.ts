import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserModel } from './models/input/CreateUserModel';
import {
  UsersRepoViewModel,
  UsersViewModel,
} from './models/output/UsersViewModel';
import * as bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';
import { userDBMapper } from './mappers/mappers';
import { LoginAuthUserModel } from '../auth/models/input/LoginAuthUserModel';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(createData: CreateUserModel): Promise<UsersViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      createData.password,
      passwordSalt,
    );

    const newUser = {
      accountData: {
        login: createData.login,
        email: createData.email,
        createdAt: new Date().toISOString(),
        passwordHash,
        passwordSalt,
      },
    };
    return await this.usersRepository.createUser(newUser);
  }

  async checkCredentials(
    checkCredentialsDto: LoginAuthUserModel,
  ): Promise<UsersRepoViewModel | null> {
    const user = await this.usersQueryRepository.findByLoginOrEmail(
      checkCredentialsDto.loginOrEmail,
    );
    if (!user) {
      return null;
    }

    const passwordHash = await this._generateHash(
      checkCredentialsDto.password,
      user.accountData.passwordHash,
    );

    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    }

    return userDBMapper(user);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id);
  }
}
