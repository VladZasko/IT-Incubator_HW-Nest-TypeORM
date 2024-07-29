import { CreateUserModel } from '../../models/input/CreateUserModel';
import { UsersViewModel } from '../../models/output/UsersViewModel';
import { ERRORS_MESSAGES } from '../../../../utils/errors';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../../db/entitys/user.entity';
import { UsersRepository } from '../../repository/users.repository';
import { UsersQueryRepository } from '../../repository/users.query.repository';
import { BadRequestException, Injectable, Scope } from '@nestjs/common';

export class CreateUserSaCommand {
  constructor(public createData: CreateUserModel) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(CreateUserSaCommand)
export class CreateUserSaUseCase
  implements ICommandHandler<CreateUserSaCommand>
{
  private readonly usersRepository: UsersRepository;
  private readonly usersQueryRepository: UsersQueryRepository;
  constructor(
    usersRepository: UsersRepository,
    usersQueryRepository: UsersQueryRepository,
  ) {
    this.usersRepository = usersRepository;
    this.usersQueryRepository = usersQueryRepository;
    console.log('CREATE USER SA USE CASE created');
  }
  async execute(command: CreateUserSaCommand): Promise<UsersViewModel | null> {
    const foundUser = await this.usersQueryRepository.findByLoginOrEmail({
      login: command.createData.login,
      email: command.createData.email,
    });
    if (foundUser) {
      if (foundUser.email === command.createData.email) {
        throw new BadRequestException(ERRORS_MESSAGES.USER_EMAIL);
      } else {
        throw new BadRequestException(ERRORS_MESSAGES.USER_LOGIN);
      }
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      command.createData.password,
      passwordSalt,
    );

    const newUser = new User();

    newUser.id = uuidv4();
    newUser.login = command.createData.login;
    newUser.email = command.createData.email;
    newUser.createdAt = new Date().toISOString();
    newUser.passwordHash = passwordHash;
    newUser.passwordSalt = passwordSalt;

    return this.usersRepository.createUser(newUser);
  }

  private async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
