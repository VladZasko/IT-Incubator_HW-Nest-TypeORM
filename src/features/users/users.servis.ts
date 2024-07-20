import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserModel } from './models/input/CreateUserModel';
import { UsersViewModel } from './models/output/UsersViewModel';
import * as bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';
import { ResultCode } from './utils/result-code';
import { ERRORS_MESSAGES } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../db/entitys/user.entity';

export type Result<T> = {
  resultCode: ResultCode;
  errorMessage?: {
    message: string;
    field: string;
  };
  data: T;
};
@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    createData: CreateUserModel,
  ): Promise<Result<UsersViewModel | null>> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail({
      login: createData.login,
      email: createData.email,
    });
    if (foundUser) {
      if (foundUser.email === createData.email) {
        return {
          resultCode: ResultCode.invalidEmail,
          errorMessage: ERRORS_MESSAGES.USER_EMAIL,
          data: null,
        };
      } else {
        return {
          resultCode: ResultCode.invalidLogin,
          errorMessage: ERRORS_MESSAGES.USER_LOGIN,
          data: null,
        };
      }
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      createData.password,
      passwordSalt,
    );

    const newUser = new User();

    newUser.id = uuidv4();
    newUser.login = createData.login;
    newUser.email = createData.email;
    newUser.createdAt = new Date().toISOString();
    newUser.passwordHash = passwordHash;
    newUser.passwordSalt = passwordSalt;

    const createResult = await this.usersRepository.createUser(newUser);

    return {
      resultCode: ResultCode.Success,
      data: createResult,
    };
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id);
  }
}
