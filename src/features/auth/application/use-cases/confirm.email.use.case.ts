import { AuthRepository } from '../../auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.authRepository.findUserByConfirmationCode(
      command.code,
    );
    if (!user) return false;
    if (user.emailConfirmation!.isConfirmed) return false;
    if (user.emailConfirmation!.confirmationCode !== command.code) return false;
    if (user.emailConfirmation!.expirationDate < new Date()) return false;

    return await this.authRepository.updateConfirmation(user._id);
  }
}
