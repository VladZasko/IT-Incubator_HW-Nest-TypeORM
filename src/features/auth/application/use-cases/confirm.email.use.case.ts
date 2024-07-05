import { AuthMongoRepository } from '../../auth.mongo.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {AuthRepository} from "../../auth.repository";
import {CreatePostBlogModel} from "../../models/input/ConfirmCodeModel";
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
    if (user.isConfirmed) return false;
    if (user.confirmationCode !== command.code) return false;
    if (user.expirationDate < new Date()) return false;

    return await this.authRepository.updateConfirmation(user.userId);
  }
}
