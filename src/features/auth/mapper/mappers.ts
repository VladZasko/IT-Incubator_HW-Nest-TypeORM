import { WithId } from 'mongodb';
import { UsersAuthViewModel } from '../models/output/UsersViewModel';
import { UsersRepoViewModel } from '../../users/models/output/UsersViewModel';
import { UserDBType } from '../../../db/schemes/users.schemes';

export const userAuthMapper = (userDb: any): UsersAuthViewModel => {
  return {
    id: userDb._id.toString(),
    login: userDb.accountData.login,
    email: userDb.accountData.email,
    createdAt: userDb.accountData.createdAt,
  };
};

export const userAuthDBMapper = (
  userDb: WithId<UserDBType>,
): UsersRepoViewModel => {
  return {
    id: userDb._id.toString(),
    accountData: {
      login: userDb.accountData.login,
      email: userDb.accountData.email,
      createdAt: userDb.accountData.createdAt,
      passwordHash: userDb.accountData.passwordHash,
      passwordSalt: userDb.accountData.passwordSalt,
    },
    /*    emailConfirmation: {
      confirmationCode: userDb.emailConfirmation!.confirmationCode,
      expirationDate: userDb.emailConfirmation!.expirationDate,
      isConfirmed: userDb.emailConfirmation!.isConfirmed,
    },*/
  };
};
