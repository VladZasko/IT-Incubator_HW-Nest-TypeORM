import { Injectable } from '@nestjs/common';
import { SecurityDevicesViewModel } from '../models/output/securityDevicesViewModel';
import { securityDevicesMapper } from '../mappers/mappers';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RefreshTokenMeta } from '../../../db/entitys/refresh.token.meta.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(RefreshTokenMeta)
    private readonly refreshTokenMetaRepository: Repository<RefreshTokenMeta>,
  ) {}
  async getAllDevices(
    userId: string,
  ): Promise<SecurityDevicesViewModel[] | null> {
    const result = await this.refreshTokenMetaRepository
      .createQueryBuilder('u')
      .where('u.userId = :userId', { userId })
      .getMany();

    return result.map(securityDevicesMapper);
  }
}
