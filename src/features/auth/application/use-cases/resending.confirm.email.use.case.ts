import { AuthMongoRepository } from '../../auth.mongo.repository';
import { EmailAdapter } from '../../adapters/email-adapter';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { EmailAdapterDto } from '../../models/input/EmailAdapterDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../auth.repository';
import { BadRequestException } from '@nestjs/common';

export class ResendingConfirmEmailCommand {
  constructor(public email: string) {}
}
@CommandHandler(ResendingConfirmEmailCommand)
export class ResendingConfirmEmailUseCase
  implements ICommandHandler<ResendingConfirmEmailCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ResendingConfirmEmailCommand): Promise<boolean> {
    const user = await this.authRepository.findByLoginOrEmail({
      email: command.email,
    });

    if (!user) return false;

    const isConfirmed =
      await this.authRepository.findConfirmationCodeUserByUserId(user.id);

    if (isConfirmed!.isConfirmed) return false;

    // const newConfirmationCode = uuidv4();
    // const newExpirationDate = add(new Date(), {
    //   minutes: 15,
    // });

    const newConfirmationCode =
      await this.authRepository.findConfirmationCodeUserByUserId(user.id);

    if (!newConfirmationCode) return false;

    newConfirmationCode.confirmationCode = uuidv4();
    newConfirmationCode.expirationDate = add(new Date(), {
      minutes: 15,
    }).toISOString();

    const result =
      await this.authRepository.newConfirmationCode(newConfirmationCode);

    const resendingConfirmEmailDto: EmailAdapterDto = {
      email: user.email,
      newCode: newConfirmationCode.confirmationCode,
    };
    try {
      await this.emailAdapter.sendNewCode(resendingConfirmEmailDto);
    } catch (error) {
      console.error(error);
      return false;
    }

    return result;
  }
}
