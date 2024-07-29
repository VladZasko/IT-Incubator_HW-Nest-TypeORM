import { SecurityDevicesViewModel } from '../models/output/securityDevicesViewModel';

export const securityDevicesMapper = (
  securityDevicesDb: any,
): SecurityDevicesViewModel => {
  return {
    ip: securityDevicesDb.ip,
    title: securityDevicesDb.deviceName,
    lastActiveDate: securityDevicesDb.issuedAt,
    deviceId: securityDevicesDb.deviceId,
  };
};
