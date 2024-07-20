import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security.devices.repository';
@Injectable()
export class SecurityDevicesService {
  constructor(protected securityDevicesRepository: SecurityDevicesRepository) {}
  async deleteDevice(deviceId: string): Promise<boolean> {
    return await this.securityDevicesRepository.deleteDevice(deviceId);
  }
  async deleteAllDevice(deleteData: any): Promise<boolean> {
    return await this.securityDevicesRepository.deleteAllDevice(deleteData);
  }
}
