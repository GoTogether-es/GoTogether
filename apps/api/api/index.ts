import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const VERSION = '0.1.0-alpha.13';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

let cachedExpressApp: any;

async function bootstrap() {
  if (!cachedExpressApp) {
    const expressApp = express();

    expressApp.get('/server/health-check', (_req, res) => {
      res.status(200).json({ status: 'ok', runtime: 'Vercel Node.js', version: VERSION });
    });

    expressApp.get('/server/version', (_req, res) => {
      res.status(200).json({ version: VERSION });
    });

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { cors: true, logger: ['error', 'warn', 'log'] }
    );

    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await nestApp.init();
    cachedExpressApp = expressApp;
  }
  return cachedExpressApp;
}

export default async (req: any, res: any) => {
  const origin = req.headers.origin || '';

  if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (err: unknown) {
    console.error('NESTJS BOOTSTRAP ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'Unknown error',
        version: VERSION
      });
    }
  }
};
