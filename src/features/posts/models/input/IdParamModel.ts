import {IsMongoId, IsObject, IsUUID} from "class-validator";
import {ObjectId} from "mongodb";

export class IdParamModel {
    @IsUUID()
    @IsMongoId()
    id: string;
}