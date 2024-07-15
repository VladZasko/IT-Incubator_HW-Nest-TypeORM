import {IsUUID} from "class-validator";

export class BlogIdModel {
    @IsUUID()
    blogId: string;

    @IsUUID()
    postId?: string;
}