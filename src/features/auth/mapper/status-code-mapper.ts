import { UsersViewModel } from '../../users/models/output/UsersViewModel';
import { BadRequestException } from '@nestjs/common';
import { Result } from '../utils/result.type';

export function mapServiceCodeToHttpStatus(
  resultCode: Result<UsersViewModel | null>,
) {
  switch (resultCode.resultCode) {
    case 0:
      return resultCode.data;
    case 20:
      throw new BadRequestException([
        { message: 'login already exist', field: 'login' },
      ]);
    case 21:
      throw new BadRequestException([
        { message: 'email already exist', field: 'email' },
      ]);

    default:
      return 500;
  }
}
