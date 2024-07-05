import {IsNotEmpty} from "class-validator";

export class LoginAuthUserModel {
  @IsNotEmpty()
  loginOrEmail: string;

  @IsNotEmpty()
  password: string;
}

export class LoginOrEmailModel {
  login?: string;
  email?: string;
}
