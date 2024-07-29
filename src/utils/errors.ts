export type Error = { message: string; field: string };

export type ErrorMessage = Array<Error>;
export const ERRORS_MESSAGES = {
  BLOG_NAME: { message: 'Incorrect name!', field: 'name' },
  BLOG_DESCRIPTION: { message: 'Incorrect description!', field: 'description' },
  BLOG_WEBSITE_URL: { message: 'Incorrect websiteUrl!', field: 'websiteUrl' },

  POST_TITLE: { message: 'Incorrect title!', field: 'title' },
  POST_SHORT_DESCRIPTION: {
    message: 'Incorrect shortDescription!',
    field: 'shortDescription',
  },
  POST_CONTENT: { message: 'Incorrect content', field: 'content' },
  POST_BLOGID: { message: 'Incorrect blogId', field: 'blogId' },

  USER_LOGIN: { message: 'Incorrect login!', field: 'login' },
  USER_PASSWORD: { message: 'Incorrect password!', field: 'password' },
  USER_EMAIL: { message: 'Incorrect email!', field: 'email' },

  AUTH_LOGIN_OR_EMAIL: { message: 'empty loginOrEmail', field: 'loginOrEmail' },
  AUTH_PASSWORD: { message: 'empty password', field: 'password' },
  AUTH_CODE: { message: 'Incorrect code!', field: 'code' },
  AUTH_RECOVERY_CODE: {
    message: 'recoveryCode must be a UUID',
    field: 'recoveryCode',
  },

  FEEDBACKS_CONTENT: { message: 'Incorrect content!', field: 'content' },
};
