import { Length } from 'class-validator';

export class newPasswordModel {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
