import { AuthMongoRepository } from '../../auth.mongo.repository';
import { AuthService } from '../auth.service';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {AuthRepository} from "../../auth.repository";

export class NewPasswordCommand {
  constructor(public data: any) {}
}
@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    protected authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<boolean> {
    const user = await this.authRepository.findUserByRecoveryCode(
      command.data.recoveryCode,
    );
    if (!user) return false;
    if (user.recoveryCode !== command.data.recoveryCode)
      return false;
    if (user.expirationDate < new Date()) return false;

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.authService._generateHash(
      command.data.newPassword,
      passwordSalt,
    );

    return await this.authRepository.updatePassword(
      user,
      passwordSalt,
      passwordHash,
    );
  }
}
