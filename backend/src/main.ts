import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(process.env.API_PREFIX || '/api');
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();