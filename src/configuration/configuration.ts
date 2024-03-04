import * as process from 'process';

export const getConfiguration = () => {
  return {
    ENV: process.env.NODE_ENV,
    auth: {
      AUTH_LOGIN: process.env.AUTH_LOGIN || 'admin',
      AUTH_PASSWORD: process.env.AUTH_PASSWORD || 'qwerty',
      JWT_SECRET: process.env.JWT_SECRET || '123',
      ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME || '3m',
      REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME || '6m',
    },
    db: {
      MONGO_URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    },
    PORT: process.env.PORT || 5000,
  };
};
