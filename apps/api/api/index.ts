import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    
    // Test route for immediate diagnostics
    expressApp.get('/health-check', (req, res) => {
      res.status(200).json({ status: 'ok', serverless: true });
    });

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { 
        cors: true,
        logger: ['error', 'warn', 'log'] 
      }
    );
    
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('SERVERLESS BOOTSTRAP ERROR:', err);
    res.status(500).json({
      error: 'Failed to initialize NestJS',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
