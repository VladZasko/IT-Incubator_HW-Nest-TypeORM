import { UsersRepoViewModel } from '../../users/models/output/UsersViewModel';

export const userAuthDBMapper = (userDb: any): UsersRepoViewModel => {
  return {
    id: userDb.id,
    accountData: {
      login: userDb.login,
      email: userDb.email,
      createdAt: userDb.createdAt,
      passwordHash: userDb.passwordHash,
      passwordSalt: userDb.passwordSalt,
    },
  };
};
