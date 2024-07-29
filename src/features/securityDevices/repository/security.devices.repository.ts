import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { RefreshTokenMeta } from '../../../db/entitys/refresh.token.meta.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(RefreshTokenMeta)
    private readonly refreshTokenMetaRepository: Repository<RefreshTokenMeta>,
  ) {}
  async getDevice(deviceId: string): Promise<RefreshTokenMeta | null> {
    return this.refreshTokenMetaRepository.findOneBy({
      deviceId: deviceId,
    });
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const deleteRefreshTokensMeta =
      await this.refreshTokenMetaRepository.delete({ deviceId: deviceId });

    return !!deleteRefreshTokensMeta.affected;
  }

  async deleteAllDevice(deleteData: any): Promise<boolean> {
    const deleteRefreshTokensMeta =
      await this.refreshTokenMetaRepository.delete({
        userId: deleteData.userId,
        deviceId: Not(deleteData.deviceId),
      });

    return !!deleteRefreshTokensMeta.affected;
  }
}
