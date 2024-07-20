import { WithId } from 'mongodb';
import { RefreshTokensMetaDBType } from '../../../db/schemes/token.schemes';
import { SecurityDevicesViewModel } from '../models/output/securityDevicesViewModel';

export const securityDevicesMapper = (
  securityDevicesDb: any,
): SecurityDevicesViewModel => {
  return {
    ip: securityDevicesDb.ip,
    title: securityDevicesDb.deviceName,
    lastActiveDate: securityDevicesDb.issuetAt,
    deviceId: securityDevicesDb.deviceId,
  };
};

export const securityDevicesRepositoryMapper = (
  securityDevicesDb: any,
): RefreshTokensMetaDBType => {
  return {
    ip: securityDevicesDb.ip,
    issuedAt: securityDevicesDb.issuetAt,
    deviceId: securityDevicesDb.deviceId,
    deviseName: securityDevicesDb.deviceName,
    userId: securityDevicesDb.userId,
  };
};
