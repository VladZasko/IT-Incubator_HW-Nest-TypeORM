import { EmailAdapter } from '../../adapters/email-adapter';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { EmailAdapterDto } from '../../models/input/EmailAdapterDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { User } from '../../../../db/entitys/user.entity';
import { PasswordRecovery } from '../../../../db/entitys/password.recovery.entity';

export class RecoveryPasswordCommand {
  constructor(public email: string) {}
}
@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<boolean> {
    const user: User | null = await this.authRepository.findByEmail(
      command.email,
    );
    if (!user) return true;

    const passwordRecovery = new PasswordRecovery();

    passwordRecovery.id = uuidv4();
    passwordRecovery.recoveryCode = uuidv4();
    passwordRecovery.expirationDate = add(new Date(), {
      minutes: 15,
    }).toISOString();
    passwordRecovery.userId = user.id;

    const result = await this.authRepository.passwordRecovery(passwordRecovery);

    const sendRecoveryCodeDto: EmailAdapterDto = {
      email: user.email,
      recoveryCode: passwordRecovery.recoveryCode,
    };
    try {
      await this.emailAdapter.sendRecoveryCode(sendRecoveryCodeDto);
    } catch (error) {
      console.error(error);
      return false;
    }

    return result;
  }
}
