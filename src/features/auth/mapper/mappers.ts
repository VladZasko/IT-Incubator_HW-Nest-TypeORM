import { WithId } from 'mongodb';
import { UsersAuthViewModel } from '../models/output/UsersViewModel';
import { UsersRepoViewModel } from '../../users/models/output/UsersViewModel';
import { UserDBType } from '../../../db/schemes/users.schemes';

export const userAuthMapper = (userDb: any): UsersAuthViewModel => {
  return {
    id: userDb.id,
    login: userDb.login,
    email: userDb.email,
    createdAt: userDb.createdAt,
  };
};

export const userAuthDBMapper = (
  userDb: any,
): UsersRepoViewModel => {
  return {
    id: userDb.id,
    accountData: {
      login: userDb.login,
      email: userDb.email,
      createdAt: userDb.createdAt,
      passwordHash: userDb.passwordHash,
      passwordSalt: userDb.passwordSalt,
    },
    /*    emailConfirmation: {
      confirmationCode: userDb.emailConfirmation!.confirmationCode,
      expirationDate: userDb.emailConfirmation!.expirationDate,
      isConfirmed: userDb.emailConfirmation!.isConfirmed,
    },*/
  };
};
