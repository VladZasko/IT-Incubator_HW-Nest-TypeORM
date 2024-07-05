import { AuthMongoRepository } from '../../auth.mongo.repository';
import { LoginAuthUserModel } from '../../models/input/LoginAuthUserModel';
import { UsersRepoViewModel } from '../../../users/models/output/UsersViewModel';
import { userAuthDBMapper } from '../../mapper/mappers';
import { AuthService } from '../auth.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {AuthRepository} from "../../auth.repository";

export class CheckCredentialsCommand {
  constructor(public checkCredentialsDto: LoginAuthUserModel) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async execute(
    command: CheckCredentialsCommand,
  ): Promise<UsersRepoViewModel | null> {
    const user = await this.authRepository.findByLoginOrEmail({
      email: command.checkCredentialsDto.loginOrEmail,
      login: command.checkCredentialsDto.loginOrEmail,
    });
    if (!user) {
      return null;
    }

    const passwordHash = await this.authService._generateHash(
      command.checkCredentialsDto.password,
      user.passwordHash,
    );

    if (user.passwordHash !== passwordHash) {
      return null;
    }

    return userAuthDBMapper(user);
  }
}
