export type EmailAdapterDto = {
  email: string;
  confirmationCode?: string;
  newCode?: string;
  recoveryCode?: string;
};
