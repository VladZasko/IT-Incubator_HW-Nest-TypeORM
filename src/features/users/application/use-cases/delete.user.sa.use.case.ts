import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../repository/users.repository';
import { Injectable, Scope } from '@nestjs/common';

export class DeleteUserSaCommand {
  constructor(public id: string) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeleteUserSaCommand)
export class DeleteUserSaUseCase
  implements ICommandHandler<DeleteUserSaCommand>
{
  private readonly usersRepository: UsersRepository;
  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
    console.log('DELETE USER SA USE CASE created');
  }
  async execute(command: DeleteUserSaCommand): Promise<boolean> {
    return await this.usersRepository.deleteUserById(command.id);
  }
}
