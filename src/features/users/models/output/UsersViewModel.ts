export type UsersViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UsersViewModelGetAllUsers = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UsersViewModel[];
};

export type UsersRepoViewModel = {
  id: string;
  accountData: {
    login: string;
    email: string;
    createdAt: string;
    passwordHash: string;
    passwordSalt: string;
  };
  emailConfirmation?: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  passwordRecovery?: {
    recoveryCode: string;
    expirationDate: Date;
  };
};
