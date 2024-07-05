import { AuthMongoRepository } from '../../auth.mongo.repository';
import { EmailAdapter } from '../../adapters/email-adapter';
import { LoginOrEmailModel } from '../../models/input/LoginAuthUserModel';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { EmailAdapterDto } from '../../models/input/EmailAdapterDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {AuthRepository} from "../../auth.repository";

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
    const user = await this.authRepository.findByEmail(command.email);
    if (!user) return true;

    const passwordRecoveryCode = uuidv4();
    const expirationDate = add(new Date(), {
      minutes: 15,
    });

    const result = await this.authRepository.passwordRecovery(
      user!.id,
      passwordRecoveryCode,
      expirationDate,
    );

    const sendRecoveryCodeDto: EmailAdapterDto = {
      email: user.email,
      recoveryCode: passwordRecoveryCode,
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
