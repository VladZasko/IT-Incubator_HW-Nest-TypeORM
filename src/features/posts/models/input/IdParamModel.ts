import {IsMongoId, IsObject, IsUUID} from "class-validator";
import {ObjectId} from "mongodb";

export class IdParamModel {
<<<<<<< HEAD
    @IsUUID()
=======
    @IsMongoId()
>>>>>>> origin/main
    id: string;
}