import { IsUUID } from 'class-validator';

export class DeleteAllDeviceDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  deviceId: string;
}
