import * as process from 'process';

export let envFilePath = '.env';
switch (process.env.NODE_ENV) {
  case 'production':
    envFilePath = '.env.production';
    break;
  case 'testing':
    envFilePath = '.env.production';
    break;
}
