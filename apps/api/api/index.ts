import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const VERSION = '0.1.0-alpha.9';

let cachedExpressApp: any;

async function bootstrap() {
  if (!cachedExpressApp) {
    const expressApp = express();
    
    // Explicit health check route outside NestJS
    expressApp.get('/server/health-check', (req, res) => {
      res.status(200).json({ status: 'ok', runtime: 'Vercel Node.js', version: VERSION });
    });

    // Version endpoint
    expressApp.get('/server/version', (req, res) => {
      res.status(200).json({ version: VERSION });
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
    
    // Important: Initialize NestJS without starting the listener
    await nestApp.init();
    cachedExpressApp = expressApp;
  }
  return cachedExpressApp;
}

export default async (req: any, res: any) => {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (err: any) {
    console.error('NESTJS BOOTSTRAP ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        version: VERSION
      });
    }
  }
};
