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
  UseGuards,
} from '@nestjs/common';
import { SecurityDevicesViewModel } from './models/output/securityDevicesViewModel';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';
import { SecurityDevicesService } from './application/security.devices.servis';
import { SecurityDevicesRepository } from './repository/security.devices.repository';
import { SecurityDevicesQueryRepository } from './repository/security.devices.query.repository';
import { DeviceIdModel } from './models/DeviceIdModel';

@UseGuards(RefreshTokenGuard)
@Controller('security')
export class SecurityDevicesController {
  constructor(
    protected securityDevicesService: SecurityDevicesService,
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}

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
    const deleteDevice = await this.securityDevicesService.deleteDevice(
      deviceId.deviceId,
    );

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
    const data = {
      userId: req.refreshTokenMeta!.userId,
      deviceId: req.refreshTokenMeta!.deviceId,
    };
    const deleteAllDevice =
      await this.securityDevicesService.deleteAllDevice(data);

    if (!deleteAllDevice) {
      throw new NotFoundException([
        { message: 'sessions not found', field: 'sessions' },
      ]);
    }

    return;
  }
}
