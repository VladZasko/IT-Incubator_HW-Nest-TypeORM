import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Scope } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../repository/security.devices.repository';

export class DeleteDeviceCommand {
  constructor(public readonly deviceId: string) {}
}

@Injectable({ scope: Scope.DEFAULT })
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  private readonly securityDevicesRepository: SecurityDevicesRepository;
  constructor(securityDevicesRepository: SecurityDevicesRepository) {
    this.securityDevicesRepository = securityDevicesRepository;
    console.log('DELETE DEVICE USE CASE created');
  }
  async execute(command: DeleteDeviceCommand): Promise<boolean> {
    return await this.securityDevicesRepository.deleteDevice(command.deviceId);
  }
}
