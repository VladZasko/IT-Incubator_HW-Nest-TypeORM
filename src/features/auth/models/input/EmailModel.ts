import {IsEmail, IsNotEmpty} from "class-validator";

export class LoginAuthUserModel {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}