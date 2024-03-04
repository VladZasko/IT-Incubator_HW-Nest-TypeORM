import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply.app.settings';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
