import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../auth.repository';
import { EmailConfirmation } from '../../../../db/entitys/email.confirmatiom.entity';
export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const emailConfirmation: EmailConfirmation | null =
      await this.authRepository.findUserByConfirmationCode(command.code);

    if (!emailConfirmation) return false;
    if (emailConfirmation.isConfirmed) return false;
    if (emailConfirmation.confirmationCode !== command.code) return false;
    if (emailConfirmation.expirationDate < new Date().toISOString())
      return false;

    emailConfirmation.isConfirmed = true;

    return this.authRepository.updateConfirmation(emailConfirmation);
  }
}
