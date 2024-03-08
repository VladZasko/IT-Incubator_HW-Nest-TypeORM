import { ResultCode } from '../../users/utils/result-code';

export type Result<T> = {
  resultCode: ResultCode;
  errorMessage?: {
    message: string;
    field: string;
  };
  data: T;
};
