import { AuthRepository } from '../../auth.repository';
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
      if (foundUser.accountData.email === command.createData.email) {
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

    const newUser = {
      accountData: {
        login: command.createData.login,
        email: command.createData.email,
        createdAt: new Date().toISOString(),
        passwordHash,
        passwordSalt,
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          minutes: 15,
        }),
        resendingCode: new Date(),
        isConfirmed: false,
      },
    };
    const createResult = await this.authRepository.createUser(newUser);
    try {
      const emailAdapterDto: EmailAdapterDto = {
        email: newUser.accountData.email,
        confirmationCode: newUser.emailConfirmation.confirmationCode,
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
