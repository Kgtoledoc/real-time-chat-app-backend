import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
  }); 

  app.use('/uploads', express.static(join(__dirname, '..','uploads')));
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
