import { AuthRepository } from '../../auth.repository';
import { AuthService } from '../auth.service';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    if (user.passwordRecovery!.recoveryCode !== command.data.recoveryCode)
      return false;
    if (user.passwordRecovery!.expirationDate < new Date()) return false;

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
