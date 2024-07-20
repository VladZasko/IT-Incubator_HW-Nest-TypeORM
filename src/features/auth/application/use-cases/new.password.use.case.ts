import { AuthMongoRepository } from '../../auth.mongo.repository';
import { AuthService } from '../auth.service';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../auth.repository';
import { User } from '../../../../db/entitys/user.entity';
import { NotFoundException } from '@nestjs/common';

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
    const recoveryCode = await this.authRepository.findUserByRecoveryCode(
      command.data.recoveryCode,
    );
    if (!recoveryCode) return false;
    if (recoveryCode.recoveryCode !== command.data.recoveryCode) return false;
    if (recoveryCode.expirationDate < new Date().toISOString()) return false;

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.authService._generateHash(
      command.data.newPassword,
      passwordSalt,
    );

    const updateUser: User | null = await this.authRepository.getUserById(
      recoveryCode.userId,
    );
    if (!updateUser) throw new NotFoundException('User not found');

    updateUser.passwordHash = passwordHash;
    updateUser.passwordSalt = passwordSalt;

    return await this.authRepository.updatePassword(updateUser);
  }
}
