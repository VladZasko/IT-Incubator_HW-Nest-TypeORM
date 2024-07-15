import {IsNotEmpty, Length, Matches} from "class-validator";

export class LoginAuthUserModel {
  @IsNotEmpty()
  loginOrEmail: string;

  @IsNotEmpty()
  @Length(6, 20)
  @Matches(`^[a-zA-Z0-9_-]*$`)
  password: string;
}

export class LoginOrEmailModel {
  login?: string;
  email?: string;
}
