import {IsUUID, Length} from 'class-validator';

export class newPasswordModel {
  @Length(6, 20)
  newPassword: string;

  @IsUUID()
  recoveryCode: string;
}
