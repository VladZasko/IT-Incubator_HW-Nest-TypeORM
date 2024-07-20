import { UsersViewModel } from '../models/output/UsersViewModel';

export const userMapper = (userDb: any): UsersViewModel => {
  console.log(userDb);
  return {
    id: userDb.id,
    login: userDb.login,
    email: userDb.email,
    createdAt: userDb.createdAt,
  };
};
