import {IsUUID} from "class-validator";

export class CreatePostBlogModel {
    @IsUUID()
    code: string;
}