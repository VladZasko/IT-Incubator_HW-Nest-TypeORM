import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../db/schemes/token.schemes';
import { SecurityDevicesViewModel } from './models/output/securityDevicesViewModel';
import {securityDevicesMapper, securityDevicesRepositoryMapper} from './mappers/mappers';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async getAllDevices(
    userId: string,
  ): Promise<SecurityDevicesViewModel[] | null> {
    const query = `
    SELECT "issuetAt", "deviceId", "ip", "deviceName", "userId", "id"
        FROM public."RefreshTokenMeta"
        WHERE "userId" = $1
    `
    const result = await this.dataSource.query(
        query,[
          userId
        ]);

    if (!result[0]) {
      return null;
    }

    return result.map(securityDevicesMapper);
  }

}
