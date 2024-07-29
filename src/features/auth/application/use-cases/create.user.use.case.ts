import { EmailAdapter } from '../../adapters/email-adapter';
import { CreateUserModel } from '../../../users/models/input/CreateUserModel';
import { UsersViewModel } from '../../../users/models/output/UsersViewModel';
import { ResultCode } from '../../../users/utils/result-code';
import { ERRORS_MESSAGES } from '../../../../utils/errors';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { EmailAdapterDto } from '../../models/input/EmailAdapterDto';
import { Result } from '../../utils/result.type';
import { AuthService } from '../auth.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { User } from '../../../../db/entitys/user.entity';
import { EmailConfirmation } from '../../../../db/entitys/email.confirmatiom.entity';

export class CreateUserCommand {
  constructor(public createData: CreateUserModel) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected authRepository: AuthRepository,
    protected emailAdapter: EmailAdapter,
    private authService: AuthService,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<Result<UsersViewModel | null>> {
    const foundUser = await this.authRepository.findByLoginOrEmail({
      login: command.createData.login,
      email: command.createData.email,
    });
    if (foundUser) {
      if (foundUser.email === command.createData.email) {
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
    const passwordHash = await this.authService._generateHash(
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

    const emailConfirmation = new EmailConfirmation();

    emailConfirmation.id = uuidv4();
    emailConfirmation.confirmationCode = uuidv4();
    emailConfirmation.expirationDate = add(new Date(), {
      minutes: 15,
    }).toISOString();
    emailConfirmation.isConfirmed = false;
    emailConfirmation.userId = newUser.id;

    const createResult = await this.authRepository.createUser(
      newUser,
      emailConfirmation,
    );

    try {
      const emailAdapterDto: EmailAdapterDto = {
        email: newUser.email,
        confirmationCode: emailConfirmation.confirmationCode,
      };
      await this.emailAdapter.sendCode(emailAdapterDto);
    } catch (error) {
      console.error(error);
      await this.authRepository.deleteUserById(createResult.id);
    }

    return {
      resultCode: ResultCode.Success,
      data: createResult,
    };
  }
}
