import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../db/schemes/token.schemes';
import { SecurityDevicesViewModel } from './models/output/securityDevicesViewModel';
import { securityDevicesMapper } from './mappers/mappers';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(RefreshTokensMetaDBType.name)
    private refreshTokenMetaModel: Model<RefreshTokensMetaDocument>,
  ) {}
  async getAllDevices(
    userId: string,
  ): Promise<SecurityDevicesViewModel[] | null> {
    const sessions = await this.refreshTokenMetaModel
      .find({
        userId: { $regex: userId },
      })
      .lean();

    if (!sessions) {
      return null;
    }

    return sessions.map(securityDevicesMapper);
  }
}
