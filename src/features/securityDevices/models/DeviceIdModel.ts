import {IsUUID} from "class-validator";

export class DeviceIdModel {
    @IsUUID()
    deviceId: string;
}