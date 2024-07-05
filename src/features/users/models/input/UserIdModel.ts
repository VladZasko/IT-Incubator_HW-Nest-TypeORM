import {IsUUID} from "class-validator";

export class UserIdModel {
    @IsUUID()
    userId: string;
}