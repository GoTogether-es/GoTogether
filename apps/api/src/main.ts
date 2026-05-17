import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './modules/app/app.module';
import { GlobalExceptionFilter } from './modules/app/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.NEXT_PUBLIC_APP_URL || ''].filter(Boolean)
          : true,
      credentials: true,
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GoTogether API')
    .setDescription('API para la plataforma de acompañamiento GoTogether')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));
  await app.listen(4000);
}

bootstrap();
