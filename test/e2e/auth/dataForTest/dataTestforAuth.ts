import {
  dataTestUserCreate01,
  dataTestUserCreate02,
} from '../../users/dataForTest/dataTestforUser';

export const dataTestUserAuth = {
  loginOrEmail: dataTestUserCreate01.login,
  password: dataTestUserCreate01.password,
};
export const dataTestUserAuth2 = {
  loginOrEmail: dataTestUserCreate02.login,
  password: dataTestUserCreate02.password,
};
