import { ConfigModule } from '@nestjs/config';
import { envFilePath } from '../detect-env-file';
import { getConfiguration } from './configuration';

export const getConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath,
  load: [getConfiguration],
});
