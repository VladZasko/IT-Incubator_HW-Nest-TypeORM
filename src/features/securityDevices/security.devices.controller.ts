import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Request,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { SecurityDevicesViewModel } from './models/output/securityDevicesViewModel';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';
import { SecurityDevicesRepository } from './repository/security.devices.repository';
import { SecurityDevicesQueryRepository } from './repository/security.devices.query.repository';
import { DeviceIdModel } from './models/DeviceIdModel';
import { DeleteAllDeviceDto } from './models/dto/DeleteAllDeviceDto';
import { DeleteDeviceCommand } from './application/use-cases/delete.device.use.case';
import { DeleteAllDeviceCommand } from './application/use-cases/delete.all.device.use.case';
import { CommandBus } from '@nestjs/cqrs';

@UseGuards(RefreshTokenGuard)
@Controller({ path: 'security', scope: Scope.REQUEST })
export class SecurityDevicesController {
  private readonly securityDevicesRepository: SecurityDevicesRepository;
  private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository;
  constructor(
    securityDevicesRepository: SecurityDevicesRepository,
    securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private commandBus: CommandBus,
  ) {
    this.securityDevicesRepository = securityDevicesRepository;
    this.securityDevicesQueryRepository = securityDevicesQueryRepository;
    console.log('CONTROLLER created');
  }

  @Get('devices')
  async getAllDevices(@Request() req) {
    const sessions: SecurityDevicesViewModel[] | null =
      await this.securityDevicesQueryRepository.getAllDevices(
        req.refreshTokenMeta!.userId,
      );

    if (!sessions) {
      throw new NotFoundException([
        { message: 'sessions not found', field: 'sessions' },
      ]);
    }
    return sessions;
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@Request() req, @Param() deviceId: DeviceIdModel) {
    const session = await this.securityDevicesRepository.getDevice(
      deviceId.deviceId,
    );

    if (!session) {
      throw new NotFoundException([
        { message: 'sessions not found', field: 'sessions' },
      ]);
    }
    if (req.refreshTokenMeta?.userId !== session!.userId) {
      throw new ForbiddenException([
        { message: 'not a trusted user', field: 'userId' },
      ]);
    }
    // const data = {
    //   userId: req.refreshTokenMeta!.userId,
    //   deviceId: deviceId.deviceId,
    // };

    const deleteDevice = await this.commandBus.execute(
      new DeleteDeviceCommand(deviceId.deviceId),
    );
    // const deleteDevice = await this.securityDevicesService.deleteDevice(
    //   deviceId.deviceId,
    // );

    if (!deleteDevice) {
      throw new NotFoundException([
        { message: 'sessions not found', field: 'sessions' },
      ]);
    }

    return;
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(@Request() req) {
    const data: DeleteAllDeviceDto = {
      userId: req.refreshTokenMeta!.userId,
      deviceId: req.refreshTokenMeta!.deviceId,
    };
    // const deleteAllDevice =
    //   await this.securityDevicesService.deleteAllDevice(data);
    const deleteAllDevice = await this.commandBus.execute(
      new DeleteAllDeviceCommand(data),
    );
    if (!deleteAllDevice) {
      throw new NotFoundException([
        { message: 'sessions not found', field: 'sessions' },
      ]);
    }

    return;
  }
}
