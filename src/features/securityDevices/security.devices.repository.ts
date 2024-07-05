import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../db/schemes/token.schemes';
import { securityDevicesRepositoryMapper } from './mappers/mappers';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class SecurityDevicesRepository {
  constructor(
      @InjectDataSource()
      protected dataSource: DataSource,
  ) {}
  async getDevice(deviceId: string): Promise<RefreshTokensMetaDBType | null> {
    const query = `
    SELECT "issuetAt", "deviceId", "ip", "deviceName", "userId", "id"
        FROM public."RefreshTokenMeta"
        WHERE "deviceId" = $1
    `
    const result = await this.dataSource.query(
        query,[
          deviceId
        ]);

    if (!result[0]) {
      return null;
    }

    return securityDevicesRepositoryMapper(result[0]);
  }

  async deleteDevice(deleteData: any): Promise<boolean> {
    const query = `
        DELETE FROM public."RefreshTokenMeta"
            WHERE "deviceId" = $1
            `

    await this.dataSource.query(
        query,[
          deleteData.deviceId,
        ]);

      return true;

  }

  async deleteAllDevice(deleteData: any): Promise<boolean> {
    const query = `
        DELETE FROM public."RefreshTokenMeta"
        WHERE "userId" = $1 AND "deviceId" != $2;
            `

    await this.dataSource.query(
        query, [
          deleteData.userId,
          deleteData.deviceId,
        ]);

    return true;
  }
}
