import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../repository/security.devices.repository';
import { DeleteAllDeviceDto } from '../../models/dto/DeleteAllDeviceDto';

export class DeleteAllDeviceCommand {
  constructor(public readonly deleteData: DeleteAllDeviceDto) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeleteAllDeviceCommand)
export class DeleteAllDeviceUseCase
  implements ICommandHandler<DeleteAllDeviceCommand>
{
  private readonly securityDevicesRepository: SecurityDevicesRepository;
  constructor(securityDevicesRepository: SecurityDevicesRepository) {
    this.securityDevicesRepository = securityDevicesRepository;
    console.log('DELETE ALL DEVICE USE CASE created');
  }
  async execute(command: DeleteAllDeviceCommand): Promise<boolean> {
    return await this.securityDevicesRepository.deleteAllDevice(
      command.deleteData,
    );
  }
}
