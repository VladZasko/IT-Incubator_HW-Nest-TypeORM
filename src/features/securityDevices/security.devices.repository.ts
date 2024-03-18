import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../db/schemes/token.schemes';
import { securityDevicesRepositoryMapper } from './mappers/mappers';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(RefreshTokensMetaDBType.name)
    private refreshTokenMetaModel: Model<RefreshTokensMetaDocument>,
  ) {}
  async getDevice(deviceId: string): Promise<RefreshTokensMetaDBType | null> {
    const sessions = await this.refreshTokenMetaModel.findOne({
      deviceId: deviceId,
    });

    if (!sessions) {
      return null;
    }

    return securityDevicesRepositoryMapper(sessions);
  }

  async deleteDevice(deleteData: any): Promise<boolean> {
    const foundDevice = await this.refreshTokenMetaModel.deleteOne({
      deviceId: deleteData.deviceId,
    });

    if (!foundDevice) {
      return false;
    }

    return !!foundDevice.deletedCount;
  }

  async deleteAllDevice(deleteData: any): Promise<boolean> {
    const foundDevice = await this.refreshTokenMetaModel.deleteMany({
      userId: deleteData.userId,
      deviceId: {
        $ne: deleteData.deviceId,
      },
    });

    return !!foundDevice.deletedCount;
  }
}
